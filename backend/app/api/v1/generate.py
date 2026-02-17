"""
Video generation API endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional
from app.core.security import decode_access_token
from app.db.supabase import supabase, supabase_admin
from app.services.ai_service import dashscope_service, deepseek_service

router = APIRouter(prefix="/generate", tags=["Video Generation"])
security = HTTPBearer()


class VideoGenerateRequest(BaseModel):
    """Request model for video generation."""
    project_id: str
    prompt: str = Field(..., min_length=1, max_length=500)
    model_type: str = Field(..., pattern="^(seedance|wan2.6-i2v)$")
    image_url: Optional[str] = None  # Required for wan2.6-i2v
    duration: int = Field(default=4, ge=1, le=60)
    optimize_prompt: bool = Field(default=True)


class VideoGenerateResponse(BaseModel):
    """Response model for video generation."""
    task_id: str
    generation_task_id: str
    status: str
    message: str


async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Get current user ID from token."""
    import jwt
    from app.core.config import settings

    token = credentials.credentials

    try:
        # Verify JWT signature with secret key
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: no user ID"
            )

        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


async def process_video_generation(
    generation_task_id: str,
    project_id: str,
    prompt: str,
    model_type: str,
    image_url: Optional[str],
    duration: int
):
    """Background task to process video generation."""
    try:
        # Update task status to processing (use admin client)
        supabase_admin.table("generation_tasks").update({
            "status": "processing"
        }).eq("id", generation_task_id).execute()

        # Generate video based on model type
        if model_type == "seedance":
            # TODO: Seedance 2.0 requires separate API key (waiting for user to provide)
            raise ValueError("Seedance 2.0 is not yet configured. Please use wan2.6-i2v model.")
        elif model_type == "wan2.6-i2v":
            if not image_url:
                raise ValueError("image_url is required for wan2.6-i2v model")
            result = await dashscope_service.generate_image_to_video_wan(
                image_url=image_url,
                prompt=prompt,
                duration=duration
            )
        else:
            raise ValueError(f"Unsupported model type: {model_type}")

        task_id = result.get("output", {}).get("task_id")
        if not task_id:
            raise Exception("Failed to get task_id from AI service")

        # Update generation task with AI task_id (use admin client)
        supabase_admin.table("generation_tasks").update({
            "config": {"ai_task_id": task_id}
        }).eq("id", generation_task_id).execute()

        # Wait for completion (with timeout)
        final_result = await dashscope_service.wait_for_task_completion(
            task_id=task_id,
            max_wait_time=300,
            poll_interval=5
        )

        # Extract video URL from result
        video_url = final_result.get("output", {}).get("video_url")
        if not video_url:
            raise Exception("No video URL in result")

        # Update project with video URL
        supabase.table("projects").update({
            "video_url": video_url,
            "status": "completed"
        }).eq("id", project_id).execute()

        # Update generation task to completed (use admin client)
        supabase_admin.table("generation_tasks").update({
            "status": "completed",
            "result_url": video_url
        }).eq("id", generation_task_id).execute()

    except Exception as e:
        # Update task status to failed (use admin client)
        supabase_admin.table("generation_tasks").update({
            "status": "failed",
            "error_message": str(e)
        }).eq("id", generation_task_id).execute()

        # Update project status to failed
        supabase.table("projects").update({
            "status": "failed"
        }).eq("id", project_id).execute()


@router.post("/video", response_model=VideoGenerateResponse)
async def generate_video(
    request: VideoGenerateRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate video using AI models.

    Supports:
    - Seedance 2.0: Text-to-video generation
    - Wan2.6-I2V: Image-to-video generation
    """
    try:
        # Debug: Print user_id and project_id
        print(f"[DEBUG] user_id from token: {user_id}")
        print(f"[DEBUG] project_id from request: {request.project_id}")
        print(f"[DEBUG] image_url from request: {request.image_url}")
        print(f"[DEBUG] model_type from request: {request.model_type}")

        # Verify project ownership
        project_response = supabase_admin.table("projects") \
            .select("*") \
            .eq("id", request.project_id) \
            .eq("user_id", user_id) \
            .execute()

        print(f"[DEBUG] Query result count: {len(project_response.data) if project_response.data else 0}")

        if not project_response.data or len(project_response.data) == 0:
            # Check if project exists with different user_id
            project_check = supabase_admin.table("projects") \
                .select("user_id") \
                .eq("id", request.project_id) \
                .execute()

            if project_check.data and len(project_check.data) > 0:
                actual_user_id = project_check.data[0].get("user_id")
                print(f"[DEBUG] Project exists but with different user_id: {actual_user_id}")
                print(f"[DEBUG] Expected user_id: {user_id}")
            else:
                print(f"[DEBUG] Project does not exist in database")

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Check user credits (use admin client to bypass RLS)
        profile_response = supabase_admin.table("profiles") \
            .select("credits") \
            .eq("id", user_id) \
            .execute()

        # If profile doesn't exist, create it with default credits
        if not profile_response.data or len(profile_response.data) == 0:
            try:
                supabase_admin.table("profiles").insert({
                    "id": user_id,
                    "credits": 100
                }).execute()
                credits = 100
            except Exception as e:
                # Profile might have been created by another request, try to fetch again
                profile_response = supabase_admin.table("profiles") \
                    .select("credits") \
                    .eq("id", user_id) \
                    .execute()
                if profile_response.data and len(profile_response.data) > 0:
                    credits = profile_response.data[0].get("credits", 0)
                else:
                    raise e
        else:
            credits = profile_response.data[0].get("credits", 0)
        credits_cost = 10  # Base cost

        if credits < credits_cost:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient credits. Required: {credits_cost}, Available: {credits}"
            )

        # Optimize prompt if requested
        final_prompt = request.prompt
        if request.optimize_prompt:
            final_prompt = await deepseek_service.optimize_prompt(request.prompt)

        # Create generation task (use admin client to bypass RLS)
        task_response = supabase_admin.table("generation_tasks").insert({
            "project_id": request.project_id,
            "user_id": user_id,
            "model_name": f"{request.model_type}-{request.duration}s",
            "status": "pending",
            "config": {
                "original_prompt": request.prompt,
                "optimized_prompt": final_prompt,
                "model_type": request.model_type,
                "duration": request.duration,
                "image_url": request.image_url,
                "credits_cost": credits_cost
            }
        }).execute()

        generation_task_id = task_response.data[0]["id"]

        # Start background task for video generation
        background_tasks.add_task(
            process_video_generation,
            generation_task_id=generation_task_id,
            project_id=request.project_id,
            prompt=final_prompt,
            model_type=request.model_type,
            image_url=request.image_url,
            duration=request.duration
        )

        return VideoGenerateResponse(
            task_id="pending",  # Will be updated by background task
            generation_task_id=generation_task_id,
            status="pending",
            message="Video generation started. Check task status for progress."
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/tasks/{task_id}")
async def get_generation_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get generation task status."""
    try:
        response = supabase.table("generation_tasks") \
            .select("*") \
            .eq("id", task_id) \
            .eq("user_id", user_id) \
            .single() \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        return response.data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

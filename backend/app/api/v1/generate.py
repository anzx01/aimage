"""
Video generation API endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional
from app.core.security import decode_access_token
from app.db.supabase import supabase
from app.services.ai_service import dashscope_service, deepseek_service

router = APIRouter(prefix="/generate", tags=["Video Generation"])
security = HTTPBearer()


class VideoGenerateRequest(BaseModel):
    """Request model for video generation."""
    project_id: str
    prompt: str = Field(..., min_length=1, max_length=500)
    model_type: str = Field(..., pattern="^(seedance|wan2.6-i2v)$")
    image_url: Optional[str] = None  # Required for wan2.6-i2v
    duration: int = Field(default=4, ge=1, le=10)
    optimize_prompt: bool = Field(default=True)


class VideoGenerateResponse(BaseModel):
    """Response model for video generation."""
    task_id: str
    generation_task_id: str
    status: str
    message: str


async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Get current user ID from token."""
    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    return user_id


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
        # Update task status to processing
        supabase.table("generation_tasks").update({
            "status": "processing",
            "started_at": "now()"
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

        # Update generation task with AI task_id
        supabase.table("generation_tasks").update({
            "metadata": {"ai_task_id": task_id}
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
            "status": "completed",
            "completed_at": "now()"
        }).eq("id", project_id).execute()

        # Update generation task to completed
        supabase.table("generation_tasks").update({
            "status": "completed",
            "progress": 100,
            "completed_at": "now()"
        }).eq("id", generation_task_id).execute()

    except Exception as e:
        # Update task status to failed
        supabase.table("generation_tasks").update({
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
        # Verify project ownership
        project_response = supabase.table("projects") \
            .select("*") \
            .eq("id", request.project_id) \
            .eq("user_id", user_id) \
            .single() \
            .execute()

        if not project_response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Check user credits
        profile_response = supabase.table("profiles") \
            .select("credits") \
            .eq("id", user_id) \
            .single() \
            .execute()

        credits = profile_response.data.get("credits", 0)
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

        # Create generation task (this will auto-deduct credits via trigger)
        task_response = supabase.table("generation_tasks").insert({
            "project_id": request.project_id,
            "user_id": user_id,
            "model_version": f"{request.model_type}-{request.duration}s",
            "credits_cost": credits_cost,
            "status": "pending",
            "metadata": {
                "original_prompt": request.prompt,
                "optimized_prompt": final_prompt,
                "model_type": request.model_type,
                "duration": request.duration,
                "image_url": request.image_url
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

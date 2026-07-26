"""
Video generation API endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional
import logging
from app.db.supabase import supabase_admin
from app.api.deps import get_current_user_id
from app.services.ai_service import dashscope_service, deepseek_service
from app.services.credits_service import deduct_credits, refund_credits

router = APIRouter(prefix="/generate", tags=["Video Generation"])
logger = logging.getLogger(__name__)

CREDITS_COST = 10


class VideoGenerateRequest(BaseModel):
    """Request model for video generation."""
    project_id: str
    prompt: str = Field(..., min_length=1, max_length=500)
    model_type: str = Field(..., pattern="^(seedance|wan2.6-i2v)$")
    image_url: Optional[str] = None
    duration: int = Field(default=4, ge=1, le=60)
    optimize_prompt: bool = Field(default=True)


class VideoGenerateResponse(BaseModel):
    """Response model for video generation."""
    task_id: str
    generation_task_id: str
    status: str
    message: str


async def process_video_generation(
    generation_task_id: str,
    project_id: str,
    user_id: str,
    prompt: str,
    model_type: str,
    image_url: Optional[str],
    duration: int
):
    """Background task to process video generation."""
    try:
        supabase_admin.table("generation_tasks").update({
            "status": "processing"
        }).eq("id", generation_task_id).execute()

        if model_type == "seedance":
            raise ValueError(
                "Seedance 2.0 is not yet configured. "
                "Please provide the Seedance API key or use the wan2.6-i2v model."
            )
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

        supabase_admin.table("generation_tasks").update({
            "config": {"ai_task_id": task_id}
        }).eq("id", generation_task_id).execute()

        final_result = await dashscope_service.wait_for_task_completion(
            task_id=task_id,
            max_wait_time=300,
            poll_interval=5
        )

        video_url = final_result.get("output", {}).get("video_url")
        if not video_url:
            raise Exception("No video URL in result")

        supabase_admin.table("projects").update({
            "video_url": video_url,
            "status": "completed"
        }).eq("id", project_id).execute()

        supabase_admin.table("generation_tasks").update({
            "status": "completed",
            "result_url": video_url
        }).eq("id", generation_task_id).execute()

    except Exception as e:
        logger.error(f"Video generation failed for task {generation_task_id}: {e}", exc_info=True)

        supabase_admin.table("generation_tasks").update({
            "status": "failed",
            "error_message": str(e)
        }).eq("id", generation_task_id).execute()

        supabase_admin.table("projects").update({
            "status": "failed"
        }).eq("id", project_id).execute()

        # Refund credits on failure
        try:
            refund_credits(
                user_id=user_id,
                amount=CREDITS_COST,
                description=f"Refund for failed video generation: {str(e)[:200]}",
                reference_id=generation_task_id,
                reference_type="generation_task",
            )
            logger.info(f"Refunded {CREDITS_COST} credits to user {user_id}")
        except Exception as refund_error:
            logger.error(f"Failed to refund credits: {refund_error}", exc_info=True)


@router.post("/video", response_model=VideoGenerateResponse)
async def generate_video(
    request: VideoGenerateRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id)
):
    """
    Generate video using AI models.

    Supports:
    - Seedance 2.0: Text-to-video (not yet configured)
    - Wan2.6-I2V: Image-to-video generation
    """
    try:
        # Verify project ownership
        project_response = (
            supabase_admin.table("projects")
            .select("*")
            .eq("id", request.project_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not project_response.data or len(project_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        # Deduct credits via RPC (checks balance + writes transaction atomically)
        try:
            deduct_credits(
                user_id=user_id,
                amount=CREDITS_COST,
                description=f"Video generation: {request.prompt[:50]}",
                reference_id=request.project_id,
                reference_type="project",
            )
        except RuntimeError as e:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient credits or deduction failed: {e}"
            )

        # Optimize prompt if requested
        final_prompt = request.prompt
        if request.optimize_prompt:
            try:
                final_prompt = await deepseek_service.optimize_prompt(request.prompt)
            except Exception as e:
                logger.warning(f"Prompt optimization failed, using original: {e}")

        # Create generation task
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
                "credits_cost": CREDITS_COST
            }
        }).execute()

        generation_task_id = task_response.data[0]["id"]

        background_tasks.add_task(
            process_video_generation,
            generation_task_id=generation_task_id,
            project_id=request.project_id,
            user_id=user_id,
            prompt=final_prompt,
            model_type=request.model_type,
            image_url=request.image_url,
            duration=request.duration
        )

        return VideoGenerateResponse(
            task_id="pending",
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
        response = (
            supabase_admin.table("generation_tasks")
            .select("*")
            .eq("id", task_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )

        return response.data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching task: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

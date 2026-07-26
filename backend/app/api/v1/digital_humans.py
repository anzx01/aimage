"""
Digital humans API endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from typing import List
from pydantic import BaseModel, Field
import logging
from app.db.supabase import supabase_admin
from app.api.deps import get_current_user_id
from app.schemas import DigitalHumanCreate, DigitalHumanResponse
from app.services.ai_service import dashscope_service
from app.services.credits_service import deduct_credits, refund_credits

router = APIRouter(prefix="/digital-humans", tags=["Digital Humans"])
logger = logging.getLogger(__name__)

CREDITS_COST = 10


class VideoGenerateRequest(BaseModel):
    """Request model for digital human video generation."""
    text: str = Field(..., min_length=1, max_length=1000)
    duration: int = Field(default=10, ge=5, le=60)


@router.post("", response_model=DigitalHumanResponse, status_code=status.HTTP_201_CREATED)
async def create_digital_human(
    digital_human: DigitalHumanCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new digital human."""
    try:
        response = supabase_admin.table("digital_humans").insert({
            "user_id": user_id,
            "name": digital_human.name,
            "avatar_url": digital_human.avatar_url,
            "digital_human_type": digital_human.digital_human_type,
            "voice_config": digital_human.voice_config or {},
            "appearance_config": digital_human.appearance_config or {},
            "is_public": False,
            "metadata": {}
        }).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create digital human"
            )

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("", response_model=List[DigitalHumanResponse])
async def list_digital_humans(
    user_id: str = Depends(get_current_user_id)
):
    """Get all digital humans for the current user."""
    try:
        response = (
            supabase_admin.table("digital_humans")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/{digital_human_id}", response_model=DigitalHumanResponse)
async def get_digital_human(
    digital_human_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific digital human by ID."""
    try:
        response = (
            supabase_admin.table("digital_humans")
            .select("*")
            .eq("id", digital_human_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital human not found"
            )

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.put("/{digital_human_id}", response_model=DigitalHumanResponse)
async def update_digital_human(
    digital_human_id: str,
    digital_human: DigitalHumanCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a digital human."""
    try:
        check_response = (
            supabase_admin.table("digital_humans")
            .select("id")
            .eq("id", digital_human_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital human not found"
            )

        response = supabase_admin.table("digital_humans").update({
            "name": digital_human.name,
            "avatar_url": digital_human.avatar_url,
            "digital_human_type": digital_human.digital_human_type,
            "voice_config": digital_human.voice_config or {},
            "appearance_config": digital_human.appearance_config or {}
        }).eq("id", digital_human_id).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update digital human"
            )

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{digital_human_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_digital_human(
    digital_human_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a digital human."""
    try:
        check_response = (
            supabase_admin.table("digital_humans")
            .select("id")
            .eq("id", digital_human_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital human not found"
            )

        supabase_admin.table("digital_humans") \
            .delete() \
            .eq("id", digital_human_id) \
            .execute()

        return None

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


async def process_digital_human_video(
    digital_human_id: str,
    user_id: str,
    text: str,
    duration: int
):
    """Background task to process digital human video generation."""
    try:
        logger.info(f"Starting digital human video generation for user {user_id}")

        dh_response = (
            supabase_admin.table("digital_humans")
            .select("*")
            .eq("id", digital_human_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not dh_response.data or len(dh_response.data) == 0:
            raise Exception("Digital human not found")

        digital_human = dh_response.data[0]
        avatar_url = digital_human.get("avatar_url")
        voice_config = digital_human.get("voice_config", {})
        voice_type = voice_config.get("voice_type", "female")

        result = await dashscope_service.generate_digital_human_video(
            avatar_url=avatar_url,
            text=text,
            voice_type=voice_type,
            duration=duration
        )

        task_id = result.get("output", {}).get("task_id")
        if not task_id:
            raise Exception("Failed to get task_id from AI service")

        final_result = await dashscope_service.wait_for_task_completion(
            task_id=task_id,
            max_wait_time=300,
            poll_interval=5
        )

        video_url = final_result.get("output", {}).get("video_url")
        if not video_url:
            raise Exception("No video URL in result")

        # Create project record (no "mode" column -- use project_type only)
        project_response = supabase_admin.table("projects").insert({
            "user_id": user_id,
            "title": f"{digital_human.get('name')} - {text[:30]}...",
            "description": text,
            "project_type": "digital_human",
            "status": "completed",
            "video_url": video_url,
            "credits_used": CREDITS_COST
        }).execute()

        return project_response.data[0] if project_response.data else None

    except Exception as e:
        logger.error(f"Error processing digital human video: {str(e)}", exc_info=True)

        # Refund credits on failure via RPC
        try:
            logger.info(f"Refunding {CREDITS_COST} credits to user {user_id}")
            refund_credits(
                user_id=user_id,
                amount=CREDITS_COST,
                description=f"Refund for failed digital human video: {str(e)[:200]}",
                reference_id=digital_human_id,
                reference_type="digital_human",
            )
            logger.info(f"Refunded {CREDITS_COST} credits to user {user_id}")
        except Exception as refund_error:
            logger.error(f"Failed to refund credits: {str(refund_error)}", exc_info=True)

        raise


@router.post("/{digital_human_id}/generate-video")
async def generate_digital_human_video(
    digital_human_id: str,
    request: VideoGenerateRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id)
):
    """Generate video with digital human speaking the provided text."""
    try:
        # Verify ownership
        dh_response = (
            supabase_admin.table("digital_humans")
            .select("*")
            .eq("id", digital_human_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not dh_response.data or len(dh_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital human not found"
            )

        # Deduct credits via RPC (checks balance + writes transaction atomically)
        try:
            deduct_credits(
                user_id=user_id,
                amount=CREDITS_COST,
                description=f"Digital human video generation: {request.text[:50]}",
                reference_id=digital_human_id,
                reference_type="digital_human",
            )
        except RuntimeError as e:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient credits or deduction failed: {e}"
            )

        background_tasks.add_task(
            process_digital_human_video,
            digital_human_id=digital_human_id,
            user_id=user_id,
            text=request.text,
            duration=request.duration
        )

        return {
            "message": "Video generation started",
            "status": "processing"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

"""
Digital humans API endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from pydantic import BaseModel, Field
import jwt
import logging
from app.core.config import settings
from app.db.supabase import supabase_admin
from app.schemas import DigitalHumanCreate, DigitalHumanResponse
from app.services.ai_service import dashscope_service

router = APIRouter(prefix="/digital-humans", tags=["Digital Humans"])
security = HTTPBearer()
logger = logging.getLogger(__name__)


class VideoGenerateRequest(BaseModel):
    """Request model for digital human video generation."""
    text: str = Field(..., min_length=1, max_length=1000)
    duration: int = Field(default=10, ge=5, le=60)


async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Get current user ID from token."""
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


@router.post("", response_model=DigitalHumanResponse, status_code=status.HTTP_201_CREATED)
async def create_digital_human(
    digital_human: DigitalHumanCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new digital human."""
    try:
        # Insert digital human into database
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
        response = supabase_admin.table("digital_humans") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()

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
        response = supabase_admin.table("digital_humans") \
            .select("*") \
            .eq("id", digital_human_id) \
            .eq("user_id", user_id) \
            .execute()

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
        # Verify ownership
        check_response = supabase_admin.table("digital_humans") \
            .select("id") \
            .eq("id", digital_human_id) \
            .eq("user_id", user_id) \
            .execute()

        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital human not found"
            )

        # Update digital human
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
        # Verify ownership
        check_response = supabase_admin.table("digital_humans") \
            .select("id") \
            .eq("id", digital_human_id) \
            .eq("user_id", user_id) \
            .execute()

        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital human not found"
            )

        # Delete digital human
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
    credits_cost = 10
    try:
        logger.info(f"Starting digital human video generation for user {user_id}")

        # Get digital human info
        dh_response = supabase_admin.table("digital_humans") \
            .select("*") \
            .eq("id", digital_human_id) \
            .eq("user_id", user_id) \
            .execute()

        if not dh_response.data or len(dh_response.data) == 0:
            raise Exception("Digital human not found")

        digital_human = dh_response.data[0]
        avatar_url = digital_human.get("avatar_url")
        voice_config = digital_human.get("voice_config", {})
        voice_type = voice_config.get("voice_type", "female")

        logger.info(f"Digital human found: {digital_human.get('name')}, avatar_url: {avatar_url}")

        # Use digital human API to generate video with speech
        result = await dashscope_service.generate_digital_human_video(
            avatar_url=avatar_url,
            text=text,
            voice_type=voice_type,
            duration=duration
        )

        logger.debug(f"API result: {result}")

        task_id = result.get("output", {}).get("task_id")
        if not task_id:
            raise Exception("Failed to get task_id from AI service")

        logger.info(f"Got task_id: {task_id}, waiting for completion...")

        # Wait for completion
        final_result = await dashscope_service.wait_for_task_completion(
            task_id=task_id,
            max_wait_time=300,
            poll_interval=5
        )

        logger.info(f"Task completed successfully")

        # Extract video URL
        video_url = final_result.get("output", {}).get("video_url")
        if not video_url:
            raise Exception("No video URL in result")

        logger.info(f"Got video_url: {video_url}")

        # Create a project record for this video
        project_response = supabase_admin.table("projects").insert({
            "user_id": user_id,
            "title": f"{digital_human.get('name')} - {text[:30]}...",
            "description": text,
            "mode": "digital_human",
            "project_type": "digital_human",
            "status": "completed",
            "video_url": video_url,
            "credits_used": credits_cost
        }).execute()

        logger.info(f"Project created successfully: {project_response.data[0]['id'] if project_response.data else 'unknown'}")

        return project_response.data[0] if project_response.data else None

    except Exception as e:
        logger.error(f"Error processing digital human video: {str(e)}", exc_info=True)

        # Refund credits on failure
        try:
            logger.info(f"Attempting to refund {credits_cost} credits to user {user_id}")

            # Get current credits
            profile_response = supabase_admin.table("profiles") \
                .select("credits") \
                .eq("id", user_id) \
                .execute()

            if profile_response.data and len(profile_response.data) > 0:
                current_credits = profile_response.data[0].get("credits", 0)
                new_credits = current_credits + credits_cost

                # Refund credits
                supabase_admin.table("profiles").update({
                    "credits": new_credits
                }).eq("id", user_id).execute()

                logger.info(f"Successfully refunded {credits_cost} credits to user {user_id}. New balance: {new_credits}")

                # Log the refund transaction
                supabase_admin.table("credit_transactions").insert({
                    "user_id": user_id,
                    "amount": credits_cost,
                    "balance_after": new_credits,
                    "transaction_type": "refund",
                    "description": f"Refund for failed digital human video generation: {str(e)[:200]}"
                }).execute()

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
        # Verify digital human ownership
        dh_response = supabase_admin.table("digital_humans") \
            .select("*") \
            .eq("id", digital_human_id) \
            .eq("user_id", user_id) \
            .execute()

        if not dh_response.data or len(dh_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Digital human not found"
            )

        # Check user credits
        profile_response = supabase_admin.table("profiles") \
            .select("credits") \
            .eq("id", user_id) \
            .execute()

        if not profile_response.data or len(profile_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )

        credits = profile_response.data[0].get("credits", 0)
        credits_cost = 10

        if credits < credits_cost:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient credits. Required: {credits_cost}, Available: {credits}"
            )

        # Deduct credits
        supabase_admin.table("profiles").update({
            "credits": credits - credits_cost
        }).eq("id", user_id).execute()

        # Start background task
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

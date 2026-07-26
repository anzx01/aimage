"""
Projects API endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
import logging
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.db.supabase import supabase_admin
from app.api.deps import get_current_user_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
async def get_projects(user_id: str = Depends(get_current_user_id)):
    """Get all projects for current user."""
    try:
        response = (
            supabase_admin.table("projects")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return [ProjectResponse(**project) for project in response.data]
    except Exception as e:
        logger.error(f"Error fetching projects: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new project."""
    try:
        response = supabase_admin.table("projects").insert({
            "user_id": user_id,
            "title": project_data.title,
            "description": project_data.description,
            "project_type": project_data.project_type.value,
            "config": project_data.config,
            "status": "draft"
        }).execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create project"
            )

        return ProjectResponse(**response.data[0])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating project: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific project."""
    try:
        response = (
            supabase_admin.table("projects")
            .select("*")
            .eq("id", project_id)
            .eq("user_id", user_id)
            .single()
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        return ProjectResponse(**response.data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching project: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a project."""
    try:
        update_data = {}
        if project_data.title is not None:
            update_data["title"] = project_data.title
        if project_data.description is not None:
            update_data["description"] = project_data.description
        if project_data.status is not None:
            update_data["status"] = project_data.status.value
        if project_data.config is not None:
            update_data["config"] = project_data.config

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        response = (
            supabase_admin.table("projects")
            .update(update_data)
            .eq("id", project_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        return ProjectResponse(**response.data[0])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating project: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a project."""
    try:
        response = (
            supabase_admin.table("projects")
            .delete()
            .eq("id", project_id)
            .eq("user_id", user_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        return None

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting project: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

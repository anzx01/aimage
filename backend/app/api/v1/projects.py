"""
Projects API endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.core.security import decode_access_token
from app.db.supabase import supabase

router = APIRouter(prefix="/projects", tags=["Projects"])
security = HTTPBearer()


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


@router.get("", response_model=List[ProjectResponse])
async def get_projects(user_id: str = Depends(get_current_user_id)):
    """Get all projects for current user."""
    try:
        response = supabase.table("projects") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()

        return [ProjectResponse(**project) for project in response.data]

    except Exception as e:
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
        response = supabase.table("projects").insert({
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

    except Exception as e:
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
        response = supabase.table("projects") \
            .select("*") \
            .eq("id", project_id) \
            .eq("user_id", user_id) \
            .single() \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        return ProjectResponse(**response.data)

    except Exception as e:
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
        # Build update dict
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

        response = supabase.table("projects") \
            .update(update_data) \
            .eq("id", project_id) \
            .eq("user_id", user_id) \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        return ProjectResponse(**response.data[0])

    except Exception as e:
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
        response = supabase.table("projects") \
            .delete() \
            .eq("id", project_id) \
            .eq("user_id", user_id) \
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        return None

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

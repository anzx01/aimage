"""
Admin API endpoints.

All admin routes require the `is_admin` flag on the user's profile.
"""
from fastapi import APIRouter, HTTPException, status, Depends
import logging
from app.db.supabase import supabase_admin
from app.api.deps import get_current_admin_id

router = APIRouter(prefix="/admin", tags=["Admin"])
logger = logging.getLogger(__name__)


@router.get("/users")
async def list_users(admin_id: str = Depends(get_current_admin_id)):
    """List all users (admin only)."""
    try:
        result = (
            supabase_admin.table("profiles")
            .select("id, email, full_name, credits, subscription_tier, is_admin, created_at")
            .order("created_at", desc=True)
            .execute()
        )
        return {"users": result.data or []}
    except Exception as e:
        logger.error(f"Admin list_users error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def platform_stats(admin_id: str = Depends(get_current_admin_id)):
    """Platform-wide statistics (admin only)."""
    try:
        users = supabase_admin.table("profiles").select("id", count="exact").execute()
        projects = supabase_admin.table("projects").select("id", count="exact").execute()
        tasks = supabase_admin.table("generation_tasks").select("id", count="exact").execute()

        return {
            "total_users": users.count or 0,
            "total_projects": projects.count or 0,
            "total_generation_tasks": tasks.count or 0,
        }
    except Exception as e:
        logger.error(f"Admin stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

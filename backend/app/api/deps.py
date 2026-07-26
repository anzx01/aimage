"""
Shared API dependencies for authentication and authorization.

Uses Supabase native session tokens (supabase_admin.auth.get_user) as the
single source of truth for identity. No self-signed JWT.
"""
import logging
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.db.supabase import supabase_admin

logger = logging.getLogger(__name__)
security = HTTPBearer()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """Verify the Supabase session token and return the user id."""
    token = credentials.credentials
    try:
        response = supabase_admin.auth.get_user(token)
        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: user not found",
            )
        return response.user.id
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Authentication error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {e}",
        )


async def get_current_admin_id(
    user_id: str = Depends(get_current_user_id),
) -> str:
    """Ensure the current user is an admin (profiles.is_admin = true)."""
    try:
        resp = (
            supabase_admin.table("profiles")
            .select("is_admin")
            .eq("id", user_id)
            .single()
            .execute()
        )
        if not resp.data or not resp.data.get("is_admin"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin privileges required",
            )
        return user_id
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Admin check error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )

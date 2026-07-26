"""
Authentication API endpoints.

Uses Supabase native session tokens exclusively -- no self-signed JWT.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from app.db.supabase import supabase, supabase_admin
from app.api.deps import get_current_user_id

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user and return the Supabase session token."""
    try:
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name
                }
            }
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )

        # Fetch the profile created by trigger
        profile_response = (
            supabase_admin.table("profiles")
            .select("*")
            .eq("id", auth_response.user.id)
            .single()
            .execute()
        )

        # Use the Supabase session access token (not a self-signed JWT)
        access_token = ""
        if auth_response.session and auth_response.session.access_token:
            access_token = auth_response.session.access_token

        return TokenResponse(
            access_token=access_token,
            user=UserResponse(**profile_response.data)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """Login user and return the Supabase session token."""
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

        profile_response = (
            supabase_admin.table("profiles")
            .select("*")
            .eq("id", auth_response.user.id)
            .single()
            .execute()
        )

        access_token = ""
        if auth_response.session and auth_response.session.access_token:
            access_token = auth_response.session.access_token

        return TokenResponse(
            access_token=access_token,
            user=UserResponse(**profile_response.data)
        )

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


@router.post("/logout")
async def logout():
    """Logout user. The client should discard the session token."""
    return {"message": "Logged out. Please discard the session token on the client."}


@router.get("/me", response_model=UserResponse)
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """Get current user profile."""
    profile_response = (
        supabase_admin.table("profiles")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not profile_response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return UserResponse(**profile_response.data)

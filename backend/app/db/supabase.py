"""
Supabase client initialization.
"""
from supabase import create_client, Client
from app.core.config import settings


def get_supabase_client() -> Client:
    """Get Supabase client instance."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)


def get_supabase_admin_client() -> Client:
    """Get Supabase admin client with service role key."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


# Global client instances
supabase: Client = get_supabase_client()
supabase_admin: Client = get_supabase_admin_client()

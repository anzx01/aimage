"""
Credits service layer.

All credit mutations go through the Supabase RPC functions
(`deduct_user_credits` / `refund_user_credits`) which are SECURITY DEFINER
stored procedures executable only with the service_role key. This keeps the
balance-update + transaction-log atomic and prevents browser-side tampering.
"""
import logging
from app.db.supabase import supabase_admin

logger = logging.getLogger(__name__)


def deduct_credits(
    user_id: str,
    amount: int,
    description: str,
    reference_id: str | None = None,
    reference_type: str | None = None,
) -> dict:
    """
    Deduct credits via RPC. Raises RuntimeError on failure.

    Returns the RPC result dict containing `balance_after`.
    """
    if amount <= 0:
        raise ValueError("amount must be positive")
    try:
        result = supabase_admin.rpc(
            "deduct_user_credits",
            {
                "p_user_id": user_id,
                "p_amount": amount,
                "p_description": description,
                "p_reference_id": reference_id,
                "p_reference_type": reference_type,
            },
        ).execute()
        if not result.data:
            raise RuntimeError("deduct_user_credits returned no data")
        return result.data
    except Exception as e:
        logger.error("deduct_credits failed for %s: %s", user_id, e)
        raise RuntimeError(f"Failed to deduct credits: {e}") from e


def refund_credits(
    user_id: str,
    amount: int,
    description: str,
    reference_id: str | None = None,
    reference_type: str | None = None,
) -> dict:
    """
    Refund credits via RPC. Raises RuntimeError on failure.

    Returns the RPC result dict containing `balance_after`.
    """
    if amount <= 0:
        raise ValueError("amount must be positive")
    try:
        result = supabase_admin.rpc(
            "refund_user_credits",
            {
                "p_user_id": user_id,
                "p_amount": amount,
                "p_description": description,
                "p_reference_id": reference_id,
                "p_reference_type": reference_type,
            },
        ).execute()
        if not result.data:
            raise RuntimeError("refund_user_credits returned no data")
        return result.data
    except Exception as e:
        logger.error("refund_credits failed for %s: %s", user_id, e)
        raise RuntimeError(f"Failed to refund credits: {e}") from e

"""
Add credits to all users.

Usage: python -m backend.scripts.add_credits
"""
from app.db.supabase import supabase_admin


def add_credits_to_all(amount: int = 1000):
    """Add credits to every user via RPC."""
    response = supabase_admin.table("profiles").select("id").execute()

    if not response.data:
        print("No users found")
        return

    print(f"Found {len(response.data)} users:")
    for profile in response.data:
        user_id = profile.get("id")
        try:
            result = supabase_admin.rpc(
                "refund_user_credits",
                {
                    "p_user_id": user_id,
                    "p_amount": amount,
                    "p_description": f"Manual credit addition (script)",
                    "p_reference_id": None,
                    "p_reference_type": "manual",
                },
            ).execute()
            balance = result.data.get("balance_after", "?") if result.data and isinstance(result.data, dict) else "?"
            print(f"  [OK] {user_id}: +{amount} -> balance {balance}")
        except Exception as e:
            print(f"  [FAIL] {user_id}: {e}")

    print(f"\n[SUCCESS] Added {amount} credits to all users")


if __name__ == "__main__":
    add_credits_to_all(1000)

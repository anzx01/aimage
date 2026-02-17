"""
Simple script to add credits using backend config
"""
import sys
sys.path.append('backend')

from app.db.supabase import supabase_admin

# Get all users
response = supabase_admin.table("profiles").select("*").execute()

if response.data:
    print(f"Found {len(response.data)} users:")
    for profile in response.data:
        user_id = profile.get("id")
        current_credits = profile.get("credits", 0)
        print(f"  User ID: {user_id}, Current Credits: {current_credits}")

        # Add 1000 credits to each user
        new_credits = current_credits + 1000
        supabase_admin.table("profiles").update({
            "credits": new_credits
        }).eq("id", user_id).execute()

        print(f"  ✓ Added 1000 credits. New balance: {new_credits}")

    print("\n✅ Credits added successfully!")
else:
    print("No users found")

"""
Add test credits to user account
"""
import os
from supabase import create_client

# Supabase credentials
SUPABASE_URL = "https://neobund1.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lb2J1bmQxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTQ0NTU0NywiZXhwIjoyMDU1MDIxNTQ3fQ.Aq_CtLxWXVqJXqPqQxqQqQqQqQqQqQqQqQqQqQqQqQqQ"

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Get all users
response = supabase.table("profiles").select("*").execute()

if response.data:
    print(f"Found {len(response.data)} users:")
    for profile in response.data:
        user_id = profile.get("id")
        current_credits = profile.get("credits", 0)
        print(f"  User ID: {user_id}, Current Credits: {current_credits}")

        # Add 1000 credits to each user
        new_credits = current_credits + 1000
        supabase.table("profiles").update({
            "credits": new_credits
        }).eq("id", user_id).execute()

        print(f"  ✓ Added 1000 credits. New balance: {new_credits}")

    print("\n✅ Credits added successfully!")
else:
    print("No users found")

"""
Test script to diagnose digital human video generation issues.
"""
import asyncio
import sys
from app.db.supabase import supabase_admin

async def check_projects():
    """Check projects in database."""
    print("=" * 60)
    print("Checking project records in database")
    print("=" * 60)

    try:
        # Get all projects
        response = supabase_admin.table("projects").select("*").order("created_at", desc=True).limit(10).execute()

        if not response.data:
            print("X No project records in database")
            return

        print(f"Found {len(response.data)} projects\n")

        for i, project in enumerate(response.data, 1):
            print(f"Project {i}:")
            print(f"  ID: {project.get('id')}")
            print(f"  Title: {project.get('title')}")
            print(f"  User ID: {project.get('user_id')}")
            print(f"  Type: {project.get('project_type')}")
            print(f"  Mode: {project.get('mode')}")
            print(f"  Status: {project.get('status')}")
            print(f"  Video URL: {project.get('video_url')}")
            print(f"  Credits Used: {project.get('credits_used')}")
            print(f"  Created At: {project.get('created_at')}")
            print()

    except Exception as e:
        print(f"X Query failed: {str(e)}")
        import traceback
        traceback.print_exc()

async def check_digital_humans():
    """Check digital humans in database."""
    print("=" * 60)
    print("Checking digital human records in database")
    print("=" * 60)

    try:
        response = supabase_admin.table("digital_humans").select("*").order("created_at", desc=True).limit(5).execute()

        if not response.data:
            print("X No digital human records in database")
            return

        print(f"Found {len(response.data)} digital humans\n")

        for i, dh in enumerate(response.data, 1):
            print(f"Digital Human {i}:")
            print(f"  ID: {dh.get('id')}")
            print(f"  Name: {dh.get('name')}")
            print(f"  User ID: {dh.get('user_id')}")
            print(f"  Type: {dh.get('digital_human_type')}")
            print(f"  Avatar URL: {dh.get('avatar_url')}")
            print(f"  Voice Config: {dh.get('voice_config')}")
            print(f"  Appearance Config: {dh.get('appearance_config')}")
            print()

    except Exception as e:
        print(f"X Query failed: {str(e)}")
        import traceback
        traceback.print_exc()

async def main():
    """Main test function."""
    print("\n[DIAGNOSTIC] Digital Human Video Generation Diagnostic Tool\n")

    await check_digital_humans()
    await check_projects()

    print("=" * 60)
    print("Diagnostic Complete")
    print("=" * 60)
    print("\nIf you see issues:")
    print("1. No project records -> Video generation failed, check backend logs")
    print("2. Project exists but video_url is empty -> API call failed or wrong format")
    print("3. Project exists with video_url -> Frontend display issue, check frontend code")
    print()

if __name__ == "__main__":
    asyncio.run(main())

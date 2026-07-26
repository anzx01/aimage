"""
Helper: set a temporary password for the test user via Supabase Admin API,
then login to get a session token for e2e testing.

Usage: python scripts/get_test_token.py
"""
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY", "")
TEST_EMAIL = "947057797@qq.com"
TEMP_PASSWORD = "TestE2E_2026!"

print(f"Supabase URL: {SUPABASE_URL}")
print(f"Service key exists: {bool(SUPABASE_SERVICE_KEY)}")
print(f"Anon key exists: {bool(SUPABASE_ANON_KEY)}")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
    exit(1)

headers = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
}

# Step 1: Get user by email
print(f"\n1. Looking up user: {TEST_EMAIL}")
r = httpx.get(
    f"{SUPABASE_URL}/auth/v1/admin/users",
    headers=headers,
    params={"page": "1", "per_page": "100"},
    timeout=10.0,
)
print(f"   Status: {r.status_code}")

users = r.json().get("users", []) if r.status_code == 200 else []
user = next((u for u in users if u.get("email") == TEST_EMAIL), None)

if not user:
    print(f"   User not found! Available users:")
    for u in users[:10]:
        print(f"     - {u.get('email')} (id: {u.get('id')})")
    exit(1)

user_id = user["id"]
print(f"   Found user: id={user_id}, email={user.get('email')}")

# Step 2: Set temporary password
print(f"\n2. Setting temporary password...")
r = httpx.put(
    f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
    headers=headers,
    json={"password": TEMP_PASSWORD},
    timeout=10.0,
)
print(f"   Status: {r.status_code}")
if r.status_code != 200:
    print(f"   Error: {r.text}")
    exit(1)
print("   Password updated.")

# Step 3: Login with temp password to get session token
print(f"\n3. Logging in with temp password...")
r = httpx.post(
    f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
    headers={
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
    },
    json={"email": TEST_EMAIL, "password": TEMP_PASSWORD},
    timeout=10.0,
)
print(f"   Status: {r.status_code}")
if r.status_code != 200:
    print(f"   Error: {r.text}")
    exit(1)

token = r.json().get("access_token", "")
print(f"   Got token (length={len(token)})")

# Step 4: Write token to a temp file for e2e test to read
token_file = os.path.join(os.path.dirname(__file__), "..", ".test_token")
with open(token_file, "w") as f:
    f.write(token)
print(f"\n4. Token written to: {token_file}")
print(f"   Now run: python scripts/e2e_test.py")
print(f"\nNote: Your account password was temporarily changed to '{TEMP_PASSWORD}'")
print(f"      Login via GitHub is still unaffected (OAuth doesn't use password)")

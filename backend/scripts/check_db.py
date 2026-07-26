"""Check DB schema for projects table."""
import httpx, os, json
from dotenv import load_dotenv
load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
headers = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}

# Query projects table columns
r = httpx.get(
    f"{url}/rest/v1/projects?limit=2",
    headers=headers,
    timeout=10.0,
)
print("Sample projects:")
print(json.dumps(r.json()[:2] if r.json() else [], indent=2, default=str))

# Query information_schema for columns
r2 = httpx.post(
    f"{url}/rest/v1/rpc/exec_sql",
    headers=headers,
    json={"query": "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'projects' ORDER BY ordinal_position"},
    timeout=10.0,
)
print("\nColumns:", r2.status_code)
if r2.status_code == 200:
    print(json.dumps(r2.json(), indent=2))
else:
    print(r2.text[:300])

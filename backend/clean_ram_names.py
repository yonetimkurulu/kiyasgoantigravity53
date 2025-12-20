import os
import re
from supabase import create_client

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not url or not key:
    # Fallback to hardcoded if env missing (for script usage)
    # Trying to read from file manually if needed, or just ask user to ensure envs are set
    # For now, let's assume valid envs or use the ones we saw earlier
    url = os.environ.get("SUPABASE_URL") or "https://eupwqhesbcjczsdgkurh.supabase.co"
    key = os.environ.get("SUPABASE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cHdxaGVzYmNqY3pzZGdrdXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzc3NiwiZXhwIjoyMDgwNDEzNzc2fQ.iuyn8M3WvaFhHjXKkqLNRMsjoVARuvy22TIaAM1YJ80"

supabase = create_client(url, key)

def clean_names():
    print("Fetching products...")
    # Fetch all products (limit 1000 for now)
    response = supabase.table("products").select("id, name").execute()
    products = response.data

    if not products:
        print("No products found.")
        return

    print(f"Checking {len(products)} products...")
    
    # Regex: Matches " 12 GB/" or " 8 GB/" etc.
    # Pattern: Space + Digits + Optional Space + GB + Slash
    pattern = re.compile(r'\s\d+\s?GB\/', re.IGNORECASE)

    count = 0
    for p in products:
        old_name = p['name']
        # Check if match
        if pattern.search(old_name):
            new_name = pattern.sub(' ', old_name)
            # Clean up potential double spaces
            new_name = re.sub(r'\s+', ' ', new_name).strip()
            
            if old_name != new_name:
                print(f"Updating: '{old_name}' -> '{new_name}'")
                supabase.table("products").update({"name": new_name}).eq("id", p['id']).execute()
                count += 1

    print(f"Finished. Updated {count} product names.")

if __name__ == "__main__":
    clean_names()

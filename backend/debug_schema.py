import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_schema():
    print("Fetching schema for 'products'...")
    # Fetch one row to see keys
    res = supabase.table('products').select("*").limit(1).execute()
    if res.data:
        print("Columns found:", list(res.data[0].keys()))
    else:
        print("No data found, cannot infer schema.")

if __name__ == "__main__":
    get_schema()

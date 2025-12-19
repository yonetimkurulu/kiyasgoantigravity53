import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def check_categories():
    print("🔍 CHECKING CATEGORY PATTERNS")
    
    # Fetch a few known good products (not from my import)
    # My imports have 'source'='NanoReview' usually.
    # Existing ones might have source=None or other.
    
    # Check NanoReview imports specifically
    res = supabase.table('products').select("name, category, subcategory, source").eq("source", "NanoReview").limit(10).execute()
    
    print(f"Sample Data:")
    for p in res.data:
        print(f"   Name: {p['name'][:30]}... | Cat: '{p['category']}' | SubCat: '{p['subcategory']}' | Source: {p['source']}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(check_categories())

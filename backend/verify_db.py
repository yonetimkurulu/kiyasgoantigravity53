import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client
from collections import Counter

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def verify_db():
    print("📋 DATABASE AUDIT")
    
    # Fetch all
    res = supabase.table('products').select("name, category").execute()
    products = res.data
    
    total = len(products)
    print(f"Total Products: {total}")
    
    # Check 1024 GB
    count_1024 = sum(1 for p in products if "1024 GB" in p['name'])
    count_1tb = sum(1 for p in products if "1 TB" in p['name'])
    
    print(f"Name Stats:")
    print(f"   Contains '1024 GB': {count_1024}")
    print(f"   Contains '1 TB':    {count_1tb}")
    
    # Check Categories
    cats = Counter(p['category'] for p in products)
    print(f"Categories in DB: {dict(cats)}")
    
    # implied Brands (First word of name)
    brands = Counter(p['name'].split()[0] for p in products if p['name'])
    print(f"Top 5 Brands (by Name prefix): {brands.most_common(5)}")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(verify_db())

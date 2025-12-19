import os
import asyncio
from slugify import slugify
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def fix_database():
    print("🚀 STARTING DB CLEANUP...")
    
    # 1. Fetch all products (pagination might be needed if > 1000, assuming < 1000 for now)
    res = supabase.table('products').select("*").execute()
    products = res.data
    print(f"📦 Found {len(products)} products.")
    
    updated_count = 0
    
    for p in products:
        original_name = p['name']
        new_name = original_name
        
        # FIX 3: Category Standardization
        # "Smartphone" (from Importer) -> "elektronik" (Site Schema)
        if p.get('category') == 'Smartphone':
            print(f"   📂 Sending to Main Category: {original_name}")
            payload = {
                "category": "elektronik", # Standardize
                "updated_at": "now()"
            }
            try:
                supabase.table('products').update(payload).eq('id', p['id']).execute()
                updated_count += 1
            except Exception as e:
                print(f"   ❌ Error updating category {original_name}: {e}")

        # FIX 1: 1024 GB -> 1 TB
        if "1024 GB" in new_name:
            new_name = new_name.replace("1024 GB", "1 TB")
        
        # Also fix variants if they ended up like "12 GB GB" (Safety check)
        if "GB GB" in new_name:
             new_name = new_name.replace("GB GB", "GB")

        # FIX 2: Slug Optimization
        # Force re-slugify to ensure clean URLs
        new_slug = slugify(new_name)
        
        # Check if changes needed
        needs_update = False
        if new_name != original_name:
            print(f"   ✏️  Renaming: '{original_name}' -> '{new_name}'")
            needs_update = True
        
        if new_slug != p['slug']:
            print(f"   🔗 Refeshing Link: {p['slug']} -> {new_slug}")
            needs_update = True
            
        if needs_update:
            # OPTIMIZED UPDATE: Explicitly EXCLUDE 'image' to preserve manual photos
            payload = {
                "name": new_name,
                "slug": new_slug,
                "updated_at": "now()"
                # NO image field here!
            }
            
            try:
                supabase.table('products').update(payload).eq('id', p['id']).execute()
                updated_count += 1
            except Exception as e:
                print(f"   ❌ Error updating {original_name}: {e}")

    print(f"\n✅ CLEANUP COMPLETE. Updated {updated_count} products.")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(fix_database())

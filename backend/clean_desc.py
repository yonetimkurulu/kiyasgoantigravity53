import os
import asyncio
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def clean_descriptions():
    print("🧹 Cleaning Descriptions...")
    
    # Fetch all (or paginated)
    res = supabase.table('products').select("id, name, desc").execute()
    products = res.data
    
    updated_count = 0
    
    for p in products:
        d = p.get('desc')
        if not d: continue
        
        # Check if needs cleaning
        if "##" in d or "**" in d or "*(Kaynak" in d:
            new_desc = d
            # Remove Markdown headers
            new_desc = new_desc.replace("## ", "").replace("##", "")
            # Remove Bold
            new_desc = new_desc.replace("**", "")
            # Fix Bullets
            new_desc = new_desc.replace("- ", "• ")
            # Fix Source Italic
            new_desc = new_desc.replace("*(Kaynak", "(Kaynak").replace(")*", ")")
            
            if new_desc != d:
                print(f"   ✨ Cleaning: {p['name']}")
                try:
                    supabase.table('products').update({
                        "desc": new_desc,
                        "updated_at": "now()"
                    }).eq('id', p['id']).execute()
                    updated_count += 1
                except Exception as e:
                    print(f"   ❌ Error: {e}")

    print(f"\n✅ Done. Cleaned {updated_count} descriptions.")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(clean_descriptions())

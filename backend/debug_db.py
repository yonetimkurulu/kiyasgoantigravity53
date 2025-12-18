from app.db.session import supabase

def check_counts():
    print("--- DEBUGGING DATABASE ---")
    
    # 1. Products
    res = supabase.table("products").select("name", count="exact").execute()
    print(f"Products: {len(res.data)}")
    for p in res.data:
        print(f" - {p['name']}")

    # 2. Sources
    res = supabase.table("provenance_sources").select("title", count="exact").execute()
    print(f"Sources: {len(res.data)}")
    for s in res.data:
        print(f" - {s.get('title', 'No Title')}")

    # 3. Chunks
    res = supabase.table("content_chunks").select("id", count="exact").execute()
    print(f"Content Chunks: {len(res.data)}")

if __name__ == "__main__":
    check_counts()

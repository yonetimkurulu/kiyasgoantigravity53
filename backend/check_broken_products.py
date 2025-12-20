import os
from supabase import create_client

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase = create_client(url, key)

names = ["Xiaomi Pad 6", "Monster Tulpar T7"]

for name in names:
    print(f"--- Checking: {name} ---")
    # Using ilike for partial match just in case
    response = supabase.table("products").select("*").ilike("name", f"%{name}%").execute()
    
    if response.data:
        for p in response.data:
            print(f"ID: {p.get('id')}")
            print(f"Name: {p.get('name')}")
            print(f"Slug: {p.get('slug')}")
            print(f"Category: {p.get('category')}")
            print(f"Subcategory: {p.get('subcategory')}")
            print("-" * 20)
    else:
        print("Product NOT FOUND in DB")

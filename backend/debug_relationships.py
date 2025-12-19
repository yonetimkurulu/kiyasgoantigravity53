from app.db.session import supabase

def trace_relationships():
    print("--- TRACING DATA RELATIONSHIPS ---")
    
    # 1. Get all Content Chunks
    print("\n1. Content Chunks:")
    chunks = supabase.table("content_chunks").select("id, source_id, chunk_text").execute()
    
    for chunk in chunks.data:
        text_snippet = chunk['chunk_text'][:30] if chunk['chunk_text'] else ""
        print(f"Chunk {chunk['id']} | Source {chunk['source_id']} | '{text_snippet}...'")
        
        # 2. Get Source for this Chunk
        source = supabase.table("provenance_sources").select("id, product_id, title").eq("id", chunk['source_id']).execute()
        
        if source.data:
            s_data = source.data[0]
            print(f"  -> Source: {s_data['title']} (Product ID: {s_data['product_id']})")
            
            # 3. Get Product
            product = supabase.table("products").select("id, name").eq("id", s_data['product_id']).execute()
            if product.data:
                print(f"    -> Product: {product.data[0]['name']} (ID: {product.data[0]['id']})")
            else:
                print(f"    -> ❌ Product ID {s_data['product_id']} NOT FOUND")
        else:
            print(f"  -> ❌ Orphaned Chunk (Source {chunk['source_id']} not found)")

if __name__ == "__main__":
    trace_relationships()

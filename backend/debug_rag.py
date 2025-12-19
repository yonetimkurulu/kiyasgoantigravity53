import asyncio
from app.services.rag_engine import rag_engine

async def debug_rag():
    print("--- DEBUGGING RAG RETRIEVAL ---")
    
    product_name = "iPhone 15 Pro"
    query = "iPhone 15 Pro kamera gece nasıl çekiyor?"
    
    print(f"Product: {product_name}")
    print(f"Query: {query}")
    
    # 1. Get Embedding
    print("\n1. Generating Embedding...")
    try:
        embedding = await rag_engine.get_embedding(query)
        print(f"Embedding generated (len={len(embedding)})")
    except Exception as e:
        print(f"ERROR Generating Embedding: {e}")
        return

    # 2. Retrieve Context (Internal method test)
    print("\n2. Retrieving Context (Calling internal _retrieve_context)...")
    try:
        # Note: We access the private method for debugging
        context = await rag_engine._retrieve_context(product_name, query)
        print(f"Context Result:\n{context}")
        
        if not context:
            print("❌ NO CONTEXT RETURNED from DB.")
        else:
            print("✅ Internal Retrieval Successful!")

    except Exception as e:
        print(f"ERROR Retrieving Context: {e}")

    # 3. Full Generate Answer Test
    print("\n3. Testing Full 'analyze_product'...")
    try:
        answer = await rag_engine.analyze_product(product_name, query)
        print("Final Answer from LLM:")
        print(answer)
    except Exception as e:
        print(f"ERROR Generating Answer: {e}")

if __name__ == "__main__":
    asyncio.run(debug_rag())

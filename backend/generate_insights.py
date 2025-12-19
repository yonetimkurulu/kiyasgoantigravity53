import asyncio
import os
import re
from typing import Dict, List
from dotenv import load_dotenv
from supabase import create_client, Client
from openai import OpenAI
from app.services.rag_engine import rag_engine

# Load Env
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

# Setup Clients
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def clean_product_name(name: str) -> str:
    """
    Normalizes product name to base model.
    e.g. "iPhone 15 Pro 1TB Blue" -> "iPhone 15 Pro"
    """
    # Remove storage (128 GB, 1 TB etc)
    cleaned = re.sub(r'(\d+\s*(GB|TB))', '', name, flags=re.IGNORECASE)
    # Remove common colors (Turkish)
    cleaned = re.sub(r'(Mavi|Siyah|Beyaz|Gri|Titanyum|Altın|Yeşil|Kırmızı|Pembe|Mor|Sarı|Turuncu)', '', cleaned, flags=re.IGNORECASE)
    # Remove extra spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

async def generate_comprehensive_review(model_name: str):
    """
    Asks GPT to act as a tech expert and provide a structured review.
    """
    print(f"   🧠 Generating AI Review for: {model_name}...")
    try:
        prompt = f"""
        You are an expert technology reviewer.
        Write a comprehensive analysis for the "{model_name}".
        
        Structure your response exactly like this:
        
        # General Verdict
        [Short paragraph summarizing the device]
        
        # User Consensus
        [What do most users say? Mention common praises and complaints]
        
        # Pros
        - [Pro 1]
        - [Pro 2]
        - [Pro 3]
        
        # Cons
        - [Con 1]
        - [Con 2]
        - [Con 3]
        
        # Ideal For
        [Who should buy this?]
        """
        
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful and objective tech assistant. Output in TURKISH language."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"   ❌ GPT Error: {e}")
        return None

async def main():
    print("--- 🚀 STARTING AI INSIGHT GENERATOR (NO SCRAPING) ---")
    
    # 1. Fetch
    print("1. Fetching inventory...")
    res = supabase.table('products').select("id, name").execute()
    all_products = res.data
    
    # 2. Deduplicate
    unique_models = {}
    for p in all_products:
        clean = clean_product_name(p['name'])
        if clean not in unique_models:
            unique_models[clean] = []
        unique_models[clean].append(p['id'])
        
    print(f"✅ Deduplication: {len(all_products)} Raw SKUs reduced to -> {len(unique_models)} Unique Models.")
    
    # 3. Process
    for idx, (model_name, ids) in enumerate(unique_models.items()):
        print(f"\n[{idx+1}/{len(unique_models)}] Processing: {model_name}")
        
        # Check if we already have content? (Optional, skipping for now to ensure overwrite/update)
        
        # Generate
        review_text = await generate_comprehensive_review(model_name)
        
        if review_text:
            # Store
            try:
                await rag_engine.store_content(
                    product_name=model_name,
                    text=review_text,
                    source_url="kiyasgo-ai-analysis",
                    metadata={
                        "source_type": "ai_insight",
                        "title": f"KıyasGO AI: {model_name} İncelemesi",
                        "domain": "kiyasgo.ai"
                    }
                )
                print(f"      -> Stored successfully (Linked to {len(ids)} variants implicitly by Name)")
            except Exception as e:
                print(f"      -> Store Error: {e}")
        else:
            print("      -> Skipped (Generation failed)")
            
        # Small delay to respect rate limits if any
        await asyncio.sleep(0.5)

    print("\n--- ✨ GENERATION COMPLETE ---")

if __name__ == "__main__":
    if os.name == 'nt':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())

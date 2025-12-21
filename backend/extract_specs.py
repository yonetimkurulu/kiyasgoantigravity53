
import os
import json
from openai import OpenAI
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env from parent or current
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase credentials.")
    exit(1)

if not OPENAI_API_KEY:
    print("Error: Missing OpenAI API Key.")
    # Proceeding without it might be impossible unless we mock it, 
    # but let's assume it's there or user will provide it.
    # Actually, previous context showed extract_specs used OpenAI.
    pass

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

def extract_specs_from_text(text, product_name):
    if not client:
        return {"error": "No LLM Client"}
        
    prompt = f"""
    You are a technical specification extraction expert.
    
    Task: Extract key technical specifications for the product: "{product_name}".
    
    Instructions:
    1. Analyze the provided Text.
    2. If the text contains the specifications, extract them.
    3. If the text explicitly asks to "generate specifications from your internal knowledge", YOU MUST IGNORE the "do not invent" rule and PROVIDE accurate specifications based on your training data for this product.
    4. Return ONLY a valid JSON object.
    
    Keys should be simple (screen, processor, ram, battery, camera, os, storage, etc.).
    Values should be concise strings.

    Text:
    {text[:4000]}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"LLM Error: {e}")
        return {}

import re

def clean_product_name(name):
    # Remove storage (128 GB, 1 TB, etc.) - Case insensitive
    name = re.sub(r'\s*\d+\s*(gb|tb)', '', name, flags=re.IGNORECASE)
    # Remove ram if explicitly stated like "8 GB" but usually part of storage block
    # Remove common colors (Turkish/English)
    colors = ["siyah", "beyaz", "mavi", "kırmızı", "yeşil", "altın", "gümüş", "gri", "mor", "pembe", "sarı", "turuncu", "black", "white", "blue", "red", "green", "gold", "silver", "gray", "grey", "purple", "pink", "yellow", "orange", "titanyum"]
    for c in colors:
        name = re.sub(r'\b' + c + r'\b', '', name, flags=re.IGNORECASE)
    
    # Remove "Apple" brand sometimes helps if chunk is just "iPhone..."
    # name = name.lower().replace('apple', '').strip()
    
    # Remove common irrelevant words
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def main():
    print("Fetching products with missing specs (Limit 300)...")
    response = supabase.table("products").select("id, slug, name, specs").limit(1000).execute()
    all_products = response.data
    
    products_to_process = []
    for p in all_products:
        specs = p.get('specs')
        # Process if specs is None OR specs is empty dict
        if specs is None or (isinstance(specs, dict) and not specs):
            products_to_process.append(p)
            
    print(f"Found {len(products_to_process)} products to process.")

    # Process all of them (or limit if needed)
    for p in products_to_process:
        dirty_name = p['name']
        clean_name = clean_product_name(dirty_name)
        print(f"Processing {p['slug']} (Clean search: '{clean_name}')...")
        
        # Simple text search for chunks using clean name
        chunks_resp = supabase.table("content_chunks").select("chunk_text").ilike("chunk_text", f"%{clean_name}%").limit(3).execute()
        
        chunks_text = "\n".join([c['chunk_text'] for c in chunks_resp.data])
        
        if not chunks_text:
            print(f"No chunks found for '{clean_name}'. Trying lax search...")
            
            # Lax search: First 3 words
            tokens = clean_name.split()
            if len(tokens) > 2:
                lax_name = " ".join(tokens[:3])
            else:
                lax_name = clean_name
            
            # Remove symbols
            lax_name = re.sub(r'[^\w\s]', '', lax_name).strip()
            
            if lax_name != clean_name:
                print(f"Lax search term: '{lax_name}'")
                chunks_resp = supabase.table("content_chunks").select("chunk_text").ilike("chunk_text", f"%{lax_name}%").limit(3).execute()
                chunks_text = "\n".join([c['chunk_text'] for c in chunks_resp.data])

        if not chunks_text:
            print(f"No content found for '{clean_name}'. Generating from LLM knowledge...")
            chunks_text = f"Product: {p['name']}. Please generate specifications from your internal knowledge base."

        specs = extract_specs_from_text(chunks_text, p['name'])

        
        if specs and "error" not in specs:
             # Basic validation: ensure it's not empty
            if not specs:
                print("LLM returned empty specs. Marking as empty.")
                supabase.table("products").update({"specs": {}}).eq("id", p['id']).execute()
            else:
                print(f"Extracted: {specs}")
                supabase.table("products").update({"specs": specs}).eq("id", p['id']).execute()
        else:
             print("Failed extraction. Marking as empty.")
             supabase.table("products").update({"specs": {}}).eq("id", p['id']).execute()




if __name__ == "__main__":
    main()

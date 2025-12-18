from typing import Dict, List, Optional
from app.db.session import supabase
from app.core.config import settings
from openai import AsyncOpenAI
import json

# User-defined prompt template
KIYASGO_PROMPT = """You are KıyasGO AI.
Answer ONLY using the provided evidence.
If evidence is insufficient, say so clearly.

Question: {user_query}

Evidence:
{evidence_text}

Output:
- Summary
- Pros
- Cons
- Verdict
- Sources
"""

class RAGEngine:
    def __init__(self):
        self.client = None
        if settings.OPENAI_API_KEY:
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def get_embedding(self, text: str) -> List[float]:
        """Generates embedding for text using OpenAI"""
        if not self.client:
            return []
        response = await self.client.embeddings.create(
            input=text,
            model="text-embedding-ada-002"
        )
        return response.data[0].embedding
        
    async def store_content(self, product_name: str, text: str, source_url: str, metadata: Dict):
        """
        Stores content into Supabase.
        1. Ensure Product exists or create it.
        2. Create Provenance Source.
        3. Create Content Chunk with Embedding.
        """
        if not supabase or not self.client:
            return {"error": "DB or OpenAI missing"}

        # 1. Product ID
        # Only UUID is supported by schema for `products.id`? 
        # Wait, schema said `id uuid`. But user had `bigint`. 
        # I must handle "Lookup by Name" safely.
        
        # Search Product
        res = supabase.table("products").select("id").eq("name", product_name).execute()
        product_id = None
        if res.data:
            product_id = res.data[0]['id']
        else:
            # Create Product Stub
            res = supabase.table("products").insert({
                "name": product_name, 
                "category": "auto-created"
            }).execute()
            if res.data:
                product_id = res.data[0]['id']
        
        if not product_id:
            return {"error": "Failed to resolve Product ID"}

        # 2. Provenance Source
        # Check if source exists
        res = supabase.table("provenance_sources").select("id").eq("product_id", product_id).eq("url", source_url).execute()
        source_id = None
        if res.data:
            source_id = res.data[0]['id']
        else:
            res = supabase.table("provenance_sources").insert({
                "product_id": product_id,
                "source_type": metadata.get("source_type", "unknown"),
                "url": source_url,
                "title": metadata.get("title", ""),
                "channel_author": metadata.get("channel", "")
            }).execute()
            if res.data:
                source_id = res.data[0]['id']
        
        # 3. Embedding & Content Chunk
        embedding = await self.get_embedding(text)
        
        # Chunking: If text > 1000 chars, split? For now, assume one chunk per transcript (might be huge, but start simple)
        # OpenAI embedding has 8k token limit. YouTube captions fit usually.
        
        supabase.table("content_chunks").insert({
            "source_id": source_id,
            "chunk_text": text,
            "embedding": embedding
        }).execute()
        
        return {"status": "success", "product_id": product_id}

    async def analyze_product(self, product_name: str, query: str = "Genel değerlendirme") -> Dict:
        """
        Main RAG pipeline:
        1. Embed Query
        2. Retrieve Chunks
        3. Generate Answer
        """
        chunks = await self._retrieve_context(product_name, query)
        
        if not chunks:
            return {"error": "Bu ürün için yeterli güvenilir veri bulunamadı"}

        # Format Evidence
        evidence_text = ""
        unique_sources = set()
        for chunk in chunks:
            source_url = chunk.get('url', 'Unknown') # flattened from RPC
            unique_sources.add(source_url)
            evidence_text += f"- {chunk.get('chunk_text', '')} (Source: {source_url})\n"

        # Generate with LLM
        if self.client:
            user_content = KIYASGO_PROMPT.format(
                user_query=f"Analyze {product_name}: {query}", 
                evidence_text=evidence_text
            )
            
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": user_content}],
                temperature=0
            )
            
            response_text = response.choices[0].message.content
            
            return {
                "product": product_name,
                "ai_output": response_text,
                "sources": list(unique_sources)
            }
        
    async def _retrieve_context(self, product_name: str, query: str) -> List[Dict]:
        """
        Internal: Fetch relevant chunks using Vector Search.
        """
        if not supabase or not self.client:
            return []
            
        query_embedding = await self.get_embedding(query)
        
        # RPC Call to Postgres Function 'match_content_chunks'
        # We need to filter by product_name.
        # It's cleaner to get product_id first.
        res = supabase.table("products").select("id").eq("name", product_name).execute()
        if not res.data:
            return []
        
        product_id = res.data[0]['id']
        
        params = {
            "query_embedding": query_embedding,
            "match_threshold": 0.7,
            "match_count": 5,
            "filter_product_id": product_id
        }
        
        data = supabase.rpc("match_content_chunks", params).execute()
        return data.data

rag_engine = RAGEngine()

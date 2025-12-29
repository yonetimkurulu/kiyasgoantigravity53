from typing import Dict, List, Optional
from app.db.session import supabase
from app.core.config import settings
from openai import AsyncOpenAI
import json

# User-defined prompt template
# User-defined prompt template
# User-defined prompt template
KIYASGO_PROMPT = """Sen KıyasGO Asistanı'sın. Türkçe konuş.
Aşağıdaki ürün verilerini kullanarak kullanıcının sorusunu yanıtla.

⚠️ **ÖNEMLİ - MODEL EŞLEŞME KONTROLÜ:**
Kullanıcının aradığı ürün: "{requested_product}"
Veritabanında bulunan ürün: "{found_product}"

EĞER bu ikisi FARKLI ise (örn: "iPhone 17" vs "iPhone 17 Pro Max"), cevabına MUTLAKA şu uyarı ile başla:
> ⚠️ **Tam veri bulunamadı:** "{requested_product}" için veritabanımızda kayıt yok. Size en yakın model olan **{found_product}** hakkında bilgi veriyorum.

Bu uyarıyı ATLAMA. Farklı modellerse bu uyarı ZORUNLU.

Diğer Kurallar:
1. **Başlıkları Kalın Yaz**: Bölüm başlıklarını mutlaka markdown ile kalınlaştır.
2. **Kaynak Gösterme**: Cevabın içine/sonuna 'Kaynaklar' listesi ekleme.
3. **Yorumla**: Teknik özellikleri kullanıcı faydasına dönüştürerek anlat.

Soru: {user_query}

Kanıtlar:
{evidence_text}

İstenen Format:
**Özet:**
...
**Artılar:**
...
**Eksiler:**
...
**Sonuç Kararı:**
...
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
        try:
            chunks, resolved_name = await self._retrieve_context(product_name, query)
            
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
                    requested_product=product_name,
                    found_product=resolved_name,
                    user_query=query, 
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
            else:
                return {"error": "API Configuration Error: Missing OpenAI Key."}
        except Exception as e:
                print(f"DEBUG: Analyze Product Error: {e}")
                return {"error": f"AI Engine Error: {str(e)}"}
        
    async def _extract_product_name(self, text: str) -> str:
        """Extracts product name from a user query using LLM."""
        if not self.client: return text
        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{
                    "role": "system", 
                    "content": "Extract the commercial product name from the user text. Return ONLY the name. If comparison (X vs Y), return ONLY X (the first one). If none, return the text."
                }, {
                    "role": "user", 
                    "content": text
                }],
                temperature=0
            )
            return response.choices[0].message.content.strip()
        except:
            return text

    async def _retrieve_context(self, product_name: str, query: str) -> tuple[List[Dict], str]:
        """
        Internal: Fetch relevant chunks using Vector Search.
        """
        if not supabase or not self.client:
            return [], ""
            
        query_embedding = await self.get_embedding(query)
        
        # 1. Try resolving Product ID
        # Search Product (Exact) - Include 'specs'
        res = supabase.table("products").select("id, name, specs").eq("name", product_name).execute()
        
        if not res.data:
            print(f"DEBUG: Exact match failed for '{product_name}'. Trying extraction...")
            
            # 2. Try LLM Extraction
            extracted_name = await self._extract_product_name(product_name)
            
            # Retry Exact with extracted
            res = supabase.table("products").select("id, name, specs").eq("name", extracted_name).execute()
            
            if not res.data:
                # 3. Retry ILIKE with extracted
                res = supabase.table("products").select("id, name, specs").ilike("name", f"%{extracted_name}%").limit(1).execute()
        
        specs_chunk = None
        if not res.data:
            print(f"DEBUG: Product '{product_name}' NOT FOUND.")
            product_id = None
            resolved_name = product_name 
        else:
             product_id = res.data[0]['id']
             resolved_name = res.data[0]['name']
             specs_data = res.data[0].get('specs')
             
             if specs_data and isinstance(specs_data, dict):
                 # Format specs as text
                 specs_text = "TEKNİK ÖZELLİKLER VE DONANIM BİLGİSİ:\n"
                 for k, v in specs_data.items():
                     specs_text += f"- {k}: {v}\n"
                 
                 specs_chunk = {
                     "chunk_text": specs_text,
                     "url": "KiyasGO Resmi Teknik Özellikler"
                 }

        params = {
            "query_embedding": query_embedding,
            "match_threshold": 0.5,
            "match_count": 5,
            "filter_product_id": product_id
        }
        
        chunks = []
        
        # If we have specs, add them FIRST (High Priority)
        if specs_chunk:
            chunks.append(specs_chunk)

        # Retrieve Vector Chunks
        if product_id:
             data = supabase.rpc("match_content_chunks", params).execute()
             if data.data:
                 chunks.extend(data.data)

        if len(chunks) > (1 if specs_chunk else 0):
            return chunks, resolved_name
            
        # Fallback 1: GLOBAL Search
        print("DEBUG: strict match failed. Trying GLOBAL vector search...")
        try:
            params["filter_product_id"] = None
            global_data = supabase.rpc("match_content_chunks", params).execute()
            
            if global_data.data:
                 chunks.extend(global_data.data)
                 # If we found global chunks, return them (plus specs if we had them)
                 return chunks, resolved_name
        except Exception as e:
            print(f"DEBUG: Global search error: {e}")

        # Fallback 2: Description + Specs (if chunks failed entirely)
        print("DEBUG: No chunks found. Falling back to desc/specs.")
        desc_res = supabase.table("products").select("desc").eq("id", product_id).single().execute()
        
        # If we haven't added specs yet (e.g. strict match failed but ILIKE succeeded later or something edge case), add it now
        if not specs_chunk and product_id:
             # Re-fetch specs if we missed it? No, we fetched it above if we found product_id.
             pass

        if desc_res.data and desc_res.data.get("desc"):
            chunks.append({
                "chunk_text": desc_res.data["desc"],
                "url": "KiyasGO Ürün Açıklaması"
            })
            
        return chunks, resolved_name
        
        return [], ""

rag_engine = RAGEngine()

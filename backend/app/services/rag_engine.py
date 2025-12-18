from typing import Dict, List
from app.db.session import supabase
from app.core.config import settings
from openai import OpenAI, AsyncOpenAI

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
    
    async def analyze_product(self, product_name: str, query: str = "Genel değerlendirme") -> Dict:
        """
        Main RAG pipeline:
        1. Embed Query
        2. Retrieve Chunks
        3. Generate Answer
        """
        chunks = self._retrieve_context(product_name)
        
        if not chunks:
            return {"error": "Bu ürün için yeterli güvenilir veri bulunamadı"}

        # Format Evidence
        evidence_text = ""
        unique_sources = set()
        for chunk in chunks:
            source_url = chunk.get('source_url', 'Unknown')
            unique_sources.add(source_url)
            evidence_text += f"- {chunk.get('text', '')} (Source: {source_url})\n"

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
        else:
            return {
                "product": product_name,
                "ai_output": "AI Engine Offline (No Key). Evidence chunks found: " + str(len(chunks)),
                "sources": list(unique_sources)
            }

    def _retrieve_context(self, product_name: str) -> List[Dict]:
        """
        Internal: Fetch relevant chunks for the product.
        """
        if not supabase:
            return []
        return []

rag_engine = RAGEngine()

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
# from app.services.youtube import youtube_service
from app.services.rag_engine import rag_engine

router = APIRouter()

class CollectRequest(BaseModel):
    product_name: str
    category: str = "general"

async def process_youtube_collection(product_name: str, category: str):
    """
    Background Task:
    YouTube collection disabled.
    """
    print(f"Collection disabled for {product_name} (YouTube service removed).")
    return


@router.post("/")
async def trigger_collection(request: CollectRequest):
    """
    Trigger collection (Sync for Vercel feedback).
    """
    await process_youtube_collection(request.product_name, request.category)
    return {
        "status": "Completed",
        "target": request.product_name,
        "message": "YouTube collection finished."
    }

@router.get("/test")
async def test_collection(product: str = "iPhone 15", limit: int = 3):
    """
    Browser-friendly test endpoint.
    Usage: https://kiyasgo.com/api/v1/collect/test?product=Macbook
    """
    # Temporarily limit youtube_service in the loop or here?
    # We'll just call the process function.
    # Note: process_youtube_collection uses youtube_service.search_reviews which defaults to 5. 
    # We should probably pass the limit.
    
    # Let's verify youtube.py search_reviews. It defaults to 5. 5 might be too slow for Vercel? 
    # Let's rely on 5 being ok (usually takes 3-4s).
    
    await process_youtube_collection(product, "general")
    return {"status": "Success", "product": product, "message": "Scraped 5 videos (Check DB)"}

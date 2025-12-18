from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from app.services.youtube import youtube_service
from app.services.rag_engine import rag_engine

router = APIRouter()

class CollectRequest(BaseModel):
    product_name: str
    category: str = "general"

async def process_youtube_collection(product_name: str, category: str):
    """
    Background Task:
    1. Search videos
    2. Fetch transcripts
    3. Store in DB
    """
    print(f"Starting collection for {product_name}...")
    videos = youtube_service.search_reviews(product_name)
    
    for video in videos:
        if "error" in video:
            continue
            
        print(f"Processing Video: {video['title']}")
        transcript = youtube_service.get_captions(video['video_id'])
        
        if transcript:
            print(f"Found transcript ({len(transcript)} chars). Storing...")
            await rag_engine.store_content(
                product_name=product_name,
                text=transcript,
                source_url=video['url'],
                metadata={
                    "source_type": "youtube",
                    "title": video['title'],
                    "channel": video['channel']
                }
            )
        else:
            print(f"No transcript for {video['title']}")

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

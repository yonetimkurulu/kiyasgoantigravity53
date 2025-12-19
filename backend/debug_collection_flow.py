import asyncio
import os
from dotenv import load_dotenv

# Explicitly load .env from parent directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

from app.services.youtube import youtube_service
from app.services.rag_engine import rag_engine

async def debug_pipeline():
    print("--- DEBUGGING COLLECTION PIPELINE ---")
    product_name = "iPhone 15 Pro"
    
    # 1. Search
    print(f"\n1. Searching YouTube for '{product_name}'...")
    try:
        videos = youtube_service.search_reviews(product_name)
        print(f"Found {len(videos)} videos.")
        for v in videos:
            print(f" - {v.get('title')} ({v.get('video_id')})")
    except Exception as e:
        print(f"ERROR Searching: {e}")
        return

    if not videos:
        print("❌ No videos found. Quota exceeded or API key issue?")
        return

    # 2. Fetch & Store
    print(f"\n2. Fetching Captions...")
    
    success_count = 0
    for video in videos:
        print(f"\nProcessing: {video['title']} ({video['video_id']})")
        
        try:
            transcript = youtube_service.get_captions(video['video_id'])
            if transcript:
                print(f"✅ Transcript Found! Length: {len(transcript)} chars")
                
                # 3. Store
                print("   Storing in Supabase...")
                res = await rag_engine.store_content(
                    product_name=product_name,
                    text=transcript,
                    source_url=video['url'],
                    metadata={
                        "source_type": "youtube",
                        "title": video['title'],
                        "channel": video['channel']
                    }
                )
                print(f"   Result: {res}")
                success_count += 1
            else:
                print("   ❌ No transcript found.")
                
        except Exception as e:
            print(f"   ERROR Fetching/Storing: {e}")

    print(f"\n--- DONE. Stored {success_count}/{len(videos)} videos. ---")

if __name__ == "__main__":
    asyncio.run(debug_pipeline())

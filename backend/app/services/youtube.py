from googleapiclient.discovery import build
from app.core.config import settings
from typing import List, Dict

class YouTubeCollector:
    def __init__(self):
        self.api_key = settings.YOUTUBE_API_KEY
        self.youtube = None
        if self.api_key:
            self.youtube = build("youtube", "v3", developerKey=self.api_key)

    def search_reviews(self, product_name: str, max_results: int = 5) -> List[Dict]:
        if not self.youtube:
            return {"error": "YouTube API Key missing"}

        request = self.youtube.search().list(
            part="snippet",
            q=f"{product_name} inceleme review",
            type="video",
            maxResults=max_results,
            order="viewCount",  # Get popular reviews
            relevanceLanguage="tr"
        )
        response = request.execute()

        videos = []
        for item in response.get("items", []):
            video_id = item["id"]["videoId"]
            title = item["snippet"]["title"]
            channel = item["snippet"]["channelTitle"]
            
            # Fetch details/metrics
            videos.append({
                "source_type": "youtube",
                "video_id": video_id,
                "title": title,
                "channel": channel,
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "published_at": item["snippet"]["publishedAt"]
            })
            
        return videos

    def get_captions(self, video_id: str):
        # Note: Official Data API caption download requires OAuth which is complex for server-to-server.
        # Ideally, we use youtube-transcript-api (unofficial but ubiquitous) OR generic speech-to-text if allowed.
        # For 'Strict Legal', we rely on official API or manual input. 
        # Here we place a stub or would integrate a paid transcript service.
        pass

youtube_service = YouTubeCollector()

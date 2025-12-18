from googleapiclient.discovery import build
from app.core.config import settings
from typing import List, Dict, Optional
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

class YouTubeCollector:
    def __init__(self):
        self.api_key = settings.YOUTUBE_API_KEY
        self.youtube = None
        if self.api_key:
            self.youtube = build("youtube", "v3", developerKey=self.api_key)

    def search_reviews(self, product_name: str, max_results: int = 5) -> List[Dict]:
        if not self.youtube:
            return [{"error": "YouTube API Key missing"}]

        try:
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
                
                # Filter out obvious junk (optional basic filter)
                if "kılıf" in title.lower() or "unboxing" in title.lower():
                    continue

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
        except Exception as e:
            return [{"error": f"YouTube Search Failed: {str(e)}"}]

    def get_captions(self, video_id: str) -> Optional[str]:
        """
        Fetches transcript for a video. Tries Turkish first, then English.
        Returns combined string or None if failed.
        """
        try:
            # Try fetching Turkish, then English
            transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=['tr', 'en'])
            
            # Combine lines
            full_text = " ".join([t['text'] for t in transcript_list])
            return full_text
            
        except (TranscriptsDisabled, NoTranscriptFound):
            print(f"No transcript for video {video_id}")
            return None
        except Exception as e:
            print(f"Error fetching transcript for {video_id}: {e}")
            return None

youtube_service = YouTubeCollector()

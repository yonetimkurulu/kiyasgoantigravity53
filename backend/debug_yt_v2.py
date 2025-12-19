from youtube_transcript_api import YouTubeTranscriptApi
import inspect

print("--- DEBUGGING YOUTUBE TRANSCRIPT API V2 ---")
try:
    print(f"File: {inspect.getfile(YouTubeTranscriptApi)}")
    
    video_id = "dQw4w9WgXcQ"
    
    if hasattr(YouTubeTranscriptApi, 'list_transcripts'):
        print("Finding list_transcripts...")
        res = YouTubeTranscriptApi.list_transcripts(video_id)
        print("list_transcripts Works!")
    
    if hasattr(YouTubeTranscriptApi, 'get_transcript'):
        print("Finding get_transcript...")
        # ...
    
    print("\nTesting 'list' and 'fetch' methods found in dir():")
    
    if hasattr(YouTubeTranscriptApi, 'list'):
        try:
            print("Calling .list(video_id)...")
            res = YouTubeTranscriptApi.list(video_id)
            print(f"Result type: {type(res)}")
            print(res)
        except Exception as e:
            print(f"list() failed: {e}")

    if hasattr(YouTubeTranscriptApi, 'fetch'):
        try:
            print("Calling .fetch(video_id)...")
            res = YouTubeTranscriptApi.fetch(video_id)
            print(f"Result type: {type(res)}")
            print(res)
        except Exception as e:
            print(f"fetch() failed: {e}")

except Exception as e:
    print(f"CRASH: {e}")

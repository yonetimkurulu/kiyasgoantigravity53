from youtube_transcript_api import YouTubeTranscriptApi

print("--- DEBUGGING YOUTUBE TRANSCRIPT API ---")
try:
    print(f"Imported: {YouTubeTranscriptApi}")
    print("Attributes:")
    print(dir(YouTubeTranscriptApi))
    
    video_id = "dQw4w9WgXcQ" # Rick Roll (always has captions)
    print(f"\nAttempting fetch for {video_id}...")
    
    # Try standard static method
    if hasattr(YouTubeTranscriptApi, 'get_transcript'):
        data = YouTubeTranscriptApi.get_transcript(video_id)
        print("Success (Static Method)!")
    else:
        print("ERROR: get_transcript not found in class.")
        
except Exception as e:
    print(f"CRASH: {e}")

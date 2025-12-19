from youtube_transcript_api import YouTubeTranscriptApi

print("--- DEBUGGING YOUTUBE TRANSCRIPT API V3 ---")
try:
    video_id = "dQw4w9WgXcQ"
    
    print("Attempting to instantiate YouTubeTranscriptApi()...")
    try:
        api = YouTubeTranscriptApi()
        print("Instantiation Successful.")
        
        if hasattr(api, 'list'):
            print("Calling api.list(video_id)...")
            transcripts = api.list(video_id)
            print(f"Result: {transcripts}")
            
        if hasattr(api, 'fetch'):
            print("Calling api.fetch(video_id)...")
            # Usually fetch takes video_id and maybe language?
            res = api.fetch(video_id)
            print("Fetch result length:", len(res) )
            
    except TypeError as te:
        print(f"Instantiation Failed: {te}")
        # Maybe it needs an api key?
        
    except Exception as e:
        print(f"Error during usage: {e}")

except Exception as e:
    print(f"CRASH: {e}")

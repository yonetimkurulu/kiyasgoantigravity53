import requests
import json
import time

# Target URL (Localhost)
url = "http://127.0.0.1:8000/api/v1/collect/"

# Payload: Search for iPhone 15 Pro reviews
payload = {
    "product_name": "iPhone 15 Pro",
    "category": "smartphone"
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        print("\n✅ Success! Job Queued.")
        print(json.dumps(response.json(), indent=2))
        print("\n⏳ The backend is now searching YouTube and downloading transcripts in the background.")
        print("Wait 10-20 seconds, then check the 'content_chunks' table in Supabase or ask the Chatbot!")
    else:
        print(f"\n❌ Error {response.status_code}:")
        print(response.text)
        
except Exception as e:
    print(f"\n❌ Failed to connect: {e}")
    print("Is the backend running? (python -m uvicorn app.main:app --reload)")

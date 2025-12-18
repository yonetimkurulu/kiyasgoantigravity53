from supabase import create_client, Client
from app.core.config import settings

def get_supabase() -> Client:
    """
    Creates and returns a Supabase client instance.
    Uses the Service Role Key for backend operations (Read/Write access).
    """
    url: str = settings.SUPABASE_URL
    key: str = settings.SUPABASE_KEY
    
    if not url or not key:
        raise ValueError("Supabase URL or Key is missing in environment variables.")
        
    return create_client(url, key)

# Singleton instance for simple imports
# Usage: from app.db.session import supabase
try:
    supabase = get_supabase()
except ValueError:
    supabase = None
    print("Warning: Supabase credentials missing. DB operations will fail.")

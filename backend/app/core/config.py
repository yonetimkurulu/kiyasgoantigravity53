from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "KiyasGO AI"
    API_V1_STR: str = "/api/v1"
    
    # Supabase / DB
    SUPABASE_URL: str
    SUPABASE_KEY: str  # Service Role Key for backend (Write Access)
    
    # AI Providers
    OPENAI_API_KEY: str = ""
    
    # External APIs
    YOUTUBE_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

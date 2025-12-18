from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class CollectRequest(BaseModel):
    product_name: str
    category: str

@router.post("/")
async def trigger_collection(request: CollectRequest):
    return {
        "status": "Job Queued",
        "target": request.product_name,
        "module": "Auto-Classifier"
    }

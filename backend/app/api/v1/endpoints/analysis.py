from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_engine import rag_engine

router = APIRouter()

class AnalysisRequest(BaseModel):
    product_name: str

class AnalysisResponse(BaseModel):
    product_name: str
    analysis: str
    sources: list = []

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_product(request: AnalysisRequest):
    """
    Analyzes a product using the RAG engine.
    """
    try:
        # Call the RAG engine
        result = await rag_engine.analyze_product(request.product_name)
        
        # Check if result is an error dict or a string
        if isinstance(result, dict) and "error" in result:
             # Even if insufficient data, we return it as a valid response so frontend can show "Insufficient Data"
            return AnalysisResponse(
                product_name=request.product_name,
                analysis=result["error"],
                sources=[]
            )
            
        return AnalysisResponse(
            product_name=request.product_name,
            analysis=result,
            sources=[] # We can enhance rag_engine to return sources later
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

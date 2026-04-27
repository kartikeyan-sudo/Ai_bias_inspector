from fastapi import APIRouter, HTTPException

from app.schemas.common import ExplainabilityRequest, ExplainabilityResponse, SuggestFixResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/explainability", tags=["explainability"])


@router.post("/explain-bias", response_model=ExplainabilityResponse)
def explain_bias(req: ExplainabilityRequest):
    try:
        return gemini_service.explain_bias(req.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/suggest-fix", response_model=SuggestFixResponse)
def suggest_fix(req: ExplainabilityRequest):
    try:
        return gemini_service.suggest_fixes(req.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.ai import AiAdvisorResponse
from app.services.ai_advisor import generate_ai_advisor_insights

router = APIRouter()


@router.get("/insights", response_model=AiAdvisorResponse)
def get_ai_insights(db: Session = Depends(get_db)):
    """
    Get AI-powered DCIM Infrastructure Analysis, Health Scoring (0-100),
    Thermodynamic PUE efficiency diagnostics, and actionable optimization recommendations.
    """
    return generate_ai_advisor_insights(db)

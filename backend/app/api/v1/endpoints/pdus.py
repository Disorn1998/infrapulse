from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.pdu import PDU
from app.schemas.pdu import PDUResponse, PDUCreate, PDUUpdate

router = APIRouter()


@router.get("", response_model=List[PDUResponse])
def list_pdus(db: Session = Depends(get_db)):
    """List all Power Distribution Units (PDUs) and electrical feed assignments."""
    return db.query(PDU).order_by(PDU.name.asc()).all()


@router.post("", response_model=PDUResponse, status_code=status.HTTP_201_CREATED)
def create_pdu(pdu_in: PDUCreate, db: Session = Depends(get_db)):
    """Register a new rack PDU."""
    existing = db.query(PDU).filter(PDU.name == pdu_in.name.strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"PDU with name '{pdu_in.name}' already exists.",
        )
    pdu = PDU(**pdu_in.model_dump())
    db.add(pdu)
    db.commit()
    db.refresh(pdu)
    return pdu


@router.get("/{pdu_id}", response_model=PDUResponse)
def get_pdu(pdu_id: int, db: Session = Depends(get_db)):
    """Retrieve details of a specific PDU."""
    pdu = db.query(PDU).filter(PDU.id == pdu_id).first()
    if not pdu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDU not found.")
    return pdu


@router.put("/{pdu_id}", response_model=PDUResponse)
def update_pdu(pdu_id: int, pdu_in: PDUUpdate, db: Session = Depends(get_db)):
    """Update PDU attributes, rated wattage, or derate factor."""
    pdu = db.query(PDU).filter(PDU.id == pdu_id).first()
    if not pdu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PDU not found.")
    
    update_data = pdu_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pdu, field, value)

    db.commit()
    db.refresh(pdu)
    return pdu

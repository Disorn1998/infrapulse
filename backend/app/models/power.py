import uuid
from sqlalchemy import Column, String, Float, Integer, BigInteger, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class PowerConfig(Base):
    """
    Power & Physical Rack Configuration:
    Models node power ratings, primary and redundant (Feed A/B) PDU connections,
    and 42U rack elevation coordinates.
    """
    __tablename__ = "power_config"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    host_id = Column(String(100), ForeignKey("hosts.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Power Ratings (Watts)
    idle_watts = Column(Float, nullable=False, default=15.0)     # Power draw at idle (0% load)
    rated_watts = Column(Float, nullable=False, default=65.0)    # Maximum rated power draw (TDP / PSU limit)
    
    # PDU Feed Assignment for N+1 Redundancy
    pdu_id = Column(BigInteger, ForeignKey("pdu.id", ondelete="SET NULL"), nullable=True, index=True)
    secondary_pdu_id = Column(BigInteger, ForeignKey("pdu.id", ondelete="SET NULL"), nullable=True, index=True)
    pdu_outlet = Column(String(50), nullable=True, default="Outlet-01")

    # DCIM 42U Rack Elevation Properties
    rack_name = Column(String(50), nullable=False, default="Rack-01")
    rack_unit_start = Column(Integer, nullable=False, default=1)   # e.g., Slot U1
    rack_unit_height = Column(Integer, nullable=False, default=1)  # e.g., 1U, 2U, 4U

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    host = relationship("Host", back_populates="power_config")
    pdu = relationship("PDU", foreign_keys=[pdu_id], back_populates="power_configs")
    secondary_pdu = relationship("PDU", foreign_keys=[secondary_pdu_id])

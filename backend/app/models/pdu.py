from sqlalchemy import Column, String, Float, BigInteger, Integer, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class PDU(Base):
    """
    Power Distribution Unit (PDU) Table:
    Models physical rack PDUs, feed phase topology (Feed A vs Feed B),
    rated capacity, and electrical derate limits (NEC 80% continuous rule).
    """
    __tablename__ = "pdu"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, unique=True, index=True)  # e.g., 'PDU-A1', 'PDU-B1'
    feed = Column(String(1), nullable=False)                            # 'A' | 'B'
    rack_name = Column(String(50), nullable=True, default="Rack-01")
    rated_watts = Column(Float, nullable=False, default=3680.0)        # Nominal circuit capacity (e.g. 16A * 230V = 3680 W)
    derate_factor = Column(Float, nullable=False, default=0.800)       # NEC 80% continuous load safety factor (e.g. 2944 W)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    power_configs = relationship("PowerConfig", back_populates="pdu", foreign_keys="PowerConfig.pdu_id")

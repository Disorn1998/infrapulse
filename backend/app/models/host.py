from sqlalchemy import Column, String, Integer, BigInteger, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Host(Base):
    """
    Host Table: Represents a monitored physical machine, VM, or node.
    Enforces UNIQUE on hostname to prevent duplicate host creation during ingestion.
    """
    __tablename__ = "hosts"

    id = Column(String(100), primary_key=True, index=True)
    hostname = Column(String(100), nullable=False, unique=True, index=True)
    ip_address = Column(String(45), nullable=True)
    os_type = Column(String(50), nullable=False)  # 'ubuntu', 'windows', 'linux', 'darwin'
    os_version = Column(String(100), nullable=True)
    cpu_count = Column(Integer, nullable=True, default=1)
    total_ram_bytes = Column(BigInteger, nullable=True, default=0)
    total_disk_bytes = Column(BigInteger, nullable=True, default=0)
    agent_version = Column(String(50), nullable=True, default="1.0.0")
    status = Column(String(20), nullable=False, default="online")  # 'online', 'warning', 'critical', 'offline'
    is_test = Column(Boolean, nullable=False, default=False, server_default="false")
    last_seen = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    metrics = relationship("Metric", back_populates="host", cascade="all, delete-orphan", order_by="desc(Metric.timestamp)")
    power_config = relationship("PowerConfig", back_populates="host", uselist=False, cascade="all, delete-orphan")
    alerts = relationship("AlertConfig", back_populates="host")

from sqlalchemy import Column, String, Float, BigInteger, Integer, DateTime, ForeignKey, Index, func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Metric(Base):
    """
    Metric Table: High-frequency time-series telemetry data collected by agents.
    
    Attributes:
        id: BIGSERIAL primary key (BigInteger in Postgres, Integer rowid in SQLite).
        timestamp: TIMESTAMPTZ sampled on agent side.
        received_at: TIMESTAMPTZ server-side ingress arrival timestamp (used for clock skew & ingestion lag analysis).
        
    Composite Index on (host_id, timestamp) enables sub-millisecond lookups.
    """
    __tablename__ = "metrics"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    host_id = Column(String(100), ForeignKey("hosts.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Time-series timestamps with timezone
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    received_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    
    # Core IT Metrics
    cpu_percent = Column(Float, nullable=False)
    ram_percent = Column(Float, nullable=False)
    ram_used_bytes = Column(BigInteger, nullable=True, default=0)
    disk_percent = Column(Float, nullable=False)
    disk_used_bytes = Column(BigInteger, nullable=True, default=0)
    net_sent_bytes_per_sec = Column(Float, nullable=True, default=0.0)
    net_recv_bytes_per_sec = Column(Float, nullable=True, default=0.0)
    uptime_seconds = Column(BigInteger, nullable=True, default=0)

    # System Load (Unix load averages)
    load_1m = Column(Float, nullable=True)
    load_5m = Column(Float, nullable=True)
    load_15m = Column(Float, nullable=True)

    # Dynamic Power Modeling (Watts) calculated at ingestion:
    # Power(t) = IdleWatts + (CPU% / 100) * (RatedWatts - IdleWatts)
    calculated_power_watts = Column(Float, nullable=True, default=0.0)

    # Thermal & Temperature Metric (°C)
    cpu_temperature_celsius = Column(Float, nullable=True, default=42.0)

    # Relationship
    host = relationship("Host", back_populates="metrics")

    __table_args__ = (
        Index("ix_metrics_host_timestamp", "host_id", "timestamp"),
    )

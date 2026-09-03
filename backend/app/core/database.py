import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("infrapulse.database")

# Create SQLAlchemy Database Engine
engine = create_engine(
    settings.get_database_url(),
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# Session Factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base for ORM Models
Base = declarative_base()


def get_db() -> Generator:
    """Dependency for obtaining database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initializes database tables and seeds default DCIM facility settings,
    dual-feed PDUs (Feed A / Feed B), and alert threshold presets.
    """
    logger.info("Initializing database schema...")
    import app.models  # noqa: F401
    
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created or verified successfully.")

    # Seed initial configuration records
    db = SessionLocal()
    try:
        from app.models.facility import FacilitySettings
        from app.models.pdu import PDU
        from app.models.alert import AlertConfig

        # 1. Seed or Upgrade Singleton Facility Settings
        existing_facility = db.query(FacilitySettings).filter(FacilitySettings.id == 1).first()
        if not existing_facility:
            logger.info("Seeding default Facility Settings (Bangkok Edge DC - Zone A)...")
            default_facility = FacilitySettings(
                id=1,
                facility_name="Bangkok Edge DC - Zone A",
                total_power_capacity_watts=10000.0,  # 10 kW total electrical capacity
                fixed_overhead_watts=45.0,           # 45 W baseline Mini DC overhead (switch 25W + LED/controller 20W)
                cooling_overhead_factor=0.15,        # 15% In-Row Precision Cooling coefficient (k_c)
                pdu_loss_factor=0.03,                # 3% High-efficiency PDU distribution loss (lambda_pdu)
                target_pue=1.30                      # BOI benchmark target PUE
            )
            db.add(default_facility)
        else:
            # Calibrate existing facility to modern Mini DC baseline
            existing_facility.fixed_overhead_watts = 45.0
            existing_facility.cooling_overhead_factor = 0.15
            existing_facility.pdu_loss_factor = 0.03
            existing_facility.target_pue = 1.30

        # 2. Seed Default Dual-Feed PDUs (Feed A & Feed B)
        pdu_count = db.query(PDU).count()
        if pdu_count == 0:
            logger.info("Seeding default Dual-Feed PDUs (PDU-A1 and PDU-B1)...")
            default_pdus = [
                PDU(
                    name="PDU-A1",
                    feed="A",
                    rack_name="Rack-01",
                    rated_watts=3680.0,        # 16A @ 230V = 3680 W
                    derate_factor=0.800,       # 80% NEC continuous load limit = 2944 W
                ),
                PDU(
                    name="PDU-B1",
                    feed="B",
                    rack_name="Rack-01",
                    rated_watts=3680.0,        # 16A @ 230V = 3680 W
                    derate_factor=0.800,       # 80% NEC continuous load limit = 2944 W
                ),
            ]
            db.add_all(default_pdus)

        # 3. Seed Default Global Alert Configurations
        alert_count = db.query(AlertConfig).count()
        if alert_count == 0:
            logger.info("Seeding default Alert Config thresholds...")
            default_rules = [
                AlertConfig(
                    metric_name="cpu_percent",
                    operator=">=",
                    threshold_value=85.0,
                    recipient_email=settings.DEFAULT_ALERT_RECIPIENT,
                    cooldown_minutes=15,
                    is_active=True,
                    current_state="OK",
                ),
                AlertConfig(
                    metric_name="disk_percent",
                    operator=">=",
                    threshold_value=90.0,
                    recipient_email=settings.DEFAULT_ALERT_RECIPIENT,
                    cooldown_minutes=60,
                    is_active=True,
                    current_state="OK",
                ),
                AlertConfig(
                    metric_name="ram_percent",
                    operator=">=",
                    threshold_value=90.0,
                    recipient_email=settings.DEFAULT_ALERT_RECIPIENT,
                    cooldown_minutes=30,
                    is_active=True,
                    current_state="OK",
                ),
            ]
            db.add_all(default_rules)

        db.commit()
    except Exception as e:
        logger.error(f"Error seeding initial database records: {e}")
        db.rollback()
    finally:
        db.close()

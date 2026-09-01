"""Initial schema with hosts, metrics, pdu, power_config, facility_settings, alerts

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-01 09:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Hosts Table
    op.create_table(
        "hosts",
        sa.Column("id", sa.String(length=100), primary_key=True),
        sa.Column("hostname", sa.String(length=100), nullable=False, unique=True),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("os_type", sa.String(length=50), nullable=False),
        sa.Column("os_version", sa.String(length=100), nullable=True),
        sa.Column("cpu_count", sa.Integer(), nullable=True, server_default="1"),
        sa.Column("total_ram_bytes", sa.BigInteger(), nullable=True, server_default="0"),
        sa.Column("total_disk_bytes", sa.BigInteger(), nullable=True, server_default="0"),
        sa.Column("agent_version", sa.String(length=50), nullable=True, server_default="1.0.0"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="online"),
        sa.Column("last_seen", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_hosts_hostname", "hosts", ["hostname"])

    # 2. PDU Table
    op.create_table(
        "pdu",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(length=50), nullable=False, unique=True),
        sa.Column("feed", sa.String(length=1), nullable=False),
        sa.Column("rack_name", sa.String(length=50), nullable=True, server_default="Rack-01"),
        sa.Column("rated_watts", sa.Float(), nullable=False, server_default="3680.0"),
        sa.Column("derate_factor", sa.Float(), nullable=False, server_default="0.800"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_pdu_name", "pdu", ["name"])

    # 3. Power Config Table
    op.create_table(
        "power_config",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("host_id", sa.String(length=100), sa.ForeignKey("hosts.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("idle_watts", sa.Float(), nullable=False, server_default="15.0"),
        sa.Column("rated_watts", sa.Float(), nullable=False, server_default="65.0"),
        sa.Column("pdu_id", sa.BigInteger(), sa.ForeignKey("pdu.id", ondelete="SET NULL"), nullable=True),
        sa.Column("secondary_pdu_id", sa.BigInteger(), sa.ForeignKey("pdu.id", ondelete="SET NULL"), nullable=True),
        sa.Column("pdu_outlet", sa.String(length=50), nullable=True, server_default="Outlet-01"),
        sa.Column("rack_name", sa.String(length=50), nullable=False, server_default="Rack-01"),
        sa.Column("rack_unit_start", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("rack_unit_height", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # 4. Facility Settings Table (Singleton)
    op.create_table(
        "facility_settings",
        sa.Column("id", sa.Integer(), primary_key=True, default=1),
        sa.Column("facility_name", sa.String(length=100), nullable=False, server_default="Bangkok Edge DC - Zone A"),
        sa.Column("total_power_capacity_watts", sa.Float(), nullable=False, server_default="10000.0"),
        sa.Column("fixed_overhead_watts", sa.Float(), nullable=False, server_default="250.0"),
        sa.Column("cooling_overhead_factor", sa.Float(), nullable=False, server_default="0.25"),
        sa.Column("pdu_loss_factor", sa.Float(), nullable=False, server_default="0.05"),
        sa.Column("target_pue", sa.Float(), nullable=False, server_default="1.30"),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint("id = 1", name="ck_facility_settings_single_row"),
    )

    # 5. Metrics Table (Time-Series)
    op.create_table(
        "metrics",
        sa.Column("id", sa.BigInteger(), primary_key=True, autoincrement=True),
        sa.Column("host_id", sa.String(length=100), sa.ForeignKey("hosts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("received_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("cpu_percent", sa.Float(), nullable=False),
        sa.Column("ram_percent", sa.Float(), nullable=False),
        sa.Column("ram_used_bytes", sa.BigInteger(), nullable=True, server_default="0"),
        sa.Column("disk_percent", sa.Float(), nullable=False),
        sa.Column("disk_used_bytes", sa.BigInteger(), nullable=True, server_default="0"),
        sa.Column("net_sent_bytes_per_sec", sa.Float(), nullable=True, server_default="0.0"),
        sa.Column("net_recv_bytes_per_sec", sa.Float(), nullable=True, server_default="0.0"),
        sa.Column("uptime_seconds", sa.BigInteger(), nullable=True, server_default="0"),
        sa.Column("load_1m", sa.Float(), nullable=True),
        sa.Column("load_5m", sa.Float(), nullable=True),
        sa.Column("load_15m", sa.Float(), nullable=True),
        sa.Column("calculated_power_watts", sa.Float(), nullable=True, server_default="0.0"),
    )
    op.create_index("ix_metrics_host_timestamp", "metrics", ["host_id", "timestamp"])
    op.create_index("ix_metrics_timestamp", "metrics", ["timestamp"])
    op.create_index("ix_metrics_received_at", "metrics", ["received_at"])

    # 6. Alert Config Table
    op.create_table(
        "alert_config",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("host_id", sa.String(length=100), sa.ForeignKey("hosts.id", ondelete="CASCADE"), nullable=True),
        sa.Column("metric_name", sa.String(length=50), nullable=False),
        sa.Column("operator", sa.String(length=10), nullable=False, server_default=">="),
        sa.Column("threshold_value", sa.Float(), nullable=False),
        sa.Column("recipient_email", sa.String(length=255), nullable=False),
        sa.Column("cooldown_minutes", sa.Integer(), nullable=False, server_default="15"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("current_state", sa.String(length=20), nullable=False, server_default="OK"),
        sa.Column("consecutive_breaches", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("state_changed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_notified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # 7. Alert History Table
    op.create_table(
        "alert_history",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("alert_config_id", sa.String(length=36), sa.ForeignKey("alert_config.id", ondelete="SET NULL"), nullable=True),
        sa.Column("host_id", sa.String(length=100), sa.ForeignKey("hosts.id", ondelete="CASCADE"), nullable=True),
        sa.Column("metric_name", sa.String(length=50), nullable=False),
        sa.Column("triggered_value", sa.Float(), nullable=True),
        sa.Column("threshold_value", sa.Float(), nullable=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="TRIGGERED"),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_alert_history_sent_at", "alert_history", ["sent_at"])


def downgrade() -> None:
    op.drop_table("alert_history")
    op.drop_table("alert_config")
    op.drop_table("metrics")
    op.drop_table("facility_settings")
    op.drop_table("power_config")
    op.drop_table("pdu")
    op.drop_table("hosts")

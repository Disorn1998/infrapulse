from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class AiInsightCard(BaseModel):
    id: str
    category: str                         # 'ENERGY_OPTIMIZATION' | 'ELECTRICAL_SAFETY' | 'CAPACITY_PLANNING' | 'HARDWARE_HEALTH'
    severity: str                         # 'CRITICAL' | 'WARNING' | 'OPTIMIZATION' | 'INFO'
    title: str
    summary: str
    impact: str
    recommended_action: str
    estimated_savings_or_benefit: Optional[str] = None
    action_type: Optional[str] = None     # 'REBALANCE_FEED' | 'CONSOLIDATE_NODES' | 'EXPAND_CAPACITY' | 'INSPECT_NODE'
    created_at: str


class AiAdvisorResponse(BaseModel):
    datacenter_health_score: int          # 0 - 100
    health_status: str                    # 'OPTIMAL' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL'
    executive_summary: str
    key_metrics_summary: dict
    insights: List[AiInsightCard]
    analyzed_at: str

    model_config = ConfigDict(from_attributes=True)

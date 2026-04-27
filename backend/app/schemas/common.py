from typing import Any, Dict

from pydantic import BaseModel


class MetricsPayload(BaseModel):
    accuracy: float
    female_rate: float
    male_rate: float
    bias_difference: float
    demographic_parity_diff: float
    equal_opportunity_diff: float
    bias_level: str


class DatasetProfile(BaseModel):
    rows: int
    columns: int
    sensitive_column: str = "gender"
    target_column: str = "loan_approved"
    missing_values: int


class ExplainabilityRequest(BaseModel):
    metrics: MetricsPayload
    features_used: list[str]
    dataset_profile: DatasetProfile
    model_type: str = "LogisticRegression"


class ExplainabilityResponse(BaseModel):
    executive_summary: str
    bias_explanation: str
    root_causes: list[str]
    proxy_risk_features: list[str]
    recommendations: list[str]
    confidence_notes: str


class SuggestFixResponse(BaseModel):
    priority_actions: list[str]
    short_term_plan: list[str]
    medium_term_plan: list[str]
    risk_tradeoffs: list[str]
    monitoring_plan: list[str]
    notes: str

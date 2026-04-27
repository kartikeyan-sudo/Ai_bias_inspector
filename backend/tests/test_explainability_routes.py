from fastapi.testclient import TestClient

from app.main import app
from app.services.gemini_service import gemini_service


client = TestClient(app)


def _payload():
    return {
        "metrics": {
            "accuracy": 0.81,
            "female_rate": 0.42,
            "male_rate": 0.61,
            "bias_difference": 0.19,
            "demographic_parity_diff": 0.19,
            "equal_opportunity_diff": 0.17,
            "bias_level": "High",
        },
        "features_used": ["income", "age"],
        "dataset_profile": {
            "rows": 200,
            "columns": 4,
            "sensitive_column": "gender",
            "target_column": "loan_approved",
            "missing_values": 0,
        },
        "model_type": "LogisticRegression",
    }


def test_explain_bias_contract(monkeypatch):
    monkeypatch.setattr(
        gemini_service,
        "explain_bias",
        lambda _: {
            "executive_summary": "Summary",
            "bias_explanation": "Explanation",
            "root_causes": ["income imbalance"],
            "proxy_risk_features": ["income"],
            "recommendations": ["collect more balanced data"],
            "confidence_notes": "Based on provided metrics only.",
        },
    )

    response = client.post("/explainability/explain-bias", json=_payload())

    assert response.status_code == 200
    body = response.json()
    assert "executive_summary" in body
    assert isinstance(body["root_causes"], list)


def test_suggest_fix_contract(monkeypatch):
    monkeypatch.setattr(
        gemini_service,
        "suggest_fixes",
        lambda _: {
            "priority_actions": ["apply threshold optimizer"],
            "short_term_plan": ["run fairness evaluation each retrain"],
            "medium_term_plan": ["add monitoring dashboard"],
            "risk_tradeoffs": ["accuracy may drop slightly"],
            "monitoring_plan": ["track dp diff weekly"],
            "notes": "Prioritize low-effort mitigations first.",
        },
    )

    response = client.post("/explainability/suggest-fix", json=_payload())

    assert response.status_code == 200
    body = response.json()
    assert "priority_actions" in body
    assert isinstance(body["priority_actions"], list)

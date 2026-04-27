import json
from typing import Any, Dict

from app.core.config import settings

try:
    from google import genai
except ImportError:  # pragma: no cover
    genai = None


class GeminiService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model

    def _client(self):
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured")
        if genai is None:
            raise ValueError("google-genai is not installed")
        return genai.Client(api_key=self.api_key)

    def explain_bias(self, analysis_payload: Dict[str, Any]) -> Dict[str, Any]:
        prompt = self._build_explain_prompt(analysis_payload)
        schema = {
            "type": "OBJECT",
            "properties": {
                "executive_summary": {"type": "STRING"},
                "bias_explanation": {"type": "STRING"},
                "root_causes": {"type": "ARRAY", "items": {"type": "STRING"}},
                "proxy_risk_features": {"type": "ARRAY", "items": {"type": "STRING"}},
                "recommendations": {"type": "ARRAY", "items": {"type": "STRING"}},
                "confidence_notes": {"type": "STRING"},
            },
            "required": [
                "executive_summary",
                "bias_explanation",
                "root_causes",
                "proxy_risk_features",
                "recommendations",
                "confidence_notes",
            ],
        }
        try:
            return self._generate_json(prompt, schema)
        except Exception as exc:
            return {
                "executive_summary": "Gemini response unavailable due quota or API error.",
                "bias_explanation": "Core fairness metrics are still valid and were computed locally by Fairlearn.",
                "root_causes": ["Unable to generate LLM interpretation at this time."],
                "proxy_risk_features": analysis_payload.get("features_used", []),
                "recommendations": [
                    "Retry explainability after quota reset.",
                    "Use mitigation endpoint and compare before vs after metrics.",
                ],
                "confidence_notes": f"Fallback response: {type(exc).__name__}",
            }

    def suggest_fixes(self, analysis_payload: Dict[str, Any]) -> Dict[str, Any]:
        prompt = self._build_fix_prompt(analysis_payload)
        schema = {
            "type": "OBJECT",
            "properties": {
                "priority_actions": {"type": "ARRAY", "items": {"type": "STRING"}},
                "short_term_plan": {"type": "ARRAY", "items": {"type": "STRING"}},
                "medium_term_plan": {"type": "ARRAY", "items": {"type": "STRING"}},
                "risk_tradeoffs": {"type": "ARRAY", "items": {"type": "STRING"}},
                "monitoring_plan": {"type": "ARRAY", "items": {"type": "STRING"}},
                "notes": {"type": "STRING"},
            },
            "required": [
                "priority_actions",
                "short_term_plan",
                "medium_term_plan",
                "risk_tradeoffs",
                "monitoring_plan",
                "notes",
            ],
        }
        try:
            return self._generate_json(prompt, schema)
        except Exception as exc:
            return {
                "priority_actions": [
                    "Run ThresholdOptimizer and compare demographic parity difference.",
                    "Audit feature distributions across sensitive groups.",
                ],
                "short_term_plan": [
                    "Log fairness metrics for each training run.",
                    "Set alert if bias difference exceeds 0.15.",
                ],
                "medium_term_plan": [
                    "Collect more representative samples across groups.",
                    "Add fairness regression tests to CI.",
                ],
                "risk_tradeoffs": ["Bias reduction may reduce raw accuracy."],
                "monitoring_plan": ["Track demographic parity and equal opportunity weekly."],
                "notes": f"Fallback response: {type(exc).__name__}",
            }

    def _generate_json(self, prompt: str, schema: Dict[str, Any]) -> Dict[str, Any]:
        client = self._client()

        response = client.models.generate_content(
            model=self.model,
            contents=prompt,
            config={
                "temperature": 0.2,
                "response_mime_type": "application/json",
                "response_schema": schema,
            },
        )

        text = response.text or "{}"
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"notes": "Fallback parse from plain text", "raw": text}

    def _build_explain_prompt(self, payload: Dict[str, Any]) -> str:
        return (
            "You are a Responsible AI fairness auditor for a loan approval model. "
            "Explain measured bias in business language without inventing causal claims. "
            "Differentiate evidence from assumptions, mention metric tradeoffs, and provide practical guidance.\n\n"
            f"ANALYSIS_PAYLOAD:\n{json.dumps(payload, ensure_ascii=True, indent=2)}"
        )

    def _build_fix_prompt(self, payload: Dict[str, Any]) -> str:
        return (
            "You are a fairness optimization advisor. Recommend implementation-ready mitigation actions "
            "ranked by impact and effort. Keep recommendations specific to the provided metrics and feature set. "
            "Include short-term and medium-term plans plus monitoring actions.\n\n"
            f"ANALYSIS_PAYLOAD:\n{json.dumps(payload, ensure_ascii=True, indent=2)}"
        )


gemini_service = GeminiService()

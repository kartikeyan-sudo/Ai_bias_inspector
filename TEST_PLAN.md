# AI Bias Inspector Test Plan

## Objectives
- Validate core analysis pipeline endpoints.
- Validate explainability endpoint contracts.
- Validate one live Gemini call only to preserve API credits.
- Validate frontend build and runtime startup.

## Scope
- Backend: FastAPI routes for health, train-model, explainability.
- Frontend: build, app startup, API integration surface.
- Deployment readiness: Cloud Run and Firebase config file presence.

## Test Cases
1. Backend health check returns status ok.
2. Train-model endpoint returns fairness and dataset profile fields.
3. Train-model rejects non-CSV files with 400 response.
4. Explain-bias endpoint schema contract using mocked Gemini response.
5. Suggest-fix endpoint schema contract using mocked Gemini response.
6. Single live Gemini test call through backend explainability endpoint.
7. Frontend production build succeeds.
8. Backend and frontend startup commands succeed.

## Execution Rules
- Only one live Gemini inference request is allowed.
- All other explainability tests must mock Gemini service.
- Record pass/fail and evidence after run.

# AI Bias Inspector Test Results

## Summary
- Total planned tests: 8
- Passed: 7
- Failed: 1 (expected external quota limitation)

## Results
1. Backend health endpoint
- Status: PASS
- Evidence: GET /health returned {"status":"ok"}

2. Train-model endpoint contract
- Status: PASS
- Evidence: Included fairness fields and dataset_profile in response.

3. Train-model non-CSV validation
- Status: PASS
- Evidence: Returned HTTP 400 for invalid file.

4. Explain-bias schema contract (mocked)
- Status: PASS
- Evidence: Response matched required fields in tests.

5. Suggest-fix schema contract (mocked)
- Status: PASS
- Evidence: Response matched required fields in tests.

6. Single live Gemini functional test (exactly one call)
- Status: FAIL (external)
- Evidence: Gemini API returned 429 RESOURCE_EXHAUSTED (quota exceeded).
- Mitigation implemented: Backend now returns graceful fallback payloads when Gemini is unavailable.

7. Frontend production build
- Status: PASS
- Evidence: vite build completed successfully.

8. Runtime startup
- Status: PASS
- Evidence: Backend running on http://localhost:8000 and frontend on http://localhost:5173.

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.dataset_service import build_dataset_profile, parse_csv_upload
from app.services.fairness_service import compute_fairness
from app.services.ml_service import run_mitigation, run_training

router = APIRouter(tags=["analysis"])


def _response_payload(metrics, use_gender: bool):
    return {
        "accuracy": metrics["accuracy"],
        "female_rate": metrics["female_rate"],
        "male_rate": metrics["male_rate"],
        "bias_difference": metrics["bias_difference"],
        "demographic_parity_diff": metrics["demographic_parity_diff"],
        "equal_opportunity_diff": metrics["equal_opportunity_diff"],
        "bias_level": metrics["bias_level"],
        "chart_data": metrics["chart_data"],
        "features_used": ["income", "age", "gender"] if use_gender else ["income", "age"],
    }


@router.post("/train-model")
def train_model_route(file: UploadFile = File(...), use_gender: bool = Form(False)):
    try:
        df = parse_csv_upload(file)
        y_test, y_pred, sensitive = run_training(df, use_gender)
        metrics = compute_fairness(y_test, y_pred, sensitive)
        payload = _response_payload(metrics, use_gender)
        payload["dataset_profile"] = build_dataset_profile(df)
        return payload
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/analyze-bias")
def analyze_bias_route(file: UploadFile = File(...), use_gender: bool = Form(False)):
    return train_model_route(file=file, use_gender=use_gender)


@router.post("/mitigate-bias")
def mitigate_bias_route(file: UploadFile = File(...), use_gender: bool = Form(False)):
    try:
        df = parse_csv_upload(file)
        y_test, y_pred_mitigated, sensitive = run_mitigation(df, use_gender)
        metrics = compute_fairness(y_test, y_pred_mitigated, sensitive)
        payload = _response_payload(metrics, use_gender)
        payload["dataset_profile"] = build_dataset_profile(df)
        return payload
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

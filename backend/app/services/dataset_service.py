import io

import pandas as pd
from fastapi import HTTPException, UploadFile


def parse_csv_upload(file: UploadFile) -> pd.DataFrame:
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file format. Upload CSV.")

    try:
        content = file.file.read()
        return pd.read_csv(io.BytesIO(content))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read CSV: {exc}") from exc


def build_dataset_profile(df: pd.DataFrame) -> dict:
    return {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "sensitive_column": "gender",
        "target_column": "loan_approved",
        "missing_values": int(df.isna().sum().sum()),
    }

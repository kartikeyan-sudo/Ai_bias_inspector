from typing import Tuple, Any

import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from fairlearn.postprocessing import ThresholdOptimizer

REQUIRED_COLUMNS = {"income", "age", "gender", "loan_approved"}


def _validate_input(df: pd.DataFrame) -> None:
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")


def train_model(
    df: pd.DataFrame,
    use_gender: bool = False,
    test_size: float = 0.3,
    random_state: int = 42,
) -> Tuple[LogisticRegression, pd.DataFrame, pd.Series, pd.Series]:
    """Train a logistic regression model and return holdout data for evaluation."""
    _validate_input(df)
    data = df.copy()

    # ensure mapping strings to int if needed
    data["gender"] = data["gender"].astype(str).str.strip().map({"Male": 1, "Female": 0, "1": 1, "1.0": 1, "0": 0, "0.0": 0})
    
    if data["gender"].isna().any():
        raise ValueError("Unexpected values in 'gender'. Expected only 'Male' or 'Female'.")

    features = data[["income", "age", "gender"]] if use_gender else data[["income", "age"]]
    target = data["loan_approved"]
    sensitive = data["gender"]

    x_train, x_test, y_train, y_test, _, s_test = train_test_split(
        features, target, sensitive, test_size=test_size, random_state=random_state, stratify=target
    )

    model = LogisticRegression(solver="liblinear", random_state=random_state)
    model.fit(x_train, y_train)

    return model, x_test, y_test, s_test

def mitigate_bias(
    df: pd.DataFrame,
    use_gender: bool = False,
    test_size: float = 0.3,
    random_state: int = 42,
) -> Tuple[Any, pd.DataFrame, pd.Series, pd.Series, pd.Series]:
    """Train a model and apply bias mitigation using ThresholdOptimizer."""
    model, x_test, y_test, s_test = train_model(df, use_gender, test_size, random_state)
    
    # We need training data for the ThresholdOptimizer
    data = df.copy()
    data["gender"] = data["gender"].astype(str).str.strip().map({"Male": 1, "Female": 0, "1": 1, "1.0": 1, "0": 0, "0.0": 0})
    features = data[["income", "age", "gender"]] if use_gender else data[["income", "age"]]
    target = data["loan_approved"]
    sensitive = data["gender"]
    
    x_train, _, y_train, _, s_train, _ = train_test_split(
        features, target, sensitive, test_size=test_size, random_state=random_state, stratify=target
    )
    
    optimizer = ThresholdOptimizer(
        estimator=model,
        constraints="demographic_parity",
        predict_method="predict_proba",
        prefit=True
    )
    optimizer.fit(x_train, y_train, sensitive_features=s_train)
    
    y_pred_mitigated = optimizer.predict(x_test, sensitive_features=s_test)
    
    return optimizer, x_test, y_test, s_test, y_pred_mitigated

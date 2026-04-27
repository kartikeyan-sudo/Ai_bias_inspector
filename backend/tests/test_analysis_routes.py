from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)
DATASET_PATH = Path(__file__).resolve().parents[1] / "test.csv"


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_train_model_returns_expected_fields():
    with open(DATASET_PATH, "rb") as csv_file:
        response = client.post(
            "/train-model",
            files={"file": ("test.csv", csv_file, "text/csv")},
            data={"use_gender": "false"},
        )

    assert response.status_code == 200
    payload = response.json()

    expected_fields = {
        "accuracy",
        "female_rate",
        "male_rate",
        "bias_difference",
        "demographic_parity_diff",
        "equal_opportunity_diff",
        "bias_level",
        "chart_data",
        "features_used",
        "dataset_profile",
    }
    assert expected_fields.issubset(payload.keys())
    assert payload["dataset_profile"]["rows"] > 0


def test_train_model_rejects_non_csv():
    response = client.post(
        "/train-model",
        files={"file": ("bad.txt", b"hello", "text/plain")},
        data={"use_gender": "false"},
    )

    assert response.status_code == 400
    assert "Invalid file format" in response.json()["detail"]

from fastapi import APIRouter
from pydantic import BaseModel

from data_generator import generate_dataset

router = APIRouter(tags=["data"])


class GenerateDataRequest(BaseModel):
    n_samples: int = 200
    seed: int = 42


@router.post("/generate-data")
def generate_data(req: GenerateDataRequest):
    df = generate_dataset(req.n_samples, req.seed)
    return {"status": "success", "data": df.to_dict(orient="records")}

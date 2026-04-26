from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io

from data_generator import generate_dataset, save_dataset
from model import train_model, mitigate_bias
from fairness import evaluate_fairness

app = FastAPI(title="AI Bias Inspector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateDataRequest(BaseModel):
    n_samples: int = 200
    seed: int = 42

@app.post("/generate-data")
def api_generate_data(req: GenerateDataRequest):
    df = generate_dataset(req.n_samples, req.seed)
    df_json = df.to_dict(orient="records")
    return {"status": "success", "data": df_json}

@app.post("/train-model")
async def api_train_model(file: UploadFile = File(...), use_gender: bool = Form(False)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file format. Upload CSV.")
    
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read CSV: {e}")
    
    try:
        model, x_test, y_test, sensitive = train_model(df, use_gender)
        y_pred = model.predict(x_test)
        
        metrics = evaluate_fairness(y_test, y_pred, sensitive)
        
        # Save state temporarily or return parameters (for a stateless API, return everything needed)
        # We will return the dataset and predictions for mitigation later, or require mitigation to be a separate endpoint that takes the same CSV and a mitigate flag.
        return {
            "accuracy": metrics["accuracy"],
            "female_rate": metrics["female_rate"],
            "male_rate": metrics["male_rate"],
            "bias_difference": metrics["bias_difference"],
            "demographic_parity_diff": metrics["demographic_parity_diff"],
            "equal_opportunity_diff": metrics["equal_opportunity_diff"],
            "bias_level": metrics["bias_level"],
            "chart_data": metrics["chart_data"],
            "features_used": ["income", "age", "gender"] if use_gender else ["income", "age"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-bias")
async def api_analyze_bias(file: UploadFile = File(...), use_gender: bool = Form(False)):
    # This might be redundant if train-model also returns bias, 
    # but the instructions requested this explicitly.
    return await api_train_model(file, use_gender)

@app.post("/mitigate-bias")
async def api_mitigate_bias(file: UploadFile = File(...), use_gender: bool = Form(False)):
    """Trains a model with bias mitigation."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Invalid file format. Upload CSV.")
    
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read CSV: {e}")
    
    try:
        model, x_test, y_test, sensitive, y_pred_mitigated = mitigate_bias(df, use_gender)
        
        metrics = evaluate_fairness(y_test, y_pred_mitigated, sensitive)
        
        return {
            "accuracy": metrics["accuracy"],
            "female_rate": metrics["female_rate"],
            "male_rate": metrics["male_rate"],
            "bias_difference": metrics["bias_difference"],
            "demographic_parity_diff": metrics["demographic_parity_diff"],
            "equal_opportunity_diff": metrics["equal_opportunity_diff"],
            "bias_level": metrics["bias_level"],
            "chart_data": metrics["chart_data"],
            "features_used": ["income", "age", "gender"] if use_gender else ["income", "age"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)

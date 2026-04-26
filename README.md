# ⚖️ AI Bias Inspector

# ⚖️ AI Bias Inspector

Lightweight full-stack app to detect, evaluate, and mitigate bias in ML models (loan-approval style demo).

---

Table of contents
- [Quick links](#quick-links)
- [Requirements](#requirements)
- [Run locally](#run-locally)
        - [Backend](#backend)
        - [Frontend](#frontend)
- [API endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Next steps I can do for you](#next-steps-i-can-do-for-you)

---

## Quick links

- Backend entry: `backend/api.py` ([open docs at /docs](http://127.0.0.1:8000/docs) when running)
- Frontend source: `frontend/src`

## Requirements

- Python 3.10+ (3.12 tested)
- Node.js 16+ and npm

## Run locally

### Backend

1. From the repo root create and activate a venv (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Or (CMD):

```cmd
python -m venv .venv
.\.venv\Scripts\activate.bat
```

2. Install dependencies and start the API:

```powershell
pip install -r backend/requirements.txt
cd backend
python -m uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

Open http://127.0.0.1:8000/docs for the interactive API documentation.

### Frontend

1. Install and run the Vite dev server:

```bash
cd frontend
npm install
npm run dev
```

2. Open the Vite URL shown in the terminal (usually http://localhost:5173).

The frontend expects the API at `http://localhost:8000` by default.

## API endpoints

- `POST /generate-data` — generate synthetic dataset (JSON body: `{ "n_samples": 200, "seed": 42 }`)
- `POST /train-model` — upload a CSV (`file` form field) and optional `use_gender` to train and evaluate
- `POST /analyze-bias` — same as `train-model`
- `POST /mitigate-bias` — train with mitigation and return mitigated predictions

Use the Swagger UI at `/docs` to experiment.

## Troubleshooting

- CORS: backend uses permissive CORS for local development (`backend/api.py`).
- Port collisions: change the port with `--port <port>` when starting `uvicorn`.
- If `npm install` fails, check Node/npm versions and network access.

## Next steps I can do for you

- Commit the `.gitignore` and this README
- Add a Windows `run-backend.bat` and `run-frontend.bat` for one-click starts
- Add a Vite proxy so frontend requests to `/api` are forwarded to the backend

Tell me which of the above you'd like me to do next.


The challenge: build a system that **detects, measures, and mitigates bias** before deployment.

---

## 🧠 Key Insight

Even after removing sensitive attributes like **gender**, models can still exhibit bias through **proxy variables** such as income or age. This tool exposes and corrects that hidden bias.

---

## 🏗️ Architecture

```
Frontend (React + Three.js)
        ↓  [Axios HTTP]
API Layer (FastAPI + Uvicorn)
        ↓  [Pandas DataFrame]
ML Engine (Scikit-Learn + Fairlearn)
        ↓
JSON Response → UI Visualization
```

---

## ✨ Features

- 🎯 Upload any CSV dataset for analysis
- 🧪 Train ML models with/without sensitive features
- 📊 Fairness metrics: Selection Rate, Demographic Parity, Equal Opportunity
- 🛡️ Bias mitigation via Fairlearn's ThresholdOptimizer
- 📈 Before vs After mitigation comparison
- ⬇️ Downloadable bias report (JSON)
- 🌌 Three.js animated particle background
- 🎨 Premium dark glassmorphism UI with Framer Motion animations

---

## 🛠️ Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Frontend   | React 18, Vite, Three.js, Framer Motion |
| Styling    | Pure CSS (glassmorphism design system)  |
| Charts     | Recharts (Bar, Radar)                   |
| Backend    | FastAPI, Uvicorn                        |
| ML         | Scikit-Learn (Logistic Regression)      |
| Fairness   | Fairlearn (MetricFrame, ThresholdOpt.)  |
| Data       | Pandas, NumPy                           |

---

## 📁 Project Structure

```
ML/
├── backend/
│   ├── api.py              # FastAPI routes
│   ├── model.py            # ML training + bias mitigation
│   ├── fairness.py         # Fairness metrics evaluation
│   ├── data_generator.py   # Synthetic dataset generator
│   └── requirements.txt    # Python dependencies
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ThreeBackground.jsx   # Three.js particle canvas
│       │   ├── BiasCharts.jsx        # Recharts visualizations
│       │   └── MetricCard.jsx        # KPI metric card
│       ├── pages/
│       │   └── Dashboard.jsx         # Main application page
│       ├── services/
│       │   └── api.js                # Axios API client
│       ├── App.jsx
│       └── index.css                 # Design system (600+ lines)
│
└── README.md
```

---

## ⚙️ Installation & Running

### Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)

---

### 🐍 Backend Setup (FastAPI)

Open **Terminal 1** and run the following commands:

#### Step 1 — Navigate to the backend folder
```bash
cd path/to/ML/backend
```

#### Step 2 — Create a Python virtual environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

> You should see `(venv)` appear at the start of your terminal prompt.

#### Step 3 — Install Python dependencies
```bash
pip install -r requirements.txt
```

This installs: `fastapi`, `uvicorn`, `scikit-learn`, `fairlearn`, `pandas`, `numpy`, `python-multipart`.

#### Step 4 — Start the FastAPI server
```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

✅ The API is now live at: **http://localhost:8000**  
📖 Interactive Swagger docs at: **http://localhost:8000/docs**

---

### ⚛️ Frontend Setup (React + Vite)

Open **Terminal 2** and run:

#### Step 1 — Navigate to the frontend folder
```bash
cd path/to/ML/frontend
```

#### Step 2 — Install dependencies
```bash
npm install
```

#### Step 3 — Start the development server
```bash
npm run dev
```

✅ The app is now live at: **http://localhost:5173** (or next available port)

---

## 🚀 Usage

1. **Open** `http://localhost:5173` in your browser
2. **Upload** a CSV file with columns: `income`, `age`, `gender`, `loan_approved`
   - You can use the generated `loan_data.csv` in the project root
3. Toggle **"Include sensitive feature"** to test direct vs proxy bias
4. Click **🔍 Analyze Bias** — view accuracy, selection rates, and fairness scores
5. Click **🛡️ Mitigate Bias** — compare before/after metrics
6. Click **⬇️ Export Report** to download the full JSON analysis

---

## 📊 API Endpoints

| Method | Endpoint         | Description                          |
|--------|------------------|--------------------------------------|
| POST   | `/generate-data` | Generate synthetic loan dataset      |
| POST   | `/train-model`   | Train model + return fairness metrics|
| POST   | `/analyze-bias`  | Alias for `/train-model`             |
| POST   | `/mitigate-bias` | Apply ThresholdOptimizer + re-evaluate|

**Sample response:**
```json
{
  "accuracy": 0.683,
  "female_rate": 0.621,
  "male_rate": 0.484,
  "bias_difference": 0.137,
  "demographic_parity_diff": 0.137,
  "equal_opportunity_diff": 0.257,
  "bias_level": "Medium",
  "chart_data": [
    { "group": "Female", "rate": 0.621 },
    { "group": "Male", "rate": 0.484 }
  ]
}
```

---

## 📈 Bias Scoring System

| Bias Score      | Level      | Color  | Meaning                          |
|-----------------|------------|--------|----------------------------------|
| < 0.05          | ✅ Low     | Green  | Model is largely fair            |
| 0.05 – 0.15     | ⚠️ Medium  | Amber  | Moderate disparity detected      |
| > 0.15          | 🚨 High    | Red    | Significant bias — act required  |

---

## 🔮 Future Improvements

- [ ] Support for more sensitive features (race, age group, marital status)
- [ ] Real-world dataset connectors (Kaggle, HuggingFace)
- [ ] User authentication + session history (PostgreSQL)
- [ ] Adjustable fairness constraint sliders in the UI
- [ ] Docker containerization for easy deployment
- [ ] Deploy: **Vercel** (frontend) + **Render** (backend)
- [ ] PDF bias report export

---

## 🌐 Deployment

| Service  | Platform | Command |
|----------|----------|---------|
| Frontend | Vercel   | `vercel deploy` from `frontend/` |
| Backend  | Render   | Connect repo, set start command: `uvicorn api:app --host 0.0.0.0 --port 10000` |

---

Built with ❤️ using React · FastAPI · Three.js · Scikit-Learn · Fairlearn
#   A i _ b i a s _ i n s p e c t o r 
 
 #   A i _ b i a s _ i n s p e c t o r 
 
 
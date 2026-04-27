⚖️ AI Bias Inspector
🧠 Detect • Measure • Mitigate Bias in ML Models










🚀 Overview

AI Bias Inspector is a lightweight full-stack application that helps you:

🔍 Detect bias in machine learning models
📊 Measure fairness using standard metrics
🛡️ Mitigate bias before deployment

Even if you remove sensitive features like gender, models can still learn bias via proxy variables (e.g., income, age). This tool uncovers and fixes that.

✨ Features
📂 Upload any CSV dataset
🧪 Train models with/without sensitive attributes
📊 Fairness metrics:
Selection Rate
Demographic Parity
Equal Opportunity
🛡️ Bias mitigation using ThresholdOptimizer
📈 Before vs After comparison
⬇️ Export bias reports (JSON)
🌌 Animated UI (Three.js background)
🎨 Glassmorphism + smooth animations
🏗️ Architecture
Frontend (React + Three.js)
        ↓ Axios
Backend API (FastAPI + Uvicorn)
        ↓ Pandas
ML Engine (Scikit-Learn + Fairlearn)
        ↓
JSON → UI Visualization
🛠️ Tech Stack
Layer	Tech
Frontend	React 18, Vite, Three.js, Framer Motion
Styling	CSS (Glassmorphism)
Charts	Recharts
Backend	FastAPI, Uvicorn
ML	Scikit-Learn
Fairness	Fairlearn
Data	Pandas, NumPy
📁 Project Structure
ML/
├── backend/
│   ├── api.py
│   ├── model.py
│   ├── fairness.py
│   ├── data_generator.py
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       └── index.css
│
└── README.md
⚙️ Installation
🔹 Prerequisites
Python 3.10+
Node.js 18+
🐍 Backend Setup
cd backend

# Create virtual environment
python -m venv venv

# Activate
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn api:app --reload --port 8000

📍 API: http://localhost:8000

📘 Docs: http://localhost:8000/docs

⚛️ Frontend Setup
cd frontend
npm install
npm run dev

📍 App: http://localhost:5173

🚀 Usage
Open the frontend
Upload a dataset (income, age, gender, loan_approved)
Toggle sensitive feature inclusion
Click Analyze Bias
Click Mitigate Bias
Export report
📊 API Endpoints
Method	Endpoint	Description
POST	/generate-data	Generate dataset
POST	/train-model	Train + evaluate
POST	/analyze-bias	Same as train
POST	/mitigate-bias	Apply mitigation
📈 Bias Scoring
Score	Level	Meaning
< 0.05	✅ Low	Fair model
0.05–0.15	⚠️ Medium	Moderate bias
> 0.15	🚨 High	Significant bias
🔮 Future Improvements
 More sensitive attributes
 Kaggle/HuggingFace integration
 Auth + user history
 UI fairness sliders
 Docker support
 Deployment automation
 PDF reports
🌐 Deployment
Service	Platform
Frontend	Vercel
Backend	Render
🤝 Contributing

Pull requests are welcome!
If you find bugs or want new features, open an issue.

💡 Inspiration

Built to address a real-world challenge:

How can we ensure AI systems are fair before they impact real lives?

❤️ Built With

React · FastAPI · Three.js · Scikit-Learn · Fairlearn

## New Upgrades (Solution Challenge)

- Gemini explainability endpoints:
        - POST /explainability/explain-bias
        - POST /explainability/suggest-fix
- PDF export in frontend results view.
- Cloud deployment assets:
        - backend/Dockerfile
        - backend/cloudrun.yaml
        - frontend/firebase.json
- Automated backend tests under backend/tests.

## Backend Env Setup

Create backend/.env (do not commit it):

APP_NAME=AI Bias Inspector API
ALLOWED_ORIGINS=http://localhost:5173
GEMINI_API_KEY=your_real_key
GEMINI_MODEL=gemini-2.0-flash

## Run Tests

cd backend
C:/Users/karti/OneDrive/Desktop/ML/.venv/Scripts/python.exe -m pytest -q

## Cloud Run (Backend)

cd backend
gcloud builds submit --tag gcr.io/PROJECT_ID/ai-bias-inspector-api
gcloud run deploy ai-bias-inspector-api --image gcr.io/PROJECT_ID/ai-bias-inspector-api --region us-central1 --platform managed --allow-unauthenticated

## Firebase Hosting (Frontend)

cd frontend
npm install
npm run build
firebase deploy --only hosting

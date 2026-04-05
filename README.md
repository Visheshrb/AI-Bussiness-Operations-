# Autonomous Business Operator AI - Simple Backend Starter

This is a clean starter version with only the backend setup.

## What is included?
- FastAPI app
- `/health` endpoint
- `/submit-goal` endpoint
- Simple strategy agent
- Orchestrator service
- Request/response schemas

## Project structure
```text
backend/
└── app/
    ├── main.py
    ├── api/
    │   └── routes.py
    ├── agents/
    │   └── strategy_agent.py
    ├── services/
    │   └── orchestrator.py
    ├── schemas/
    │   └── goal.py
    └── core/
        └── config.py
```

## How to run
```bash
cd backend
python -m venv venv
```

### Windows PowerShell
```powershell
.\venv\Scripts\Activate.ps1
```

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open:
- http://127.0.0.1:8000/health
- http://127.0.0.1:8000/docs

## Sample request
POST `/submit-goal`

```json
{
  "goal": "Get 100 users for my SaaS",
  "business_type": "SaaS",
  "target_audience": "Small businesses",
  "budget": 1000
}
```

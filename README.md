# 🌿 AgroSense — AI-Powered Crop Advisory

Region-aware, season-specific farming advice backed by ICAR data, powered by a fine-tuned Mistral-7B with a full LLMOps pipeline (RLHF, MLflow, Celery).

---

## Project Structure

```
agrosense/
├── backend/                  # FastAPI + SQLAlchemy + Celery
│   ├── alembic/              # DB migrations
│   ├── models/
│   │   └── database.py       # ORM models + async engine
│   ├── routes/
│   │   ├── auth.py           # POST /api/auth/register|login
│   │   ├── chat.py           # POST /api/ask  WS /api/stream/{id}
│   │   ├── expert.py         # GET/POST /api/expert/queue|rank
│   │   ├── feedback.py       # POST /api/feedback
│   │   └── user.py           # GET /api/user/history
│   ├── services/
│   │   ├── context_builder.py
│   │   └── llm_client.py
│   ├── tasks/
│   │   └── llmops.py         # Celery tasks (fine-tune trigger)
│   ├── celery_app.py
│   ├── config.py
│   ├── main.py
│   ├── requirements.txt
│   ├── alembic.ini
│   └── Dockerfile
├── frontend/                 # React 18 + TypeScript + Tailwind
│   ├── src/
│   │   ├── api/client.ts
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Quick Start

### 1 — Prerequisites
- Docker + Docker Compose v2
- (GPU path) NVIDIA driver + nvidia-container-toolkit

### 2 — Environment
```bash
cp .env.example .env
# Edit .env — at minimum change JWT_SECRET
```

### 3a — CPU mode (Ollama, no GPU needed)
```bash
docker compose --profile cpu up --build
```

### 3b — GPU mode (vLLM)
```bash
# Place your fine-tuned model at ./models/agrosense-v1.2/
docker compose --profile gpu up --build
```

### 4 — Services
| Service      | URL                          |
|--------------|------------------------------|
| Frontend     | http://localhost:3000        |
| Backend API  | http://localhost:8000/docs   |
| MLflow UI    | http://localhost:5000        |
| Inference    | http://localhost:8080        |

---

## Development (without Docker)

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Start Postgres + Redis (Docker only for infra)
docker compose up postgres redis -d

# Run DB migrations
alembic upgrade head

# Start API
uvicorn main:app --reload --port 8000

# Start Celery worker (separate terminal)
celery -A celery_app worker --loglevel=info -Q llmops
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
```

---

## Bugs Fixed

| File | Issue | Fix |
|------|-------|-----|
| `main.py` | `allow_origins=["*"]` + `allow_credentials=True` blocked by browsers | Listed explicit origins |
| `main.py` | Missing `user` router | Added `/api/user/history` route |
| `database.py` | `get_session` used bare `AsyncSession(engine)` — no rollback on error | Switched to `async_sessionmaker` with try/except rollback |
| `auth.py` | `/api/auth/user/history` — wrong prefix; client calls `/api/user/history` | Moved to new `routes/user.py` |
| `expert.py` | `msgs[0].session.messages` — lazy relationship access crashes in async | Replaced with explicit `select(Message)` query |
| `expert.py` | `uuid.UUID(payload.expert_id)` crashes on demo strings | Wrapped in try/except |
| `useStream.ts` | Used `socket.io-client` but backend has a native WebSocket endpoint | Replaced with native `WebSocket` |
| `useChat.ts` | `startStream()` called with no payload — WS never sent question | Updated signature to pass `{question,region,crop,season}` |
| `ChatPage.tsx` | `useEffect` sent initial message every render | Added `hasSentInitial` ref guard |
| `ChatPage.tsx` | Hardcoded `2025` year in season label | Replaced with `new Date().getFullYear()` |
| `HistoryPage.tsx` | Date grouping compared `getDate()` diff — breaks across months | Fixed to compare `toDateString()` |
| `docker-compose.yml` | Ollama port mapping `8080:8080` wrong (Ollama listens on 11434) | Fixed to `8080:11434` |
| `requirements.txt` | Missing `celery`, `psycopg2-binary` for sync Celery tasks | Added |
| `config.py` | Missing `CELERY_BROKER_URL` / `CELERY_RESULT_BACKEND` | Added |

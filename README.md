# MURDOKU — Faina DETI

> *Um caso foi aberto. Onze pessoas. Onze locais. Uma única verdade.*

Jogo de investigação e dedução lógica para a Faina do DETI — Universidade de Aveiro.

Os caloiros têm de descobrir onde estava cada membro da Comissão de Faina quando o Estandarte desapareceu — usando pistas lógicas, drag & drop no mapa do campus, e apenas 3 tentativas.

---

## Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| Animações | Framer Motion |
| Drag & Drop | dnd-kit |
| Icons | Lucide React |
| Backend | Python 3.11+ + FastAPI + SQLAlchemy |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Deploy | Render |

---

## Project Structure

```
murdle-faina/
├── frontend/          # React SPA
│   └── src/
│       ├── components/  # UI components
│       ├── hooks/       # React hooks
│       ├── lib/         # API client, sounds
│       ├── pages/       # Page components
│       └── types/       # TypeScript types
│
├── backend/           # FastAPI API
│   └── app/
│       ├── api/         # Endpoints (auth, game)
│       ├── core/        # Config, security, database
│       ├── data/        # Game config & puzzle validator
│       ├── models/      # SQLAlchemy models
│       └── services/    # Business logic
│
├── assets/            # Character photos & map assets
│   ├── characters/    # character-01.webp ... character-11.webp
│   └── map/
│
├── render.yaml        # Render deployment config
├── .env.example       # Environment variable template
└── README.md
```

---

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.11+
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/murdoku-faina.git
cd murdoku-faina
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env and set your values

# Start backend
uvicorn app.main:app --reload --port 8000
```

Backend will be at: `http://localhost:8000`
API docs (dev only): `http://localhost:8000/api/docs`

### 3. Frontend setup

```bash
cd frontend

# Configure environment
echo "VITE_API_URL=http://localhost:8000" > .env

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be at: `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | ✅ | — | JWT signing secret. Generate: `openssl rand -hex 32` |
| `GAME_ACCESS_PASSWORD` | ✅ | `DETI2026` | Password players enter to access the game |
| `DATABASE_URL` | ✅ | `sqlite+aiosqlite:///./murdoku.db` | Database connection string |
| `FRONTEND_URL` | ✅ | `http://localhost:5173` | Frontend URL for CORS |
| `ENVIRONMENT` | ❌ | `development` | Set to `production` on Render |
| `ACCESS_TOKEN_EXPIRE_HOURS` | ❌ | `24` | JWT token lifetime |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend API URL (no trailing slash) |

---

## Game Configuration

### 🔑 Changing the password

In `backend/.env` (or Render environment variables):
```
GAME_ACCESS_PASSWORD=NOVACLAVE2026
```

### 👥 Changing characters

Edit `backend/app/data/game_config.py` → `CHARACTERS` list:

```python
{
    "id": "xuta",          # Must be unique, alphanumeric, no spaces
    "name": "Xavier Panças",  # Full name
    "nickname": "Xuta Panças", # Displayed in game
    "description": "O Presidente.", # Short description
    "image": "character-01.webp",  # File in assets/characters/
}
```

**Adding character photos:**
1. Compress photo to `.webp` format (recommended: 200×200px, <50KB)
2. Name it `character-XX.webp` (e.g., `character-01.webp`)
3. Place in `assets/characters/`
4. Copy to `frontend/public/characters/` for the web app
5. Update the `"image"` field in `game_config.py`

### 📍 Changing locations

Edit `backend/app/data/game_config.py` → `LOCATIONS` list:

```python
{
    "id": "deti",              # Unique ID used in solution
    "name": "Departamento de Eletrónica",
    "short_name": "DETI",       # Shown on map
    "description": "O coração do crime.",
    "map_x": 55.0,             # % from left (0-100)
    "map_y": 35.0,             # % from top (0-100)
}
```

### 📋 Changing clues

Edit `backend/app/data/game_config.py` → `CLUES` list:

```python
{
    "id": "clue_01",
    "text": "O Xuta Panças foi visto no Departamento de Eletrónica.",
    "category": "identity",  # identity | exclusion | position | adjacency
}
```

> ⚠️ **IMPORTANT:** After changing clues or the solution, always run the puzzle validator to confirm exactly 1 solution:
> ```bash
> cd backend && python -m pytest tests/test_puzzle.py -v
> ```

### ✅ Changing the solution

Edit `backend/app/data/game_config.py` → `SOLUTION`:

```python
SOLUTION = {
    "placement": {
        "xuta": "deti",          # character_id: location_id
        "sid": "bar",
        # ... all 11 characters must be assigned
    }
}
```

After changing, run: `pytest tests/test_puzzle.py` to verify.

### 🏆 Changing the reward

Edit `backend/app/data/game_config.py` → `REWARD`:

```python
REWARD = {
    "type": "coordinates",   # coordinates | text | code | qr
    "title": "PRÓXIMO DESTINO",
    "content": "40.630541, -8.657858",  # The actual reward content
    "subtitle": "Mensagem adicional aqui.",
}
```

The reward is **never sent to the frontend until the correct solution is submitted**.

### ⚙️ Changing game settings

```python
GAME_CONFIG = {
    # ...
    "max_attempts": 3,  # Number of attempts before game over
}
```

---

## Deployment

### Deploy to Render

1. **Create a GitHub repository** and push this project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/murdoku-faina.git
   git push -u origin main
   ```

2. **Go to [render.com](https://render.com)** and sign in.

3. **New → Blueprint** → Connect your GitHub repo → Select the repo → Apply.
   Render will read `render.yaml` and create both services automatically.

4. **Configure environment variables** in the Render dashboard:

   **Backend service** (`murdoku-backend`):
   - `GAME_ACCESS_PASSWORD` → your secret password
   - `FRONTEND_URL` → your frontend URL (e.g., `https://murdoku-frontend.onrender.com`)
   - `SECRET_KEY` → auto-generated (or set manually with `openssl rand -hex 32`)

   **Frontend service** (`murdoku-frontend`):
   - `VITE_API_URL` → your backend URL (e.g., `https://murdoku-backend.onrender.com`)

5. **Deploy!** Render will build and deploy both services.

### Render Environment Variables Summary

| Service | Variable | Value |
|---------|----------|-------|
| Backend | `GAME_ACCESS_PASSWORD` | Your game password |
| Backend | `FRONTEND_URL` | `https://YOUR-FRONTEND.onrender.com` |
| Backend | `SECRET_KEY` | Auto-generated by Render |
| Backend | `DATABASE_URL` | Auto-set (SQLite) or your PostgreSQL URL |
| Backend | `ENVIRONMENT` | `production` |
| Frontend | `VITE_API_URL` | `https://YOUR-BACKEND.onrender.com` |

### Upgrading to PostgreSQL

1. In Render: Create a **PostgreSQL** database service (free tier available).
2. In your backend service, set:
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
   ```
   (Use the "Internal Connection String" from Render, replacing `postgresql://` with `postgresql+asyncpg://`)
3. Redeploy the backend.

---

## Running Tests

```bash
cd backend
source venv/bin/activate

# Run all tests
pytest tests/ -v

# Run only puzzle validation
pytest tests/test_puzzle.py -v

# Run only game logic tests
pytest tests/test_game.py -v
```

---

## Production Verification

After deploying, verify:

- [ ] `https://YOUR-BACKEND.onrender.com/api/health` returns `{"status": "ok"}`
- [ ] `https://YOUR-FRONTEND.onrender.com` loads the landing page
- [ ] Password entry works (try a wrong password first)
- [ ] Game loads with characters and map
- [ ] Drag & drop works on desktop
- [ ] Tap-select works on mobile
- [ ] Submit with wrong answer decrements lives
- [ ] Submit with correct answer shows reward
- [ ] Page refresh restores session state

---

## Security Notes

- The **game password** is never sent to the frontend — validated server-side only
- The **solution** is never sent to the frontend — validated server-side only
- The **reward** is only delivered after a verified correct solution
- **Attempt counting** is server-side — the frontend cannot cheat
- JWT tokens expire after 24 hours (configurable)
- Rate limiting: auth endpoint (10/min), submit endpoint (20/min)
- CORS only allows the configured `FRONTEND_URL` in production

---

*Faina DETI — Universidade de Aveiro — CF 26/27*

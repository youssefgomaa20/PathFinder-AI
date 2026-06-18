<<<<<<< HEAD
# AI PathFinder - Full Stack Setup
=======
# PathFinder-AI
>>>>>>> c992f73455337aea75a5823e9adc7eaf8ee3ac0c

This repository now contains:

- `frontend/` (existing UI)
- `backend/` (production-ready Node.js + Express + TypeScript backend)
- `database/` (PostgreSQL Docker setup)
- `shared/` (shared folder for future cross-layer contracts)
- `.env` (root environment variables)

## Backend Features

- TypeScript + Express architecture
- PostgreSQL + Prisma ORM
- JWT authentication (`/auth/signup`, `/auth/login`)
- Protected routes (`/user/profile`, `/roadmap/*`, `/compare-careers`, `/resume/analyze`)
- Real OpenAI integration (no mock data)
- Zod request validation
- Rate limiting + Helmet + CORS + centralized error handling
- Logging table writes for key user actions

## API Endpoints

### Required endpoints
- `POST /auth/signup`
- `POST /auth/login`
- `GET /user/profile`
- `POST /roadmap/generate`
- `POST /roadmap/save`
- `GET /roadmap/all`
- `POST /compare-careers`
- `POST /resume/analyze`

### Frontend compatibility endpoints
- `POST /api/pathfinder/career-roadmap`
- `POST /api/pathfinder/saved-roadmaps`
- `GET /api/pathfinder/saved-roadmaps`
- `DELETE /api/pathfinder/saved-roadmaps/:id`
- `POST /api/pathfinder/compare-careers`
- `POST /api/pathfinder/resume`

## 1) Install dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd Frontend/PathFinderAI/pathfinderai
npm install
```

## 2) Start PostgreSQL

```bash
cd database
docker compose up -d
```

If Docker is not running, start Docker Desktop first.

## 3) Configure environment

Edit root `.env`:

- `OPENAI_API_KEY` must be a valid OpenAI key
- `JWT_SECRET` should be a strong random string

For Prisma CLI, backend uses `backend/.env` for `DATABASE_URL`.

## 4) Prisma generate + migrate

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

## 5) Run backend

```bash
cd backend
npm run dev
```

Backend default URL: `http://localhost:8080`

## 6) Connect and run frontend

Frontend now calls backend through:

- `VITE_BASE_URL` from root `.env` (default `http://localhost:8080`)

Run frontend:

```bash
cd Frontend/PathFinderAI/pathfinderai
npm run dev
```

## Notes

- The backend returns real AI-generated roadmap/career/resume data from OpenAI.
- No mock datasets are used.
- Compatibility routes are implemented so existing frontend pages work without route rewrites.

## Required environment variables

In root `.env`:

- `PORT` (default: `8080`)
- `DATABASE_URL` (PostgreSQL connection)
- `JWT_SECRET` (minimum 32 chars)
- `JWT_EXPIRES_IN` (example: `7d`)
- `OPENAI_API_KEY` (real key required for AI endpoints)
- `FRONTEND_ORIGIN` (default: `http://localhost:5173`)
- `VITE_BASE_URL` (default: `http://localhost:8080`)

## Example API requests

Signup:

```bash
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","password":"StrongPass123!"}'
```

Login:

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"StrongPass123!"}'
```

Generate roadmap (protected):

```bash
curl -X POST http://localhost:8080/roadmap/generate \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"goal":"Become a frontend developer","field":"frontend","skills":["HTML","CSS"],"experience":"beginner","language":"en"}'
```

Save roadmap (protected):

```bash
curl -X POST http://localhost:8080/roadmap/save \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"goal":"Frontend Developer","field":"frontend","aiResponse":{"careerOverview":"...","learningPlan":[]}}'
```

Get all roadmaps (protected):

```bash
curl -X GET http://localhost:8080/roadmap/all \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

Compare careers (protected):

```bash
curl -X POST http://localhost:8080/compare-careers \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"career1":"Frontend Developer","career2":"Data Analyst","language":"en"}'
```

Resume analyze (protected):

```bash
curl -X POST http://localhost:8080/resume/analyze \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","careerGoal":"Frontend Developer","skills":["React","TypeScript"],"experience":"Built 2 projects","language":"en"}'
```
## 📸 Project Screenshots

### 🏠 Home Page

<p align="center">


### 🤖 AI Career Chat

<p align="center">
  <img src="screenshots/ai-chat.png" width="90%">
</p>

### ⚖️ Career Comparison

<p align="center">
  <img src="screenshots/career-comparison.png" width="90%">
</p>

### 📄 Resume Builder

<p align="center">
  <img src="screenshots/resume-builder.png" width="90%">
</p>

### 👤 Profile Dashboard

<p align="center">
  <img src="screenshots/profile-dashboard.png" width="90%">
</p>

### 🔐 Login Page

<p align="center">
  <img src="screenshots/login-page.png" width="90%">
</p>

### 📝 Sign Up Page

<p align="center">
  <img src="screenshots/signup-page.png" width="90%">
</p>

### 🔑 Forgot Password

<p align="center">
  <img src="screenshots/forgot-password.png" width="90%">
</p>

### 🔄 Reset Password

<p align="center">
  <img src="screenshots/reset-password.png" width="90%">
</p>

<<<<<<< HEAD
  <img src="screenshots/home-page.png" width="90%">
=======
  Built with ❤️ as a Youssef Gomaa
>>>>>>> c992f73455337aea75a5823e9adc7eaf8ee3ac0c
</p>
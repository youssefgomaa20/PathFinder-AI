# Graduation Project — AI PathFinder

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](https://python.org/)

An AI-powered career guidance platform that helps students and professionals discover personalized learning roadmaps, compare career paths, analyze resumes, and interact with an intelligent career assistant.

---

## Overview

**AI PathFinder** is a full-stack graduation project that combines a modern React frontend, a production-ready Node.js API, a Python AI orchestration layer, and PostgreSQL persistence. Users can generate structured career roadmaps, compare two career tracks side-by-side, get AI-powered resume feedback, save their progress, and chat with a universal career assistant.

---

## Problem Statement

Choosing a career path in technology is overwhelming. Students and early-career professionals often lack:

- Personalized, structured learning plans tailored to their skills and goals
- Clear comparisons between different career tracks (e.g., Frontend vs. Data Science)
- Actionable feedback on their resumes and profiles
- A single platform to explore, save, and track their career journey

---

## Solution

AI PathFinder addresses these challenges by providing an integrated platform where users:

1. **Sign up / log in** with email or Google (Firebase Auth)
2. **Build a profile** with skills, education, and career goals
3. **Generate AI roadmaps** with staged learning plans, courses, and milestones
4. **Compare careers** with structured AI analysis
5. **Analyze resumes** for strengths, gaps, and recommendations
6. **Save and revisit** roadmaps, comparisons, resumes, and chat sessions

The system uses a **multi-provider AI fallback chain** (OpenAI → Gemini → Groq → Hugging Face) to ensure reliability even when one provider is unavailable.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Career Roadmap Generator** | AI-generated staged learning plans with skills, courses, and timelines |
| **Career Comparison** | Side-by-side analysis of two career tracks |
| **Resume Analyzer** | AI feedback on skills, experience, and career fit |
| **Universal Assistant** | Chat-based career guidance on the home page |
| **Saved Items** | Persist roadmaps, comparisons, resumes, and chat history |
| **User Profiles** | Skills, education, CV upload, profile photo |
| **Authentication** | JWT + Google Sign-In, password reset via email |
| **Multi-language** | English and Arabic support in AI responses |

---

## System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend (React + Vite)"]
        UI[SPA Pages]
        Firebase[Firebase Auth]
    end

    subgraph API["Backend (Express + TypeScript)"]
        Auth[JWT Auth]
        Routes[REST API]
        Prisma[Prisma ORM]
    end

    subgraph AI["AI Service (Python Flask)"]
        Router[Task Router]
        Fallback[Provider Fallback Chain]
        OpenAI[OpenAI]
        Gemini[Gemini]
        Groq[Groq]
        HF[Hugging Face]
    end

    subgraph DB["Database"]
        PG[(PostgreSQL)]
    end

    UI -->|HTTP REST| Routes
    Firebase -->|Google Token| Auth
    Routes --> Prisma
    Prisma --> PG
    Routes -->|Proxy| Router
    Router --> Fallback
    Fallback --> OpenAI
    Fallback --> Gemini
    Fallback --> Groq
    Fallback --> HF
```

---

## Technologies Used

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 + TypeScript | UI framework |
| Vite 8 | Build tool & dev server |
| Wouter | Client-side routing |
| TanStack React Query | Server state management |
| Zustand | Client state |
| Tailwind CSS + Radix UI | Styling & accessible components |
| Framer Motion | Animations |
| Three.js / React Three Fiber | 3D visual effects |
| Firebase Auth | Google Sign-In |
| html2pdf.js | PDF export |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js + Express 5 | HTTP API server |
| TypeScript | Type safety |
| Prisma 6 | ORM & migrations |
| PostgreSQL | Relational database |
| JWT + bcryptjs | Authentication |
| Zod | Request validation |
| Helmet, CORS, rate-limit | Security middleware |
| Multer | File uploads (CV, profile photo) |
| Nodemailer | Password reset emails |
| Axios | AI service proxy |

### AI Module

| Technology | Purpose |
|------------|---------|
| Python 3.10+ | Runtime |
| Flask + flask-cors | HTTP microservice |
| OpenAI, Gemini, Groq, Hugging Face SDKs | LLM providers |
| python-dotenv | Environment configuration |
| Orchestrator pattern | Task routing & provider fallback |

### Database

| Technology | Purpose |
|------------|---------|
| PostgreSQL 16 | Primary datastore |
| Prisma Migrate | Schema migrations |
| Docker Compose | Local development database |
| Supabase (optional) | Hosted PostgreSQL in production |

---

## Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Docker Desktop** (for local PostgreSQL)
- API keys for at least one AI provider (OpenAI, Gemini, Groq, or Hugging Face)
- Firebase project (for Google Sign-In)

### 1. Clone the repository

```bash
git clone https://github.com/youssefgomaa20/Graduation-Project.git
cd Graduation-Project
```

### 2. Install dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd Frontend/PathFinderAI/pathfinderai
npm install
```

**AI Service:**
```bash
cd Ai
pip install -r requirements.txt
```

### 3. Configure environment variables

Copy the example files and fill in your values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp Frontend/PathFinderAI/pathfinderai/.env.example Frontend/PathFinderAI/pathfinderai/.env
```

See [Environment Variables](#environment-variables) for details.

### 4. Start the database

```bash
cd database
docker compose up -d
```

Update `DATABASE_URL` in `.env` and `backend/.env`:
```
DATABASE_URL=postgresql://aipathfinder:aipathfinder@localhost:5432/aipathfinder
```

### 5. Run database migrations

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

---

## Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Root / Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | Secret key for JWT signing (min 32 chars) |
| `JWT_EXPIRES_IN` | Backend | Token expiry (e.g., `7d`) |
| `OPENAI_API_KEY` | Root / Backend | OpenAI API key |
| `GEMINI_API_KEY` | Root / Backend | Google Gemini API key |
| `GROQ_API_KEY` | Root / Backend | Groq API key |
| `HUGGINGFACE_API_KEY` | Root / Backend | Hugging Face API key |
| `AI_SERVICE_URL` | Backend | Python AI service URL (default: `http://127.0.0.1:5000/ai`) |
| `FRONTEND_ORIGIN` | Backend | Allowed CORS origins |
| `VITE_BASE_URL` | Frontend | Backend API URL |
| `VITE_FIREBASE_*` | Frontend | Firebase config for Google Sign-In |
| `SMTP_*` | Backend | Email settings for password reset (optional) |

Full templates are in `.env.example`, `backend/.env.example`, and `Frontend/PathFinderAI/pathfinderai/.env.example`.

---

## Running Frontend

```bash
cd Frontend/PathFinderAI/pathfinderai
npm run dev
```

Open **http://localhost:5173** in your browser.

Build for production:
```bash
npm run build
npm run preview
```

---

## Running Backend

```bash
cd backend
npm run dev
```

API available at **http://localhost:8080**.

Health check:
```bash
curl http://localhost:8080/health
```

Production:
```bash
npm run build
npm start
```

---

## Running AI Service

```bash
cd Ai
python main.py
```

AI service runs on **http://localhost:5000**.

Test endpoint:
```bash
curl -X POST http://localhost:5000/ai \
  -H "Content-Type: application/json" \
  -d '{"task":"chatbot","input":{"goal":"Frontend Developer","skills":["HTML","CSS"],"language":"en"}}'
```

---

## Database Setup

### Local (Docker)

```bash
cd database
docker compose up -d
```

Default credentials:
- **Database:** `aipathfinder`
- **User:** `aipathfinder`
- **Password:** `aipathfinder`
- **Port:** `5432`

### Migrations

```bash
cd backend
npx prisma migrate dev      # Development
npx prisma migrate deploy   # Production
npx prisma studio           # GUI browser
```

### Schema Models

- `User` — accounts, profiles, skills, CV/photo URLs
- `SavedRoadmap` — persisted career roadmaps
- `SavedComparison` — career comparison results
- `SavedResume` — resume analysis results
- `SavedChat` — chat session history
- `Log` — audit trail for user actions

---

## API Endpoints

### Health
| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | Public |

### Authentication (`/auth`)
| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/signup` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/google` | Public |
| POST | `/auth/forgot-password` | Public |
| POST | `/auth/reset-password` | Public |

### User (`/user`)
| Method | Path | Auth |
|--------|------|------|
| GET | `/user/profile` | JWT |
| PUT | `/user/profile` | JWT |
| POST | `/user/upload-cv` | JWT |
| POST | `/user/upload-image` | JWT |
| DELETE | `/user/delete-account` | JWT |

### Roadmap (`/roadmap`)
| Method | Path | Auth |
|--------|------|------|
| POST | `/roadmap/generate` | JWT |
| POST | `/roadmap/save` | JWT |
| GET | `/roadmap/all` | JWT |
| POST | `/roadmap/compare-careers` | JWT |
| POST | `/roadmap/resume/analyze` | JWT |

### PathFinder API (`/api/pathfinder`)
| Method | Path | Auth |
|--------|------|------|
| POST | `/api/pathfinder/career-roadmap` | Optional JWT |
| POST | `/api/pathfinder/compare-careers` | Optional JWT |
| POST | `/api/pathfinder/resume` | Optional JWT |
| POST | `/api/pathfinder/universal-assistant` | Optional JWT |
| POST | `/api/pathfinder/saved-roadmaps` | JWT |
| GET | `/api/pathfinder/saved-roadmaps` | JWT |
| DELETE | `/api/pathfinder/saved-roadmaps/:id` | JWT |

### Home Assistant & Saved Chats
| Method | Path | Auth |
|--------|------|------|
| POST | `/api/home-assistant/chat` | Public |
| GET/POST/DELETE | `/api/saved-chats/*` | JWT |

### AI Service (Python)
| Method | Path | Port |
|--------|------|------|
| POST | `/ai` | 5000 |

---

## Folder Structure

```
Graduation-Project/
├── Ai/                          # Python AI microservice
│   ├── main.py                  # Flask entry point
│   ├── requirements.txt
│   ├── orchestrator/            # Task routing & fallback
│   ├── providers/               # OpenAI, Gemini, Groq, HF
│   ├── services/                # Roadmap, compare, resume
│   └── prompts/                 # LLM prompt templates
│
├── backend/                     # Node.js API
│   ├── src/
│   │   ├── app.ts               # Express app setup
│   │   ├── server.ts            # Server entry
│   │   ├── config/              # Environment config
│   │   ├── routes/              # API route handlers
│   │   ├── services/            # Business logic
│   │   ├── middlewares/         # Auth, error handling
│   │   └── schemas/             # Zod validation
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Migration history
│   └── uploads/                 # User uploads (gitignored)
│
├── database/
│   └── docker-compose.yml       # Local PostgreSQL
│
├── Frontend/
│   └── PathFinderAI/
│       └── pathfinderai/        # React SPA
│           ├── src/
│           │   ├── pages/       # Route pages
│           │   ├── components/  # UI components
│           │   ├── layout/      # Header, navigation
│           │   ├── lib/         # API client, Firebase
│           │   ├── hooks/       # Custom React hooks
│           │   └── context/     # React context providers
│           └── public/
│
├── .env.example                 # Root env template
├── .gitignore
├── LICENSE
├── CONTRIBUTING.md
├── CHANGELOG.md
└── README.md
```

---

## Screenshots Section

> Add screenshots of your application here after deployment.

| Page | Description |
|------|-------------|
| Home | Landing page with career assistant |
| Chat | Interactive roadmap generator |
| Compare | Career track comparison |
| Resume | AI resume analysis |
| Profile | User profile management |
| Saved | Saved roadmaps and sessions |

<!-- 
![Home Page](docs/screenshots/home.png)
![Roadmap Results](docs/screenshots/roadmap.png)
![Career Compare](docs/screenshots/compare.png)
-->

---

## Future Improvements

- [ ] Add comprehensive test suite (unit + integration)
- [ ] Sync Prisma migrations with current schema models
- [ ] Deploy to cloud (Vercel + Railway/Render + Supabase)
- [ ] Add CI/CD pipeline with GitHub Actions
- [ ] Implement real-time chat with WebSockets
- [ ] Add admin dashboard for usage analytics
- [ ] Support additional languages beyond EN/AR
- [ ] Mobile-responsive PWA with offline support
- [ ] Rate limiting per user tier
- [ ] OAuth providers beyond Google (GitHub, LinkedIn)

---

## Contributors

| Name | Role | GitHub |
|------|------|--------|
| **Youssef Gomaa** | Full-stack Developer & Project Lead | [@youssefgomaa20](https://github.com/youssefgomaa20) |

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to contribute.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ as a Graduation Project
</p>

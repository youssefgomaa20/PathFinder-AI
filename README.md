# 🚀 PathFinder-AI

<p align="center">
  <b>AI-Powered Career Guidance Platform for Students and Professionals</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-398200?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License" />
</p>

---

## 📌 Table of Contents

- [📖 Overview](#overview)
- [🎯 Problem Statement](#problem-statement)
- [💡 Solution](#solution)
- [⭐ Project Highlights](#project-highlights)
- [🏗️ System Architecture](#system-architecture)
- [🚦 Quick Start](#quick-start)
- [📦 Key Features](#key-features)
- [🛠️ Technologies Used](#technologies-used)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [AI Module](#ai-module)
  - [Database](#database)
- [📥 Installation](#installation)
- [⚙️ Environment Variables](#environment-variables)
- [🏃 Running the Application](#running-the-application)
  - [Running Frontend](#running-frontend)
  - [Running Backend](#running-backend)
  - [Running AI Service](#running-ai-service)
- [💾 Database Setup](#database-setup)
- [🔒 Security Features](#security-features)
- [🔌 API Endpoints](#api-endpoints)
- [📂 Folder Structure](#folder-structure)
- [🌐 Deployment](#deployment)
- [🖼️ Feature Showcase](#feature-showcase)
- [📸 Screenshots](#screenshots)
- [🗺️ Future Improvements](#future-improvements)
- [👥 Contributors](#contributors)

---

# Overview

**PathFinder-AI** is a comprehensive, production-ready full-stack application designed to help students and professionals navigate their career journeys. By leveraging cutting-edge Artificial Intelligence models, the platform acts as a personalized career advisor, generating customized learning roadmaps, analyzing resumes to suggest optimizations, comparing job roles side-by-side, and providing a context-aware chatbot for general career guidance.

The codebase is organized into modular directories to maintain a clean separation of concerns:
- `Frontend/` contains the responsive, interactive user interface.
- `backend/` handles data persistence, authentication, rate limiting, and API request validation.
- `Ai/` runs the specialized Python-based microservice that interacts with LLM providers.
- `database/` manages the PostgreSQL container orchestration.

The backend returns real AI-generated roadmap, career, and resume data from OpenAI and Gemini with no mock datasets. Compatibility routes are implemented so that existing frontend pages work without route rewrites.

---

# Problem Statement

Navigating the rapidly evolving professional landscape is challenging for students and career-switchers. Users often face:
- **Information Overload:** A lack of structured, step-by-step learning roadmaps tailored to their current skill levels.
- **Biased or Fragmented Career Comparisons:** Difficulty comparing roles (e.g., Frontend vs. Data Science) across normalized parameters like demand, learning curve, and typical tasks.
- **Unoptimized Resumes:** Submitting job applications without objective feedback on whether their resumes align with target roles.
- **Inaccessibility of Career Coaching:** Traditional professional guidance is often expensive and slow.

---

# Solution

**PathFinder-AI** addresses these challenges by offering a centralized, AI-driven career guidance portal:
- **Automated Planning:** Generates multi-phase learning paths complete with actionable milestones.
- **Objective Analysis:** Compares any two tech domains using customizable AI evaluation criteria.
- **Instant Resume Audits:** Evaluates resume inputs and scores skill alignment for a target career path.
- **Continuous Guidance:** Integrates a 24/7 Universal Career Assistant chatbot to answer specialized industry questions.

---

# Project Highlights

* 🧠 **Multi-Provider AI Orchestration:** Dynamically handles inference across OpenAI GPT-4, Google Gemini, Groq, and Hugging Face.
* ⚡ **Type-Safe Fullstack Architecture:** Strict end-to-end typing with TypeScript, integrated database schemas via Prisma, and rigid validation schemas via Zod.
* 🛡️ **Enterprise-Grade Security:** Implements JWT-based route protection, express-rate-limiting, security headers via Helmet, and explicit CORS control.
* 🐳 **Dockerized Dev Environment:** Ready-to-go PostgreSQL setup that spins up instantly with Docker Compose.
* 🌐 **Bilingual Native UI:** Full interface design supporting side-by-side English and Arabic localizations.

---

# System Architecture

The following diagram illustrates the relationship between the client interface, API gateway, local database, Flask AI microservice, and external AI providers:

```mermaid
graph TD
    %% Define styles
    classDef clientStyle fill:#61DAFB,stroke:#20232A,stroke-width:2px,color:#20232A;
    classDef serverStyle fill:#339933,stroke:#20232A,stroke-width:2px,color:#FFF;
    classDef aiStyle fill:#3776AB,stroke:#20232A,stroke-width:2px,color:#FFF;
    classDef dbStyle fill:#316192,stroke:#20232A,stroke-width:2px,color:#FFF;
    classDef thirdParty fill:#FF9900,stroke:#20232A,stroke-width:2px,color:#000;

    %% Define nodes
    Client["💻 React Frontend Client (Vite)"]:::clientStyle
    ExpressServer["🛡️ Express Backend API (TypeScript)"]:::serverStyle
    Database[("🗄️ PostgreSQL Database")]:::dbStyle
    AIService["🤖 Flask AI Microservice (Python)"]:::aiStyle
    
    OpenAI["🧠 OpenAI API"]:::thirdParty
    Gemini["⚡ Google Gemini API"]:::thirdParty
    Groq["🌀 Groq Inference API"]:::thirdParty
    HuggingFace["🤗 Hugging Face API"]:::thirdParty

    %% Define edges
    Client -->|"HTTP REST Requests"| ExpressServer
    ExpressServer -->|"Read & Write Data via Prisma"| Database
    ExpressServer -->|"JSON RPC AI Requests"| AIService
    
    AIService -->|"GPT-4 Inference"| OpenAI
    AIService -->|"Gemini Pro Inference"| Gemini
    AIService -->|"Llama-3 Inference"| Groq
    AIService -->|"HF Embeddings"| HuggingFace
```

---

# Quick Start

Get the application up and running locally in four quick steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/youssefgomaa20/PathFinder-AI.git
   cd PathFinder-AI
   ```

2. **Configure Environment:** 
   Copy `.env.example` to `.env` in the root and add your `OPENAI_API_KEY` or `GEMINI_API_KEY`.

3. **Start the Database:**
   ```bash
   cd database
   docker compose up -d
   ```

4. **Initialize Services:**
   * **Backend Setup:** `cd ../backend && npm install && npx prisma migrate dev && npm run dev`
   * **AI Microservice:** `cd ../Ai && pip install -r requirements.txt && python main.py`
   * **Frontend Setup:** `cd ../Frontend/PathFinderAI/pathfinderai && npm install && npm run dev`

---

# Key Features

The core functionalities of the platform are summarized below:

| Feature                    | Description                                    |
| -------------------------- | ---------------------------------------------- |
| Career Roadmap Generator   | AI-generated learning paths and milestones     |
| Career Comparison          | Side-by-side comparison of career tracks       |
| Resume Analyzer            | AI-powered resume evaluation                   |
| Universal Career Assistant | Career-focused AI chatbot                      |
| Saved Roadmaps             | Save and manage generated plans                |
| Saved Comparisons          | Store comparison results                       |
| Saved Resume Analysis      | Track resume feedback                          |
| User Profiles              | Manage profile, skills, education, and uploads |
| Authentication             | JWT + Google Sign-In                           |
| Multi-language Support     | English and Arabic                             |

### System Highlights:
- **Real-Time AI Integration:** Zero mock data is used for roadmaps, comparisons, or analysis. The system communicates directly with advanced LLM providers to retrieve live recommendations.
- **Compatibility Routes:** Features custom frontend compatibility API endpoints so that existing frontend layers interact smoothly without requiring path rewrites.
- **Secure by Design:** Centralized JWT authentication, rate limiting, secure HTTP headers (Helmet), CORS controls, and detailed audit logging of key database transactions.

---

# Technologies Used

## Frontend
- **React.js:** Building dynamic, modular components.
- **TypeScript:** Ensuring type safety across UI models and components.
- **Vite:** High-performance local development build tool.
- **Tailwind CSS & Custom Styling:** Modern responsive layouts and user interface animations.

## Backend
- **Node.js & Express:** Lightweight, scalable server framework.
- **TypeScript:** Strict type checks for robust backend operations.
- **Prisma ORM:** Clean database schemas and automated query generation.
- **Zod:** Rigid request body and query parameter validation schemas.
- **Security Middleware:** Rate limiting, Helmet, CORS, and centralized exception handlers.

## AI Module
- **Python & Flask:** Lightweight microservice hosting the AI orchestration logic.
- **LLM APIs:** Integrates OpenAI API, Google Gemini AI, Groq, and Hugging Face.
- **AI Orchestrator:** Manages prompt engineering templates, context memory, and structured outputs for roadmaps, career comparison, and CV audits.

## Database
- **PostgreSQL:** Reliable relational storage database.
- **Docker & Docker Compose:** Containerized environment for local PostgreSQL deployments.

---

# Installation

Follow these steps to set up all components of the PathFinder-AI ecosystem locally:

### 1. Install Project Dependencies

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd Frontend/PathFinderAI/pathfinderai
npm install
```

#### AI Service:
```bash
cd Ai
pip install flask flask-cors huggingface_hub
```

---

# Environment Variables

Configure your system by copying the `.env.example` file to `.env` in the project root:

```bash
cp .env.example .env
```

Define the following environment variables:

| Variable Name | Description | Default / Example Value |
| --- | --- | --- |
| `PORT` | Local server port for the Express backend | `8080` |
| `PUBLIC_API_URL` | The public URL for external API communication | `http://localhost:8080` |
| `DATABASE_URL` | PostgreSQL connection string (backend uses `backend/.env` for Prisma CLI) | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret key for signing JSON Web Tokens (min. 32 characters) | *Your Secure Random Key* |
| `JWT_EXPIRES_IN` | Time span after which a JWT token expires | `7d` |
| `FRONTEND_ORIGIN` | Allowed CORS origins for the frontend application | `http://localhost:5173,http://localhost:5174` |
| `VITE_BASE_URL` | Base endpoint URL that the frontend uses to contact the API | `http://localhost:8080` |
| `AI_SERVICE_URL` | Target endpoint for the Python AI Flask service | `http://127.0.0.1:5000/ai` |
| `OPENAI_API_KEY` | Developer API key for OpenAI GPT models | `sk-your-openai-api-key` |
| `GEMINI_API_KEY` | Developer API key for Google Gemini models | `your-gemini-api-key` |
| `GROQ_API_KEY` | Developer API key for Groq Cloud inference | `your-groq-api-key` |
| `HUGGINGFACE_API_KEY` | Developer token for Hugging Face Inference models | `your-huggingface-api-key` |
| `SMTP_HOST` | Host address of SMTP server for password recovery emails | `smtp.gmail.com` |
| `SMTP_PORT` | Port of SMTP server | `587` |
| `SMTP_SECURE` | Set to true if connection is SSL/TLS secured | `false` |
| `SMTP_USER` | Email ID used to send out automated emails | `your-email@gmail.com` |
| `SMTP_PASS` | App-specific password or account password for SMTP | `your-app-password` |
| `EMAIL_FROM` | Sender address appearing on recovery emails | `your-email@gmail.com` |

---

# Running Frontend

Launch the Vite + React dev server:

```bash
cd Frontend/PathFinderAI/pathfinderai
npm run dev
```

*Note: The frontend will access the backend using `VITE_BASE_URL` defined in your environment (defaults to `http://localhost:8080`).*

---

# Running Backend

Start the Express backend in development mode:

```bash
cd backend
npm run dev
```

*Note: The backend runs by default at `http://localhost:8080`.*

---

# Running AI Service

Start the Python Flask AI microservice:

```bash
cd Ai
python main.py
```

*Note: The AI service runs locally on port 5000 at `http://127.0.0.1:5000/ai`.*

---

# Database Setup

1. **Spin up the PostgreSQL database** container using Docker Compose:
   ```bash
   cd database
   docker compose up -d
   ```
   *Note: If Docker is not running, ensure Docker Desktop is started first.*

2. **Generate the Prisma client and apply migrations** to the database:
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   ```

---

# Security Features

To ensure platform reliability and defend user data against production-grade vectors, the platform enforces:

* 🛡️ **JWT Security:** Stateless JSON Web Token session verifier ensuring authorization bounds for roadmap and CV endpoints.
* 🚦 **Request Rate Limiting:** Applied to public routes `/auth/login` and `/auth/signup` to prevent brute force credentials attacks.
* 🔒 **Secure HTTP Headers:** Express backend employs `Helmet` configurations setting XSS protection, MIME sniffing shields, and framing restrictions.
* 🔍 **Stricter Validation Rules:** Uses Zod schemas to reject invalid payloads prior to processing, defending database inputs from invalid objects.
* 📝 **Immutable Logging:** Database transaction models recording critical user actions (such as generated roadmaps and career comparison calls).

---

# API Endpoints

### Required Endpoints
- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Authenticate a user and receive JWT token
- `GET /user/profile` - Retrieve user profile details *(Protected)*
- `POST /roadmap/generate` - Generate a new AI roadmap *(Protected)*
- `POST /roadmap/save` - Save generated roadmap to history *(Protected)*
- `GET /roadmap/all` - List saved roadmaps of current user *(Protected)*
- `POST /compare-careers` - Generate a comparative analysis between two tracks *(Protected)*
- `POST /resume/analyze` - Audit a user resume against a goal path *(Protected)*

### Frontend Compatibility Endpoints
- `POST /api/pathfinder/career-roadmap`
- `POST /api/pathfinder/saved-roadmaps`
- `GET /api/pathfinder/saved-roadmaps`
- `DELETE /api/pathfinder/saved-roadmaps/:id`
- `POST /api/pathfinder/compare-careers`
- `POST /api/pathfinder/resume`

### AI Service Endpoint
- `POST /ai` - Dedicated microservice endpoint for LLM tasks *(Flask)*
  - **Request format:**
    ```json
    {
      "task": "chatbot | compare | cv",
      "input": "User query or task payload"
    }
    ```
  - **Response format:**
    ```json
    {
      "result": {
        "text": "..."
      }
    }
    ```

### Example Curl Requests

#### Signup:
```bash
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","email":"demo@example.com","password":"StrongPass123!"}'
```

#### Login:
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"StrongPass123!"}'
```

#### Generate Roadmap (Protected):
```bash
curl -X POST http://localhost:8080/roadmap/generate \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"goal":"Become a frontend developer","field":"frontend","skills":["HTML","CSS"],"experience":"beginner","language":"en"}'
```

#### Save Roadmap (Protected):
```bash
curl -X POST http://localhost:8080/roadmap/save \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"goal":"Frontend Developer","field":"frontend","aiResponse":{"careerOverview":"...","learningPlan":[]}}'
```

#### Get All Roadmaps (Protected):
```bash
curl -X GET http://localhost:8080/roadmap/all \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### Compare Careers (Protected):
```bash
curl -X POST http://localhost:8080/compare-careers \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"career1":"Frontend Developer","career2":"Data Analyst","language":"en"}'
```

#### Resume Analyze (Protected):
```bash
curl -X POST http://localhost:8080/resume/analyze \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo User","careerGoal":"Frontend Developer","skills":["React","TypeScript"],"experience":"Built 2 projects","language":"en"}'
```

---

# Folder Structure

Here is a full breakdown of the project layout:

```text
PathFinder-AI/
├── Ai/                         # Python Flask AI Microservice
│   ├── orchestrator/           # Orchestrates calls to AI providers
│   ├── prompts/                # Configurable prompt templates (system_prompt.txt)
│   ├── providers/              # API interfaces (OpenAI, Gemini, HF, Groq)
│   ├── services/               # Core AI logic (cv_service, roadmap_service, etc.)
│   ├── ai.py                   # Core API routes mapper
│   ├── main.py                 # Flask server entrypoint
│   └── requirements.txt        # Python dependency manifest
├── backend/                    # Node.js + Express API Backend
│   ├── src/                    # TypeScript source code
│   │   ├── controllers/        # Express route handlers
│   │   ├── middleware/         # Auth, rate-limiter, validator hooks
│   │   ├── routes/             # API Router definitions
│   │   ├── utils/              # Helper utilities and error handlers
│   │   └── app.ts              # Express initialization
│   ├── prisma/                 # PostgreSQL Database Schema & Migration files
│   │   ├── schema.prisma       # Database design blueprint
│   │   └── migrations/         # SQL migration scripts
│   ├── package.json            # Node dependency manifest
│   └── tsconfig.json           # TypeScript build rules
├── database/                   # Docker environment for Database
│   └── docker-compose.yml      # Local PostgreSQL container deployment definition
├── Frontend/                   # Client Web Application
│   └── PathFinderAI/
│       └── pathfinderai/       # React + Vite + TypeScript source files
│           ├── src/            # UI components, state stores, views
│           ├── public/         # Static assets
│           └── package.json    # Frontend package configuration
├── shared/                     # Future shared contracts/schemas
├── screenshots/                # Walkthrough images for README presentation
├── .env.example                # Root environment blueprint config
└── README.md                   # Main Project Showcase Documentation
```

### Original Folder Reference:
```text
- `frontend/` (existing UI)
- `backend/` (production-ready Node.js + Express + TypeScript backend)
- `database/` (PostgreSQL Docker setup)
- `shared/` (shared folder for future cross-layer contracts)
- `.env` (root environment variables)
```

---

# Deployment

### Frontend (Vercel)
1. Push your code to GitHub.
2. Link your repository in the Vercel Dashboard.
3. Set **Root Directory** to `Frontend/PathFinderAI/pathfinderai`.
4. Configure **Build & Development Settings** (Framework Preset: `Vite`).
5. Add Environment Variables: `VITE_BASE_URL` (points to deployed backend URL).
6. Click **Deploy**.

### Backend (Render / Railway)
1. Link your backend repository to Render Web Services or Railway.
2. Set Build Command to: `cd backend && npm install && npm run build`.
3. Set Start Command to: `cd backend && npm run start` (or `node backend/dist/src/app.js`).
4. Define Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `AI_SERVICE_URL`, etc.
5. Bound the port to `PORT` (automatically allocated by host).

### Database (Supabase / Managed PostgreSQL)
1. Initialize a new database instance on **Supabase**.
2. Retrieve the Postgres **Connection string URI** (under Database Settings).
3. Set the `DATABASE_URL` in backend `.env` variables to this connection URI.
4. Execute initial migrations from backend root:
   ```bash
   npx prisma db push
   ```

### AI Service (Render / Railway)
1. Create a Python Web Service on Render.
2. Configure Root Directory to `Ai`.
3. Set Build Command to: `pip install -r requirements.txt`.
4. Set Start Command to: `gunicorn main:app` or `python main.py`.
5. Specify target keys in settings: `OPENAI_API_KEY`, `GEMINI_API_KEY`, etc.

---

# Feature Showcase

### 🗺️ Career Roadmap Generator
Custom path planner utilizing user skill sets, background expertise levels, language choices, and general timelines. Outputs structured roadmap phases, each containing specific learning objectives, resource requirements, and goal checkmarks.

### ⚖️ Side-by-Side Career Comparison
Detailed, parameter-based comparative grid analyzing two technology fields simultaneously. Compares market requirements, typical workflows, average difficulty indexes, salary medians, and overlapping tool systems.

### 📄 Resume Builder & AI Auditor
Processes copy-pasted CV text and reviews its contents against target job descriptions. Grades alignment, detects vocabulary/formatting flaws, highlights missing key phrases, and recommends resume edits.

### 💬 Universal Career Assistant
Custom prompt-engineered chatbot loaded with structural career counseling datasets. Answers open-ended technical questions, provides interview prep advice, lists resume layout options, and directs users to industry resources.

---

# Screenshots

### 🔑 Login Page
*Secure access portal featuring JWT authorization controls, credential validators, and OAuth hooks.*
<p align="center">
  <img src="screenshots/login-page.png" width="90%">
</p>

### 📝 Sign Up Page
*Registration portal with dynamic input requirements, validation patterns, and safe form handling.*
<p align="center">
  <img src="screenshots/signup-page.png" width="90%">
</p>

### ❓ Forgot Password Page
*Automated email verification dispatch portal executing secure password reset links.*
<p align="center">
  <img src="screenshots/forgot-password.png" width="90%">
</p>

### 🔄 Reset Password Page
*Password update page incorporating security token validation verifying session validity.*
<p align="center">
  <img src="screenshots/reset-password.png" width="90%">
</p>

### 🏠 Home Page
*The centralized control center providing immediate routing triggers to career roadmap generators, resume auditors, and comparison panels.*
<p align="center">
  <img src="screenshots/home-page.png" width="90%">
</p>

### 🤖 AI Career Chat
*24/7 career advice companion utilizing custom prompt boundaries to deliver career-focused advice.*
<p align="center">
  <img src="screenshots/ai-chat.png" width="90%">
</p>

### ⚖️ Career Comparison
*Side-by-side comparative matrices charting requirements, average salaries, and learning curves between two roles.*
<p align="center">
  <img src="screenshots/career-comparison.png" width="90%">
</p>

### 📄 Resume Builder
*Rich visual workspace helping users compile, organize, and submit their CV parameters directly into the AI auditor.*
<p align="center">
  <img src="screenshots/resume-builder.png" width="90%">
</p>

### 👤 Profile Dashboard
*The master profile panel tracking saved comparisons, compiled learning roadmaps, history CV critiques, and educational milestones.*
<p align="center">
  <img src="screenshots/profile-dashboard.png" width="90%">
</p>

---

# Future Improvements

- [x] Full-stack architecture with Express, React, and Python AI service.
- [x] Docker setup for local PostgreSQL databases.
- [x] Multi-provider LLM prompt orchestration.
- [x] Dual-language English and Arabic localization interface.
- [ ] Unified Docker Compose configuration launching frontend, backend, database, and AI microservices simultaneously.
- [ ] Automatic CV parsing supporting direct PDF, DOCX, and text file uploads (OCR scanning).
- [ ] Voice-enabled interactive Mock Interview sandbox equipped with speech-to-text grading.
- [ ] Live API integrations with local job boards displaying active vacancies matching generated roadmap skills.

---

## 👨💻 Author

<div align="center">

### Youssef Gomaa

💻 Software Engineer & AI Developer

🔗 GitHub: https://github.com/youssefgomaa20

🔗 LinkedIn: https://www.linkedin.com/in/youssef-gomaa11/

</div>

---

# Contributors

- **[Youssef Gomaa](https://github.com/youssefgomaa20)** - Creator & Lead Developer

---

<p align="center">
  Built with ❤️ by Youssef Gomaa
</p>

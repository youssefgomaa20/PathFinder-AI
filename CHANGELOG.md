# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-18

### Added

- Initial public release of AI PathFinder graduation project
- React + Vite frontend with career roadmap, compare, resume, and chat features
- Node.js + Express + TypeScript backend with JWT authentication
- Python Flask AI microservice with multi-provider fallback (OpenAI, Gemini, Groq, Hugging Face)
- PostgreSQL database with Prisma ORM
- Google Sign-In via Firebase Auth
- Password reset flow via SMTP email
- Saved roadmaps, comparisons, resumes, and chat history
- Docker Compose setup for local PostgreSQL
- Comprehensive README, CONTRIBUTING guide, and environment templates

### Security

- Moved all secrets to `.env.example` templates
- Removed hardcoded API keys from source code
- Added root and component-level `.gitignore` rules
- Excluded user uploads and build artifacts from version control

[1.0.0]: https://github.com/youssefgomaa20/Graduation-Project/releases/tag/v1.0.0

# Contributing to AI PathFinder

Thank you for your interest in contributing to this graduation project! This guide will help you get started.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/youssefgomaa20/Graduation-Project.git
   cd Graduation-Project
   ```
3. **Set up environment variables** — copy each `.env.example` to `.env` and fill in your values (see [README.md](README.md#environment-variables)).
4. **Install dependencies** for backend, frontend, and AI service.
5. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd Frontend/PathFinderAI/pathfinderai
npm install
npm run dev
```

### AI Service
```bash
cd Ai
pip install -r requirements.txt
python main.py
```

### Database (local)
```bash
cd database
docker compose up -d
```

## Code Style

- **TypeScript/JavaScript:** Follow existing patterns in the codebase. Run `npm run lint` in the frontend before submitting.
- **Python:** Use clear function names and keep services modular under `Ai/services/`.
- **Commits:** Write clear, descriptive commit messages in the imperative mood (e.g., "Add resume export feature").

## Pull Request Process

1. Ensure your branch is up to date with `main`.
2. Test your changes locally — backend on `:8080`, frontend on `:5173`, AI service on `:5000`.
3. **Never commit** `.env` files, API keys, or user uploads.
4. Open a pull request with:
   - A clear title and description
   - Steps to test your changes
   - Screenshots for UI changes (if applicable)

## Reporting Issues

When opening an issue, please include:

- Steps to reproduce
- Expected vs. actual behavior
- Environment (OS, Node version, browser)
- Relevant logs (redact any secrets)

## Security

If you discover a security vulnerability, please **do not** open a public issue. Contact the maintainer directly.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

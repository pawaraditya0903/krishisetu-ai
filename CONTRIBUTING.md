# Contributing to KrishiSetu AI 🌾

Thank you for your interest in contributing to **KrishiSetu AI**! We welcome contributions from developers, researchers, and agriculture domain experts.

---

## 🚀 Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/pawaraditya0903/krishisetu-ai.git
cd krishisetu-ai
```

### 2. Frontend Setup
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
python scripts/seed.py
uvicorn app.main:app --reload --port 8000
```
API Documentation available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🧪 Running Tests Before Submitting PRs

All pull requests must pass both the backend and platform test suites:

```bash
# 1. Run Python Backend Test Suite (36 tests)
cd backend
python -m pytest

# 2. Run Admin & Platform Verification Suite (16 tests)
cd ..
node test-admin-features.mjs

# 3. Verify TypeScript Type Safety
npx tsc --noEmit

# 4. Verify Next.js Production Build
npm run build
```

---

## 📐 Code Style & Conventions

- **Frontend**: Follow Next.js 16 App Router standards. Use Tailwind CSS with designated semantic tokens. Avoid inline styles where utilities exist.
- **Backend**: Adhere to PEP 8 and FastAPI dependency injection patterns. Use Pydantic schemas for request/response validation.
- **Commit Messages**: Use Conventional Commits (`feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `test: ...`).

---

## 🔒 Security & Vulnerabilities

Please refer to [SECURITY.md](SECURITY.md) for our security reporting policy. Never commit API keys, secrets, or unencrypted credential files.

# NovaBoard — Project Management Tool

A full-stack Kanban project management tool with real-time collaboration.

**Stack:** Node.js · Express · SQLite (better-sqlite3) · Socket.io · React · Vite · Tailwind CSS · dnd-kit

---

## Quick Start (No database setup needed!)

### 1. Backend

```bash
cd backend
npm install
npm run db:seed      # creates SQLite file + demo data
npm run dev          # starts on http://localhost:5000
```

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev          # starts on http://localhost:5173
```

Open http://localhost:5173 and log in with:

| Email | Password |
|-------|----------|
| alice@example.com | password123 |
| bob@example.com | password123 |
| carol@example.com | password123 |

---

## No configuration required

The SQLite database is created automatically at `backend/data/app.db` on first run. No PostgreSQL, no Prisma, no cloud setup needed.


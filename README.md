# 📝 Notes App

Full-stack notes application built as a take-home project.

## Tech Stack

**Backend**
- Express.js — REST API
- Sequelize ORM — database modeling
- Supabase (PostgreSQL) — cloud database
- JWT + bcrypt — authentication

**Frontend**
- React + Vite
- shadcn/ui + Tailwind CSS
- Framer Motion — animations
- Tiptap — rich text editor
- TanStack Query — server state

## Features
- 🔐 Register & Login (JWT auth)
- 📝 Rich text note editor (Tiptap)
- 🏷️ Tags with color picker
- 📌 Pin / favorite notes
- 🔍 Search & filter by tag
- 🗑️ Trash / soft delete + restore
- 🌙 Dark mode

## Project Structure
notes-app/
├── client/               # React frontend (Vite)
│   ├── src/
│   │   ├── api/          # Axios API calls
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth context
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   └── App.jsx
│   └── package.json
├── server/               # Express backend
│   ├── src/
│   │   ├── config/       # Database config
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # JWT middleware
│   │   ├── models/       # Sequelize models
│   │   └── routes/       # API routes
│   └── package.json
└── README.md

## Getting Started

```bash
# 1. Clone repo
git clone https://github.com/femasarianda/notes-app.git
cd notes-app

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Setup environment
cp server/.env.example server/.env
cp client/.env.example client/.env
# Isi DATABASE_URL dan JWT_SECRET di server/.env

# 4. Run dev servers (2 terminal)
cd server && npm run dev
cd client && npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/notes | Get all notes (with filters) |
| POST | /api/notes | Create note |
| PUT | /api/notes/:id | Update note |
| DELETE | /api/notes/:id | Soft delete (trash) |
| PATCH | /api/notes/:id/pin | Toggle pin |
| PATCH | /api/notes/:id/restore | Restore from trash |
| DELETE | /api/notes/:id/permanent | Permanent delete |
| GET | /api/tags | Get all tags |
| POST | /api/tags | Create tag |
| PUT | /api/tags/:id | Update tag |
| DELETE | /api/tags/:id | Delete tag |
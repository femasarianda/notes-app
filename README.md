# 📝 Notes App

Full-stack notes app — Express.js + React + Supabase (PostgreSQL).

## Stack
- **Backend**: Express, Sequelize, Supabase (PostgreSQL), JWT, bcrypt
- **Frontend**: React + Vite, shadcn/ui, Framer Motion, Tiptap, TanStack Query

## Features
- Auth (register / login)
- Rich text editor (Tiptap)
- Tags & categories
- Pin / favorite notes
- Search & filter
- Trash / soft delete
- Dark mode

## Getting Started
```bash
npm run install:all
cp server/.env.example server/.env
# isi kredensial Supabase di server/.env
npm run dev
```
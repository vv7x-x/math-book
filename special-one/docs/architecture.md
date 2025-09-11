# Architecture

## Overview
- Monorepo: `special-one/`
- Services:
  - `backend/`: Node.js + Express + MongoDB
  - `web/`: Next.js 14 App Router
  - `mobile/`: (placeholder for Flutter)
  - `docs/`: documentation
  - `assets/`: shared assets
  - `archive/`: deprecated or unused items

## Data Flow
- Client (Web/Mobile) -> REST API (Backend) -> MongoDB
- Auth: JWT Access + Refresh (tokenVersion invalidation on logout)
- Roles: `student`, `moderator`, `admin`

## Entities
- User(email, password, role, tokenVersion)
- Student(user, fullName, nationalId, phones, stage, age, center, approved)
- Attendance(student, date, status, by)
- Schedule(title, dayOfWeek, startTime, endTime, center, stage)
- Announcement(title, body, audience, stage?, center?, createdBy)
- Payment(student, amount, method, month, notes, recordedBy)

## Security
- helmet, hpp, xss-clean
- mongo-sanitize
- rate limit
- CORS

## Environments
- Local dev
- Production (Render Backend, Vercel Web, MongoDB Atlas)

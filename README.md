Special One Attendance System

Overview

- Student website (Arabic default, English optional) with registration, login, dashboard (QR, schedule, announcements), dark/light mode
- Admin panel with login, pending approvals, lessons CRUD, announcements, centers management
- Backend Node.js/Express with Firebase Admin placeholders
- Flutter Android app with login, registration, dashboard (QR, schedule, announcements), theme/lang toggles

Structure

- website/
- admin-panel/
- backend/
- mobile-app/
- design/

Backend Setup

1) Set environment variables:
- PORT=4000
- FIREBASE_PROJECT_ID=your_project_id
- GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/serviceAccount.json (optional)

2) Install and run:
cd backend
npm install
npm run dev

3) Seed minimal data (via Firebase Console or API):
- Collection admins: { id: 'admin1', username: 'admin', password: 'admin', role: 'admin' }
- Collection centers: { id: 'c1', name: 'Center A' }

Frontend Usage

- Open website/index.html for student portal
- Open admin-panel/index.html for admin login, then dashboard.html

Flutter App

1) Install Flutter SDK, then:
cd mobile-app
flutter pub get
flutter run -d emulator-5554

API Base URL

- Default is http://localhost:4000. Update localStorage key apiBase in the browsers or use --dart-define=API_BASE for Flutter builds.

Notes

- Authentication is simplified for MVP. Replace with secure auth later.
- Push notifications can be added via Firebase Cloud Messaging.



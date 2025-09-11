# Admin Program (Scanner)

Delivery: PWA (Progressive Web App) with camera access, offline queue, and sync.

Planned stack:
- Vite + TypeScript + PWA Plugin
- Workbox Service Worker
- IndexedDB (idb) for offline queue

Features (Milestone 6):
- Admin authentication (JWT now; migrate to Firebase Auth with custom claims later)
- Fetch today's lessons
- Camera QR scan (BarcodeDetector API with fallback)
- Send token to `markAttendance` Cloud Function
- Immediate success/failure UI
- Offline queue & background sync with idempotency keys

Env vars (to be set later):
- VITE_FUNCTIONS_URL=
- VITE_FIREBASE_PROJECT_ID=

Scripts (after scaffold):
- npm run dev
- npm run build

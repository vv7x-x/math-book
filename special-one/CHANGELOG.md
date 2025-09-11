# CHANGELOG

## 2025-09-11

- Added project structure folders: `docs/`, `assets/`, `archive/`.
- Backend hardening and fixes:
  - Added `tokenVersion` to `User` for refresh token invalidation.
  - Implemented `/api/auth/refresh` and `/api/auth/logout`.
  - Improved validation in `students`, `auth` routes.
  - Added null-guards in `attendance` and `payments` routes for `GET /me`.
  - Reordered `xss-clean` after body parsing and improved CORS fallback in dev.
- Web (Next.js 14) scaffold:
  - Added `Student Profile` page at `app/(student)/profile/page.tsx`.
  - Added `components/ProfileCard.tsx` and `lib/api.ts` with `fetchStudentProfile`, `logout`, and `updateStudentProfile`.
  - Tailwind configured with RTL base styles.
- Updated root `README.md` to reflect the new structure and run instructions.
- Created documentation stubs in `docs/`.

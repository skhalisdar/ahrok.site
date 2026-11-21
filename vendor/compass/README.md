# COMPASS Learning Lab

Served at `/nycmccompass` by a Next.js Node route handler. The UI is plain HTML/CSS/JavaScript with no extra client dependencies. It uses the existing Kite PostgreSQL configuration, isolated `compass_*` tables, and existing Kite administrator sessions. Each student signs in with a random ID and a four-digit code; codes are salted with scrypt and sessions use HttpOnly secure cookies. Students never receive the roster, private notes, or credential hashes.

## Start

From the repository root: `pnpm install --frozen-lockfile`, then `pnpm dev`. Existing Kite setup and a database initialized for institution `nycmc-compass` are required. Set `COMPASS_ORIGIN` to the exact origin when running locally or in a preview; production defaults to `https://ahrok.site`. Production requires PostgreSQL (`DATABASE_URL` or the existing `PG*` variables). Do not put student data or database credentials in source control.

## Instructor setup

Open `/nycmccompass`, expand Instructor sign-in, and use the existing Kite admin ID/password. In Students, create a learner or import CSV with `name,grade` headers. Use first name plus last initial or a nickname, grades 6–8. Preview before importing. Download the one-time sign-in cards immediately and distribute each card privately. Existing matching nickname/grade pairs are skipped. Reset code revokes all that student's sessions. Deactivate retains reporting history while preventing login.

Attendance supports every scheduled date and CSV reporting. Progress is instructor-controlled. Project submissions are private to the student and instructor; review status is separate from module completion. Raised hands refresh on the instructor dashboard every 20 seconds. Shared-device users must sign out. A four-digit code has limited entropy: random student IDs and persistent account/IP rate limits reduce guessing. Do not use this system to store sensitive information.

## Curriculum

49 Monday/Wednesday meetings, Nov 23, 2026–Jun 9, 2027; last 3 reserved for review/catch-up/showcase. The program deadline is Sunday Jun 13. `www/curriculum.js` contains the session objectives and activities. Demos are 10 minutes; most time is hands-on. Confirm local program closures with the instructor before launch.

## Validate and deploy

`node --test tests/compass.test.mjs`, `pnpm test:kite`, `pnpm build`.
The existing Vercel project `ahrok-site-website-creation` deploys main to ahrok.site. No new hosting service or paid dependency is required. Before deployment, run `migrations/2026-11-20-compass.sql` as the owner of the existing NYCMC/COMPASS database. It adds three isolated tables and grants only table-level DML permissions to the existing `kite_app` role. The runtime never runs PostgreSQL DDL; deployment identity must match. SQLite tests create their own temporary schema. Verify unauthenticated access, instructor login, student creation, and student-only data after publishing. Revert the Compass commit to roll back application code; keep student data for recovery.

# NYCMC COMPASS — independent application

Setup in progress November 21, 2026. Independent private repository created and dedicated Neon schema installed. Live deployment and login verification are pending.

This project contains only COMPASS. It has its own instructor accounts, sessions, database adapter, deployment identity, reporting and student records. It does not accept Kite cookies, call Kite routes, or fall back to generic/Kite database variables. The current shared application and PR #5 remain untouched.

## Verification

Node 24 or later: `npm test`. Six tests pass: student isolation and revocation; rate limits and wrong database rejection; atomic import and deduplication; PostgreSQL startup without DDL; independent instructor login/logout and rejection of Kite sessions; rejection of generic database configuration. Syntax checks pass for provisioning and HTTP entry points. Live PostgreSQL, Vercel routing and browser login remain unverified.

## Deployment sequence

1. Create a dedicated private repository for these files and a separate Vercel project. Do not import Kite or other Ahrok source. Confirm hosting eligibility before production deployment under the existing $0 constraint.
2. Create a dedicated empty Neon Free project/database. The dedicated `nycmc-compass` project exists (Neon project `lingering-base-93902649`).
3. Apply `migrations/001-independent.sql` as database owner. It refuses to run if any public application tables already exist. Never run the earlier Kite migration.
4. Create a dedicated runtime login `compass_runtime` using SQL CREATE ROLE with LOGIN, NOCREATEDB, NOCREATEROLE and NOBYPASSRLS (not the Neon console role form, which grants neon_superuser), then apply `migrations/002-runtime-grants.sql` as owner. Do not give this role table ownership, CREATE, or access to Kite.
5. Provision the instructor and the existing 21 student credentials with `node provision.mjs`, sending the private JSON described below through stdin. Use the owner connection only for provisioning. Passwords/codes are scrypt-hashed; inserts are atomic and fail on duplicate IDs. No credentials or student roster are included in this archive.
6. Set only `COMPASS_DATABASE_URL` to the dedicated runtime connection in the independent Vercel project, and `COMPASS_ORIGIN=https://ahrok.site`. Remove URL SSL query parameters; the adapter explicitly requires certificate verification. Optional certificate path: `COMPASS_PGSSLROOTCERT`. Do not expose connection strings as client/public variables.
7. Install dependencies with `npm install`, deploy the separate project, and proxy `/nycmccompass` and `/nycmccompass/:path*` on ahrok.site to the separate deployment, preserving the path. The existing Next route must be replaced by an external rewrite that runs before filesystem routes. Verify public URL handling, origin enforcement and secure cookies before enabling student use. Do not change `/kite`.
8. Test actual instructor/student login, logout, denied cross-student access, persistence and reporting on the live URL. Confirm all 21 accounts before distributing credentials as active.

Provisioning input shape (via stdin only):
`{"instructor":{"id":"...","password":"..."},"students":[{"id":"c0123456789","code":"1234","name":"Example A.","grade":6}]}`
The instructor password must contain at least 12 characters. Preserve the credentials from the previously generated private package instead of silently replacing them.

## Local preview

`npm start` serves port 3000. For authenticated browser QA use HTTPS because session cookies always require Secure. Tests use an in-memory SQLite fixture; production refuses SQLite. `COMPASS_DB` is local-only. The production runtime uses `COMPASS_DATABASE_URL` or COMPASS-prefixed PostgreSQL variables only.

## Remaining work

Repository and dedicated database/schema are created. Runtime role creation is complete. Account import, deployment, proxy routing and live sign-in verification must be confirmed before distributing logins as active. No paid services have been enabled.

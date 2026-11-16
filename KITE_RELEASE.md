# Kite web and mobile API integration

This change adds `/kite` (administrator portal), `/kite/api/admin/*` and
`/api/mobile/*` to the existing website. Existing pages and components are unchanged.
The portal loads even if the database is unavailable; API failures return a safe 503.
Teacher accounts remain mobile-only. Mobile login still requires genuine device verification.

Source: `skhalisdar/Kite` commit `7744d18a3990b9f70e53bdba76b16bf5da4797b3`.
The server and browser assets are vendored under `vendor/kite`; the only server
adaptation changes asset reads to an explicit directory included in the function bundle.
Future Kite changes must update this copy and rerun the integration tests.

## Release status

Prepared and tested locally. Not deployed. The preparation branch explicitly disables
automatic Vercel deployment for itself. Main and unrelated branches retain their existing behavior.
Do not merge until the intended Vercel project is accessible, hosting eligibility under
the $0 budget is resolved, and the server environment has been verified.

## Required server environment

Use Node.js 24. Put secrets directly into the deployment environment; never commit them
or expose them through NEXT_PUBLIC variables.

| Variable | Setting |
| --- | --- |
| `DATABASE_URL` | Existing Neon PostgreSQL connection URL; remove URL TLS query parameters, since the adapter enforces certificate verification itself |
| `KITE_ADMIN_ORIGIN` | `https://ahrok.site` |
| `KITE_INSTITUTION_ID` | `nycmc-compass`, matching the dedicated database identity |
| `DESK_TIMEZONE` | `America/New_York` |
| `KITE_SKIP_SCHEMA` | `1` after the database preparation step has succeeded |
| `KITE_APPLE_TEAM_ID` | `RULGD6HTRL` |
| `KITE_IOS_BUNDLE_ID` | `com.ahrok.afterschooldesk` |
| `KITE_PROOF_BINDING_SECRET` | Existing shared secret, at least 64 characters; keep stable across instances and deployments |
| `KITE_ANDROID_PACKAGE` | `com.ahrok.afterschooldesk`, after Play configuration is ready |
| `KITE_PLAY_CERTIFICATE_SHA256` | Actual Play app-signing certificate SHA-256 digest |
| `KITE_GOOGLE_SERVICE_ACCOUNT_JSON` | Server-only Play Integrity decode service credential |

For a truly empty database, also supply `DESK_ADMIN_ID` and
`DESK_ADMIN_PASSWORD` (12–128 characters) for the explicit preparation step only.
An existing administrator is never reset by those variables. Preserve the existing
Neon data and sponsorship dates. This change does not activate or extend sponsorship.

## Validation and release sequence

1. Review the exact target Vercel team/project and confirm it can be used within the $0 limit.
2. Verify the existing Neon Free database and server variables through the connected account.
   If an existing schema/data migration is needed, use `vendor/kite/scripts/migrate-postgres.mjs`
   with its backup and verification workflow; do not create a replacement database.
3. With `NODE_ENV=production`, the intended database and all required settings available
   securely in the shell, unset `KITE_SKIP_SCHEMA` and run `node scripts/prepare-kite.mjs`.
   Restore `KITE_SKIP_SCHEMA=1` for deployed requests.
4. Run `pnpm test:kite` and `pnpm build`.
5. Stage and test the deployment before assigning production traffic. Verify existing
   homepage, product, privacy and support routes, then admin login and a sample record round-trip.
6. On a physical iPhone running the signed TestFlight build, verify App Attest, login,
   attendance and a record appearing in the web portal. Do not use simulated proof acceptance.
7. Configure Android release signing and Play Integrity, install through a Play test track,
   and verify the same flow on a physical Android device before release.

The integration tests exercise persisted sessions/records, groups, teacher accounts,
attendance, homework, activities, pickup, incidents, CSV export, origin restrictions,
teacher web denial, missing device proof denial, and database initialization recovery.
They use a temporary SQLite database; they do not establish live Neon, Apple or Google acceptance.
Production explicitly refuses SQLite.

Daily schedule editing, staff messaging, paid subscriptions and shared multi-institution
hosting are not implemented in the current Kite source and remain separate completion items.

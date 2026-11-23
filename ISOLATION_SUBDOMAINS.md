# Three-project browser-origin isolation: staged preparation only

**No deployment, DNS, database, account, credential or production route was changed.**

## Chosen target design
- Root: `https://ahrok.site`, project `ahrok-site-website-creation`, source `skhalisdar/ahrok.site`.
- Kite: `https://kite.ahrok.site/kite/`, project `kite`, source `skhalisdar/Kite`. This first stage deliberately retains `/kite/` as the app's internal asset/API base path; it can gain a subdomain-root alias later.
- COMPASS: `https://compass.ahrok.site/nycmccompass`, project `nycmc-compass`, source `skhalisdar/nycmc-compass`. This first stage retains its tested internal routes.
- After readiness, old URLs `https://ahrok.site/kite` and `https://ahrok.site/nycmccompass` redirect temporarily (307) to these independent browser origins.
- Root may publish general links to the other apps, but it must not load their JS, backend, CSS or auth credentials.

## This preparation branch
- Adds **inactive-by-default** redirect rules gated behind `AHROK_SUBDOMAIN_CUTOVER=enabled`.
- Does not remove existing root-mounted Kite/COMPASS handlers yet. They are a **known active isolation gap** until approved source removal and root deployment.
- Disables Vercel deployment from this branch.
- Does not modify root's existing COMPASS external rewrite, live cookie or data behavior.
- Existing root product demo localStorage keys stay untouched.

## Verified database inventory (read-only; no personally identifying records retrieved)
- `my-first-project` Neon: identity `nycmc-compass`, 86 Kite students, 6 active teachers, 4 groups, 2 device rows.
- `kite-wip` Neon: identity `kite-wip`, 1 student, 0 active teachers, 1 group.
- `shiny-thunder-91747747` Neon: identity `nycmc-compass-independent`, 21 active students and 1 instructor.
- `lingering-base-93902649` Neon: same COMPASS identity, but empty.
- These counts do **not** establish which exact Neon endpoint each Vercel production deployment uses. That mapping must be proven with authorized environment-variable metadata (hostnames only; never expose passwords). Treat all four projects as protected until separately backed up and verified.

## Mandatory approval gates before root production release
1. Verify all three project IDs and production environment configurations in Vercel; current connector exposes zero projects despite their appearance in the user's dashboard. Never infer a connection string from a GitHub source or a data count.
2. Verify writable, restorable and checksum-verified backups of the populated Kite and COMPASS databases; preserve student identities, credential verifiers, group assignments, attendance, instructor/student state, device records, reports, and schedules.
3. Assign `kite.ahrok.site` **only** to the existing Kite Vercel project and `compass.ahrok.site` **only** to the existing COMPASS Vercel project. Do not detach `ahrok.site` or modify unrelated DNS, mail, or TXT records. Verify DNS and certificate issuance.
4. Set `KITE_ADMIN_ORIGIN=https://kite.ahrok.site` in the Kite project alone, `COMPASS_ORIGIN=https://compass.ahrok.site` in COMPASS alone. Keep distinct connection credentials and institution identity guards. Never give Root access to the two backends' database secrets.
5. Verify fresh and wrong-origin login/login refusal at dedicated subdomains, RBAC, static content, attendance, reports, CSV, student/instructor progress; verify on-device Play Integrity and App Attest separately. Host-only `__Host-` cookies with `Path=/`, `Secure`, `HttpOnly`, `SameSite=Strict` are valid with distinct subdomains.
6. Obtain separate confirmation to **remove** the root's embedded `vendor/kite`, `vendor/compass`, `apps/compass`, `lib/kite-http.mjs`, old root route handlers, unnecessary root app dependencies, and old root endpoint fallbacks after ownership and state are verified. This is a breaking/deletion operation, NOT authorized by the current staging approval.
7. Confirm legacy `/api/mobile/*` behavior and support signed older Android/iOS builds until a new signed release is installed by every intended tester. Do not redirect POST requests blindly across origins; block or phase out authenticated legacy endpoints deliberately.
8. Only then enable `AHROK_SUBDOMAIN_CUTOVER=enabled` and promote vetted root routing with an explicit rollback plan. Test cross-app session isolation, assets, unauthorized root API access, no secret cross-read and data consistency.

**Important:** URL path prefixes on the same hostname are not browser security boundaries. Distinct subdomains are separate origins; absent a cookie Domain attribute, `__Host-` cookies are host-only. `Path=/` is required for `__Host-`; do NOT change it to `/kite` or `/nycmccompass` while retaining that prefix.

No migration, merge, deletion, routing activation or production deployment may occur without separate explicit approval.

# Three-project browser-origin isolation: staged preparation only

**Staging-only root decoupling performed. No production deployment, DNS, database, account, credential or production route was changed.**

## Chosen target design
- Root: `https://ahrok.site`, project `ahrok-site-website-creation`, source `skhalisdar/ahrok.site`.
- Kite: `https://kite.ahrok.site/kite/`, project `kite`, source `skhalisdar/Kite`. This first stage deliberately retains `/kite/` as the app's internal asset/API base path; it can gain a subdomain-root alias later.
- COMPASS: `https://compass.ahrok.site/nycmccompass`, project `nycmc-compass`, source `skhalisdar/nycmc-compass`. This first stage retains its tested internal routes.
- After readiness, old URLs `https://ahrok.site/kite` and `https://ahrok.site/nycmccompass` redirect temporarily (307) to these independent browser origins.
- Redirects apply to the **landing URLs only**. Deep legacy routes including POST endpoints must be explicitly retired/rejected, not 307-redirected across different browser origins; these currently remain live in source pending approved removal.
- Root may publish general links to the other apps, but it must not load their JS, backend, CSS or auth credentials.

## This preparation branch
- Adds **inactive-by-default** redirect rules gated behind `AHROK_SUBDOMAIN_CUTOVER=enabled`.
- Removes root-embedded Kite/COMPASS backend files and old handlers from THIS DRAFT BRANCH ONLY. Their dedicated GitHub repositories and all Neon datasets are untouched. Production still contains the legacy handlers until a separately tested, approved cutover.
- Disables Vercel deployment from this branch.
- Removes the old COMPASS external reverse-proxy rewrite from THIS DRAFT BRANCH ONLY. Old root paths will stop serving application code after promotion, except for the two inactive-by-default landing-page redirects.
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


## Recovery checkpoint completed (2026-11-23)

The two established, populated Neon datasets each now have a manual snapshot
AND a restored, distinct **non-default** branch. No production branch was replaced.

| Dataset | Snapshot | Restoration branch | Integrity check |
|---|---|---|---|
| Established Kite: 86 students, 7 users, 4 groups | `snap-late-block-bdvn9ha0` | `br-little-breeze-bdr1p6px` | All 22 public tables match source by row count and digest |
| Populated COMPASS: 21 students, 1 instructor | `snap-bitter-cherry-bdlvfrc8` | `br-royal-shape-bd92c9av` | All 6 public tables match source by row count and digest |

The source projects were `billowing-sunset-52888502` (Kite records) and
`shiny-thunder-91747747` (COMPASS records), respectively. This is a
validated Neon-level recovery checkpoint, **not** an independent off-platform
`pg_dump`. Do not delete the snapshots or restoration branches. On-platform
snapshot retention and access share project ownership, so independent encrypted
archives are still required before risky production changes.

## Verification of DNS / routing authorization (2026-11-23)

- Vercel reports an `ahrok.site` apex project-domain mapping to
  `prj_rsr3nDHiqYCtV1FW17V7pxME0CoW`.
- DNS includes an existing wildcard ALIAS, but no explicit `kite` or
  `compass` DNS records. A wildcard alone does **not** assign a hostname to
  the intended Vercel project or establish certificate and app readiness.
- The ChatGPT Vercel integration can list the team and its domain/DNS records,
  but its project list is empty and project/environment reads return 404.
- Therefore no new domain assignment or production environment change is
  approved or performed.

## Strict root security gate

`node scripts/isolation-gate.mjs --report-only` prints current independent
ownership violations without changing anything. `--enforce` returns exit
status 2 whenever forbidden embedded backend files, package dependencies,
or root proxy handlers remain. The staging GitHub workflow runs this as a
**separate intentionally failing security job** until explicit authorization
is given to remove the root embedded applications and their dependencies.

A successful Next.js build or unit test is not a substitute for passing this
strict root isolation gate. The root site is **not** ready to merge or deploy.

## Source-ownership cleanup staged

Root only retains the Ahrok website, contact form, and independent root-site product demos. All in-repo application copies under `vendor/kite`, `vendor/compass`, and `apps/compass`, plus root executable app routes, Kite server adapter, and backend-related root package dependencies have been deleted on the draft branch. The dedicated `skhalisdar/Kite` and `skhalisdar/nycmc-compass` repositories were not changed by this cleanup. The prior legacy browser reset-helper was specific to the old root-hosted Kite database and is intentionally retired with that copy; use a verified project-scoped recovery procedure instead of silently exposing its hardcoded database link.

The `--enforce` isolation gate and root build **must** both pass on this branch. Until the two dedicated subdomains pass HTTPS, configuration, and live login tests, DO NOT merge this branch. Root's former `/api/mobile` endpoint will be removed; confirm all supported signed native builds continue using an independent Kite endpoint before publishing.

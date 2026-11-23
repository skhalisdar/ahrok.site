# Kite single-origin consolidation — staged, not deployed

Target: `https://ahrok.site/kite` for the administrator portal, and
`https://ahrok.site/api/mobile/*` for iOS/Android. Both routes must use
**one dedicated Kite PostgreSQL database** with identity `kite-wip`.
The existing `/nycmccompass/*` rewrite and its independent database are
strictly outside scope.

## Evidence and discrepancy

- The present website includes older vendored Kite source with a live
  administrator named `admin` (confirmed by operator login).
- Signed Android Build 6 (1.0.5) and the latest iOS workflow target
  `https://kite-five-wine.vercel.app`; their backend uses Neon's
  `kite-wip` project, with `kite.admin` and no active teachers.
- Both `/kite/*` and `/api/mobile/*` already enter the same
  `lib/kite-http.mjs` handler in the website repository. Their
  apparent equivalence is not proof of database equivalence.
- The currently connected Vercel authorization exposes the domain
  assignment but cannot read or deploy the project owning `ahrok.site`.
  Do not infer the server's DATABASE_URL from a repository or a domain.

## This branch (source changes only)

- Bring forward current Kite application, dashboard and group-messaging code
  into the existing website's vendored Kite application without touching
  the unrelated Ahrok pages or the COMPASS rewrite.
- Keep the canonical frontend `/kite` and the mobile `/api/mobile`
  handler on the same deployment.
- Add messages asset serving and regression tests.
- Add a production guard that rejects unexpected institution/origin
  configuration rather than connecting to a cross-project database.
- Disable automatic Vercel deployment from this preparation branch.
- No production database writes, account resets or Play/App Store builds
  are authorized by this branch.

## Required cutover gates — no main-branch deployment until all pass

1. **Verify Vercel project access.** In the Vercel connection, authorize
   the existing site project (currently shown for `ahrok.site` as
   `prj_rsr3nDHiqYCtV1FW17V7pxME0CoW`). Obtain metadata only for
   the exact website project and the existing standalone Kite project;
   never reassign the apex domain to a different project.
2. **Back up, inventory and identify only legacy Kite records.** Confirm
   the existing website's database endpoint, its
   `deployment_identity`, institution ownership, user/group/student
   counts and schema without querying or altering COMPASS's independent
   database. Obtain a verified backup before any migration.
3. **Dry-run a migration into a disposable Kite-only branch.** Preserve
   active administrator/staff IDs and password hashes, assignments,
   student/group IDs, records, schedules, messages, incident/pickup
   histories and sponsorship rules. Do not infer that `admin` equals
   `kite.admin`, overwrite conflicting rows, or copy COMPASS-specific
   records. Validate counts, unique keys and foreign keys before
   switching production. Keep a rollback plan and backup.
4. **Prepare the existing `ahrok.site` Vercel project's Production
   environment:** `KITE_INSTITUTION_ID=kite-wip`,
   `KITE_ADMIN_ORIGIN=https://ahrok.site`, and the verified
   dedicated Kite connection. Set all native verification credentials
   server-side: `KITE_PROOF_BINDING_SECRET`, Apple team/bundle ID,
   Android package, Play app-signing SHA-256 certificate, and
   `KITE_GOOGLE_SERVICE_ACCOUNT_JSON`. No verification bypasses.
   Keep COMPASS and other Ahrok environment variables intact.
5. **Run tests and stage safely.** `pnpm test:kite`,
   `pnpm build`, authenticated web regression, teacher web-login denial,
   admin/staff and group permissions, group messages, attendance, reports,
   and a real phone's Play Integrity/App Attest checks. Avoid real
   student records for synthetic testing.
6. **Cut over only after the gates pass.** Merge this branch after the
   approved, backed-up data migration and correct configuration. Verify
   `ahrok.site/kite`, then change **both** mobile build workflows and
   `www/config.js` in `skhalisdar/Kite` to target
   `https://ahrok.site`. Rebuild signed Android with a new unused
   versionCode and iOS with a new build number. Validate TestFlight and
   Play internal testing before public release.

Important: neither this document nor this branch completes production
routing, account migration, device registration, or store submission.

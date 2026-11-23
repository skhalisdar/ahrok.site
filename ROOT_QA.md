# Ahrok root QA

- URL: https://test.ahrok.site
- Separate Vercel Preview deployment on `qa-isolated-20261123`
- /kite redirects to https://test-kite.ahrok.site/kite/
- /nycmccompass redirects to https://test-compass.ahrok.site/nycmccompass
- No Kite or COMPASS source, database, storage or session credentials in root QA.
- The deployment is a test environment only. Do not merge QA-specific redirects to production without review.

## Preview deployment configuration

The branch-scoped `AHROK_SUBDOMAIN_CUTOVER=enabled` variable must exist **before** Vercel builds this branch; Next.js evaluates redirects during deployment. Rebuild the QA branch after configuring the variable. Never apply QA redirect targets to production.

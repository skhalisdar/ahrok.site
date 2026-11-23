# Canonical Kite web URL change

The web administrator portal is served at **https://ahrok.site/kite**.
The Ahrok root Next.js deployment proxies only `/kite` and `/kite/*` to the independent Kite Vercel project via its stable production alias. No Kite backend files or Neon secrets belong in this repo.

NYCMC COMPASS still redirects to `https://compass.ahrok.site/nycmccompass` and retains its separate production project and database.

**Security tradeoff:** `ahrok.site` and `ahrok.site/kite` share a browser origin. Strict browser-origin isolation between Root and Kite is impossible under this URL scheme. Server and database isolation remain separate, but root-origin JavaScript can interact with Kite same-origin APIs. Do not describe this arrangement as 100% browser-isolated.

Native Kite apps continue calling `https://kite.ahrok.site/api/mobile/*`; do not rewrite native login requests through the root site or redirect their POSTs.

Acceptance checklist: root page and assets 200, `/kite` stays at root origin, `/kite/api/admin/session` returns 401 without a cookie, admin login establishes host-only cookie and loads the established 86-student roster, logout, COMPASS remains independent, invalid mobile sessions rejected. Confirm rollback deployment IDs before production changes.

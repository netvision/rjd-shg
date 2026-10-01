# RJD SHG

Quasar frontend for the restored RJDSS FastAPI service. The application source
lives on `master` (the repository's `main` branch only contains a README).

## Run locally

```sh
npm install
npm run dev
```

The development server proxies `/api/*` to `http://127.0.0.1:8000`. Set
`API_PROXY_TARGET` to change the target. Add the development frontend origin to
the API's `FRONTEND_ORIGINS` and use `COOKIE_SECURE=false` only for local HTTP.

```sh
npm test
npm run lint
npm run build
```

## Authentication

Sign in with the administrator account created in the new API. Firebase/Google
login has been replaced. A temporary password requires a password change before
accessing the ledger; after changing it, sign in again. Passwords are never saved
in browser storage. The API stores the session in an HttpOnly cookie and the
frontend holds the CSRF token in memory, refreshing it through `/auth/me` on
protected navigation. Writes carry `X-CSRF-Token`.

## Netlify deployment

`netlify.toml` builds `dist/spa`, proxies `/api/*` to
`https://api2.dalmiatrusts.in/:splat`, and serves the SPA for other routes. The
proxy rule must precede the SPA fallback. Browser requests use the same origin,
so the API's host-only `SameSite=Strict` session cookie works without third-party
cookies. No credentials are embedded in the build.

Deploy the accompanying API changes first: SHG read-only payload compatibility,
the Netlify origin allowlist, and `Cache-Control: no-store` on auth responses.
Production API settings must include:

```dotenv
FRONTEND_ORIGINS=https://rjdss.dalmiatrusts.in,https://rjd-shg.netlify.app
COOKIE_SECURE=true
```

Existing server environment files override code defaults. Restart the API after
updating them. Set the Netlify production branch to the branch containing this
application source; do not deploy the README-only `main` branch.

After deployment, verify sign-in, mandatory password change where applicable,
page refresh, member editing, payments, loans, transaction deletion, and logout
using a designated test member. These live checks require an authorized admin
account; automated tests use isolated fixtures and do not alter production data.

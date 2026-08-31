# Trium client

Responsive React SPA built with Vite, TypeScript, React Router, and Tailwind CSS.
Authentication, account deletion, Tasks, and Home’s today list are live.
Calendar and Notes are still intentional placeholders.

```bash
npm ci
npm run dev
```

The development server runs on <http://localhost:5173> and proxies `/api` to
`http://localhost:8000` by default. Set `VITE_API_PROXY_TARGET` to override it.

Useful checks:

```bash
npm run lint
npm run test
npm run build
```

## Production image

`Dockerfile.prod` builds the SPA in a Node stage and copies only `dist/` into
Caddy. `Caddyfile` serves static assets with an SPA fallback and proxies
same-origin `/api` requests to the private API container. Caddy obtains and
renews HTTPS certificates for the required `DOMAIN` environment variable.

Build and run the complete production stack from the repository root:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

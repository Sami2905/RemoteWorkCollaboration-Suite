# Deployment Profiles

This document outlines deployment options and the environment variables required.

## Frontend (Vercel)

Set the following Environment Variables in Vercel project settings:

- VITE_API_URL_HTTP
- VITE_SIGNALING_URL
- VITE_YJS_WS_URL
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_TURN_URL
- VITE_TURN_USERNAME
- VITE_TURN_CREDENTIAL

Build command: `pnpm -w build`
Output: Vite build from `apps/web`

## API / Yjs / Signaling (Render or Railway)

Recommended services:

- API (Node / Express)
- Yjs WebSocket server (Node)
- Signaling server (Socket.io)
- Redis (managed)
- Postgres (managed)
- TURN (Coturn on VM or container platform)

### API Environment Variables

- DATABASE_URL
- ALLOWED_ORIGINS (comma-separated, e.g. `https://your-web.app`)
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- REDIS_URL
- LOG_LEVEL (e.g. `info`)
- GIT_SHA (injected by CI)
- API_ORIGIN (e.g. `https://api.your-domain.com`)
- SIGNALING_WS (e.g. `https://signal.your-domain.com`)
- YJS_WS (e.g. `wss://yjs.your-domain.com`)

### Yjs Server

- Persistent volume mounted to store LevelDB data (`yjs-data`)
- Expose WS port (default 1234)

### Signaling Server (Socket.io)

- Same ALLOWED_ORIGINS as API
- Expose HTTP/WS port (e.g. 8082)

### TURN (Coturn)

- TLS enabled in production
- `--external-ip <public-ip>/<private-ip>` if behind NAT
- Open ports 3478 TCP/UDP + relay range (49160-49200)

## Single-host Docker Compose (Optional)

You can extend the existing `docker-compose.yml` to add API and Signaling services and point the web app to those origins. Ensure CSP and CORS match production domains.

## Environment Checklist

- [ ] Frontend: All `VITE_*` variables set
- [ ] API: `DATABASE_URL`, `SUPABASE_*`, `REDIS_URL`, `ALLOWED_ORIGINS` set
- [ ] Yjs: volume mounted, port exposed
- [ ] Signaling: port exposed, CORS configured
- [ ] TURN: TLS + external IP set
- [ ] CSP: `connect-src` entries match your domains

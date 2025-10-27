# Ops Runbook (On-call & Triage)

## Service Map
- Web (Vercel or static hosting)
- API (Node/Express)
- Yjs WebSocket server
- Signaling (Socket.io)
- Redis (presence, rate limit)
- Postgres (data)
- Coturn (TURN)

## Restart Order
1) Redis
2) Postgres
3) API
4) Yjs
5) Signaling
6) Web

## Quick Health Checks
- API: `GET /health` (200 OK)
- Version: `GET /version` (check `sha`)
- Socket: connect to signaling WS (no errors)
- Yjs: connect WS (no errors)
- TURN: `nc -vz <host> 3478` (TCP) and UDP checks, verify relay

## Common Issues & Fixes

### 401 / 403 Errors
- Verify client sends `Authorization: Bearer <JWT>`
- Check Supabase service role key configured in API
- Confirm membership exists for workspace

### CSP Violations
- Check `connect-src` entries include: API, signaling (http/ws), Yjs (http/ws), STUN/TURN
- Update `ALLOWED_ORIGINS`, `API_ORIGIN`, `SIGNALING_WS`, `YJS_WS` envs accordingly

### WebRTC Fails
- Ensure Coturn reachable on 3478 TCP/UDP
- If behind NAT, set `--external-ip public/private` flags
- Verify `VITE_TURN_*` vars on web client
- Try rejoin/ICE restart; check network tab for TURN usage

### Yjs State Loss
- Ensure LevelDB volume mounted and writable
- Fallback to `/documents/:id/state` incremental endpoint should restore
- Check API logs for merge/update errors

### Performance Problems
- Enable Redis adapter for Socket.io (pub/sub)
- Verify DB indexes exist (messages by `workspaceId, createdAt`; tasks by `columnId, order`)
- Increase API instance size or replicas

## Rollback Procedure
- Identify bad deploy SHA via `/version`
- Revert to previous commit or redeploy prior build
- Validate with smoke test (Playwright)

## Backups
- Postgres automated backups enabled; retain snapshots for `DocumentState`, `Message`, `Task` tables
- Regular restore drills recommended

## Logs & Monitoring
- API logs via Pino; pretty-print in dev
- Platform logs for Yjs and signaling
- TURN logs for connection/relay issues
- Consider adding uptime checks and alerts

## On-call Checklist
- Acknowledge alert; collect logs and env state
- Perform health checks; identify failing component
- Apply targeted restart (follow order above)
- Validate feature flows with smoke test
- Document incident: cause, resolution, follow-ups

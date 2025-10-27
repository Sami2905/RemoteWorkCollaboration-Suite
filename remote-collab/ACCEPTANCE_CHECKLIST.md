# Acceptance Checklist (Go/No-Go)

## Security
- [ ] REST + sockets require JWT + workspace membership
- [ ] Zod validation on all inputs
- [ ] REST rate limits enabled (Redis when available); socket per-user throttle
- [ ] Helmet with CSP enabled in production; CORS pinned to ALLOWED_ORIGINS
- [ ] Service role key never sent to client

## Realtime + Persistence
- [ ] Documents: Yjs + LevelDB; Postgres incremental state; recovery works
- [ ] Tasks: drag reorder persists; real-time sync across tabs
- [ ] Chat: cursor pagination; real-time updates; toasts off-chat
- [ ] Whiteboard: authoritative bootstrap; TTL/GC; 5MB guard enforced
- [ ] Video: TURN relays; ICE restart & rejoin verified
- [ ] Presence: Redis set; header count and avatars show

## UX / Performance
- [ ] Lazy routes, Suspense fallbacks, ErrorBoundary
- [ ] Animations only on transform/opacity; durations ~160–220ms
- [ ] No console errors or unhandled rejections

## Observability
- [ ] Pino logs structured (pino-pretty in dev)
- [ ] /health and /version return OK; GIT_SHA correct

## Documentation
- [ ] README updated to Postgres + TipTap + dnd-kit + y-websocket
- [ ] TURN_SETUP.md, DEMO_TEST_PLAN.md, FINAL_SETUP.md present
- [ ] DEPLOYMENT.md present with env checklist

## CI / E2E
- [ ] CI (build, typecheck, lint) green on main
- [ ] Playwright smoke test passes locally

Decision: GO ☐  NO-GO ☐

## Web App Stack

- React 19 + TypeScript + Vite
- React Router, React Query, Zustand
- TipTap + Yjs via `y-websocket` for collaborative documents
- Socket.io for chat/tasks/whiteboard
- Framer Motion, Tailwind, react-hot-toast

### Documents
- Editor: TipTap Collaboration + Cursor
- Transport: Yjs `WebsocketProvider` (env `VITE_YJS_URL`)
- Persistence: LevelDB on Yjs server for CRDT state; periodic snapshots to API (env `VITE_API_URL`) stored in Postgres.

### DnD
- `dnd-kit` for task board reordering, persisted via Prisma transaction and broadcast over sockets.

### Auth
- Supabase JWT. Client attaches `Authorization: Bearer <token>` for API, sockets use handshake auth.

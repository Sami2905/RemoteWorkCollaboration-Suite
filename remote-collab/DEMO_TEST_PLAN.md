# Demo Test Plan - Remote Work Collaboration Suite

This test plan validates all core functionality for client demos. Each test should take 2-3 minutes.

## Prerequisites

1. **Start all services:**
   ```bash
   cd remote-collab
   docker compose up -d postgres coturn
   pnpm install
   pnpm dev
   ```

2. **Set up environment variables:**
   ```bash
   # In apps/web/.env
   VITE_TURN_URL=turn:localhost:3478
   VITE_TURN_USERNAME=turnuser
   VITE_TURN_CREDENTIAL=turnpass
   ```

3. **Run database migration:**
   ```bash
   cd apps/api
   pnpm prisma migrate dev --name add_document_state
   ```

## Test Scenarios

### 1. Document Collaboration (5 minutes)
**Goal:** Verify incremental snapshots and real-time collaboration

**Steps:**
1. Open two browser tabs, log in as different users
2. Navigate to Documents page in both tabs
3. Create a new document in tab 1
4. Type content in tab 1, verify it appears in tab 2
5. Type content in tab 2, verify it appears in tab 1
6. **Key test:** Restart the Yjs server (`docker compose restart yjs`)
7. Refresh both tabs - content should persist
8. **Network check:** Open DevTools → Network, verify small POST requests to `/documents/:id/state` (diffs, not full snapshots)

**Expected Results:**
- ✅ Real-time collaboration works
- ✅ Content persists after Yjs restart
- ✅ Network requests show small incremental updates (~1-5KB vs full snapshots)
- ✅ No data loss during server restarts

### 2. Chat System (3 minutes)
**Goal:** Verify persistent chat with pagination and notifications

**Steps:**
1. Open two tabs, navigate to Chat page
2. Send messages in both tabs
3. **Pagination test:** Send 20+ messages, scroll up to load older messages
4. **Notification test:** Switch to another page in tab 2, send message from tab 1
5. Return to Chat in tab 2 - should see toast notification
6. **Persistence test:** Refresh both tabs, verify message history loads

**Expected Results:**
- ✅ Messages appear in real-time
- ✅ Pagination loads older messages
- ✅ Toast notifications when off-chat page
- ✅ Message history persists across refreshes

### 3. Task Management (3 minutes)
**Goal:** Verify drag-and-drop persistence and real-time sync

**Steps:**
1. Open two tabs, navigate to Tasks page
2. Create a few tasks in different columns
3. **Drag test:** Drag a task from one column to another in tab 1
4. Verify task appears in new column in tab 2
5. **Reorder test:** Drag tasks within the same column
6. **Persistence test:** Refresh both tabs, verify task positions persist

**Expected Results:**
- ✅ Drag-and-drop works smoothly
- ✅ Changes sync in real-time between tabs
- ✅ Task positions persist across refreshes
- ✅ No duplicate or lost tasks

### 4. Whiteboard Collaboration (3 minutes)
**Goal:** Verify Excalidraw integration with state management

**Steps:**
1. Open two tabs, navigate to Whiteboard page
2. Draw shapes in tab 1, verify they appear in tab 2
3. **Large payload test:** Try to draw many complex shapes quickly
4. **State persistence:** Refresh both tabs, verify drawings persist
5. **GC test:** Wait 1+ hour (or modify TTL in code), verify old states are cleaned up

**Expected Results:**
- ✅ Drawings sync in real-time
- ✅ Large payloads are rejected (5MB limit)
- ✅ Drawings persist across refreshes
- ✅ Memory cleanup works (TTL/GC)

### 5. Video Conferencing (5 minutes)
**Goal:** Verify WebRTC with TURN server reliability

**Steps:**
1. Open two tabs, navigate to Video page
2. **Permission test:** Deny camera access, verify audio-only fallback
3. **Join test:** Join the same room in both tabs
4. **TURN test:** Check browser DevTools → Network for TURN server connections
5. **ICE restart test:** Simulate network disruption (disable/enable WiFi)
6. **Rejoin test:** Leave and rejoin the room
7. **Cross-network test:** Use different devices/networks if possible

**Expected Results:**
- ✅ Camera denial falls back to audio-only
- ✅ Video/audio works reliably across networks
- ✅ TURN server connections visible in network tab
- ✅ ICE restarts handle network disruptions
- ✅ Rejoin functionality works

### 6. Presence System (2 minutes)
**Goal:** Verify user presence with avatars and names

**Steps:**
1. Open two tabs with different users
2. **Count test:** Verify presence count updates in header
3. **Popover test:** Click presence indicator, verify user list with avatars
4. **Profile test:** Verify names and emails are displayed
5. **Real-time test:** Close one tab, verify count decreases

**Expected Results:**
- ✅ Presence count updates in real-time
- ✅ Popover shows user avatars and names
- ✅ Fallback avatars work for users without profile images
- ✅ Count decreases when users leave

### 7. Security & Performance (2 minutes)
**Goal:** Verify security headers and rate limiting

**Steps:**
1. **CSP test:** Check browser DevTools → Console for CSP violations
2. **Rate limit test:** Send many chat messages quickly
3. **Auth test:** Try accessing API endpoints without authentication
4. **CORS test:** Verify cross-origin requests are properly handled

**Expected Results:**
- ✅ No CSP violations in console
- ✅ Rate limiting prevents spam
- ✅ Unauthenticated requests are rejected
- ✅ CORS headers are properly set

## Performance Benchmarks

### Network Efficiency
- **Document updates:** < 5KB per incremental update
- **Chat messages:** < 1KB per message
- **Task moves:** < 500B per operation
- **Whiteboard updates:** < 100KB per drawing operation

### Response Times
- **Document sync:** < 100ms latency
- **Chat delivery:** < 50ms latency
- **Task persistence:** < 200ms
- **Video connection:** < 2s initial connection

### Resource Usage
- **Memory:** < 100MB per browser tab
- **CPU:** < 10% during normal usage
- **Network:** < 1MB/min during active collaboration

## Troubleshooting

### Common Issues

**Documents not syncing:**
- Check Yjs server is running: `docker compose ps yjs`
- Verify WebSocket connection in DevTools → Network
- Check for CSP violations in console

**Video not working:**
- Verify TURN server: `docker compose ps coturn`
- Check TURN credentials in environment variables
- Test with different networks/devices

**Chat messages not appearing:**
- Check Socket.io connection in DevTools → Network
- Verify authentication tokens
- Check rate limiting (120 messages/minute)

**Tasks not persisting:**
- Check database connection
- Verify Prisma migrations are applied
- Check for transaction errors in API logs

### Debug Commands

```bash
# Check all services
docker compose ps

# View API logs
cd apps/api && pnpm dev

# View Yjs logs
docker compose logs yjs

# View TURN logs
docker compose logs coturn

# Check database
cd apps/api && pnpm prisma studio
```

## Success Criteria

✅ **All tests pass without errors**
✅ **No data loss during any operation**
✅ **Real-time sync works across all features**
✅ **Performance meets benchmarks**
✅ **Security headers are properly configured**
✅ **TURN server enables reliable video calls**

## Demo Script (10 minutes)

1. **Opening (1 min):** "This is our real-time collaboration suite with documents, chat, tasks, whiteboard, and video."

2. **Documents (2 min):** Show real-time editing, then restart Yjs server to demonstrate persistence.

3. **Chat (1 min):** Send messages, show pagination, demonstrate notifications.

4. **Tasks (1 min):** Drag tasks between columns, show real-time sync.

5. **Whiteboard (1 min):** Draw together, show state persistence.

6. **Video (2 min):** Join call, show TURN server in network tab, demonstrate reliability.

7. **Presence (1 min):** Show user avatars and real-time presence updates.

8. **Wrap-up (1 min):** Highlight key technical achievements and production readiness.

---

**Total demo time: 10 minutes**
**Total test time: 20 minutes**
**Ready for client presentation: ✅**

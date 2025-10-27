# TURN Server Setup

This document explains how to set up and use the TURN server for WebRTC reliability.

## Local Development

1. **Start the TURN server:**
   ```bash
   docker compose up -d coturn
   ```

2. **Set environment variables in your web app:**
   Create a `.env` file in `apps/web/` with:
   ```
   VITE_TURN_URL=turn:localhost:3478
   VITE_TURN_USERNAME=turnuser
   VITE_TURN_CREDENTIAL=turnpass
   ```

3. **Restart your web app** to pick up the new environment variables.

## Production Deployment

For production, you'll need to:

1. **Configure TURN server with TLS:**
   - Update the docker-compose.yml coturn service to use `--cert` and `--pkey` flags
   - Set `--external-ip` to your public IP address
   - Use `turns:443` instead of `turn:3478` for the URL

2. **Update environment variables:**
   ```
   VITE_TURN_URL=turns:your-domain:443
   VITE_TURN_USERNAME=your_username
   VITE_TURN_CREDENTIAL=your_password
   ```

3. **Open firewall ports:**
   - UDP/TCP 3478 (TURN control)
   - UDP/TCP 49160-49200 (TURN relay range)

## Testing

To test TURN functionality:

1. Open two browser tabs on different networks (or use different devices)
2. Join the same video room
3. Check browser dev tools Network tab for TURN server connections
4. Verify video/audio works reliably across restrictive NATs

## Troubleshooting

- **TURN not working:** Check that the TURN server is running and accessible
- **Connection failures:** Verify firewall settings and external IP configuration
- **Authentication errors:** Double-check TURN username/password in environment variables

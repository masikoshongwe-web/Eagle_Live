# Eagle Live

Eagle Live is a React/Vite web app with a LiveKit-backed, two-host PK video room.

## Run locally

```bash
npm ci
cp .env.example .env
# Fill in the LiveKit values in .env
npm run dev
```

The Vite app runs on port 5173 and proxies `/api` requests to the Node server on port 3000. Hosts select their slot and enter the host passcode to publish camera and microphone. Viewers receive subscribe-only tokens.

## LiveKit server settings

Create a LiveKit Cloud project or use a compatible self-hosted server, then set these values in `.env` locally and in the production host's secret manager:

- `LIVEKIT_URL` — the project's `wss://` connection URL
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `EAGLE_LIVE_HOST_PASSCODE` — temporary shared passcode for host publishing

Never commit `.env` or put the LiveKit API secret in frontend code. `.env.example` contains placeholders only.

For production, replace the shared host passcode with real sign-in and server-side host-role checks before opening broadcasts to the public. LiveKit handles media transport; the existing chat, PK scoring, gifts, and payout UI remain demo-only.

## Production

```bash
npm ci
npm run build
npm start
```

This app needs a Node host for the token endpoint. Static hosting alone (including GitHub Pages) cannot issue secure LiveKit tokens.
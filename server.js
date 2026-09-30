import 'dotenv/config';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { AccessToken } from 'livekit-server-sdk';

const app = express();
const port = Number(process.env.PORT || 3000);
const roomName = 'eagle-live-pk';
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.join(currentDirectory, 'dist');

app.disable('x-powered-by');
app.use(express.json({ limit: '8kb' }));

const tokenRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many join attempts. Please try again in a minute.' },
});

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    liveVideoConfigured: Boolean(
      process.env.LIVEKIT_URL &&
      process.env.LIVEKIT_API_KEY &&
      process.env.LIVEKIT_API_SECRET
    ),
  });
});

app.post('/api/livekit/token', tokenRateLimit, async (request, response) => {
  const { role, hostPasscode } = request.body ?? {};
  const validRoles = ['viewer', 'host-1', 'host-2'];
  if (!validRoles.includes(role)) {
    return response.status(400).json({ error: 'Choose viewer, host-1, or host-2.' });
  }

  const serverUrl = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!serverUrl || !apiKey || !apiSecret || !/^wss?:\/\//i.test(serverUrl)) {
    return response.status(503).json({
      error: 'Live video is not configured yet. Set the LiveKit URL, API key, and API secret on the server.',
    });
  }

  const isHost = role === 'host-1' || role === 'host-2';
  if (isHost) {
    const configuredPasscode = process.env.EAGLE_LIVE_HOST_PASSCODE;
    if (!configuredPasscode) {
      return response.status(503).json({
        error: 'Host publishing is not configured yet. Set the host passcode on the server.',
      });
    }

    const providedBytes = Buffer.from(String(hostPasscode ?? ''));
    const configuredBytes = Buffer.from(configuredPasscode);
    const matches = providedBytes.length === configuredBytes.length &&
      timingSafeEqual(providedBytes, configuredBytes);
    if (!matches) {
      return response.status(401).json({ error: 'That host passcode is not correct.' });
    }
  }

  try {
    const identity = isHost ? role : `viewer-${randomUUID()}`;
    const participantName = role === 'host-1'
      ? 'Sarah Live'
      : role === 'host-2'
        ? 'DJ Eagle'
        : 'Viewer';
    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      name: participantName,
      ttl: '10m',
    });

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canSubscribe: true,
      canPublish: isHost,
      ...(isHost ? { canPublishSources: ['camera', 'microphone'] } : {}),
    });

    response.set('Cache-Control', 'no-store');
    return response.status(201).json({
      server_url: serverUrl,
      participant_token: await token.toJwt(),
    });
  } catch (error) {
    console.error('LiveKit token generation failed:', error.message);
    return response.status(500).json({ error: 'Could not create a live room token.' });
  }
});

if (existsSync(distDirectory)) {
  app.use(express.static(distDirectory));
  app.use((request, response, next) => {
    if (request.method === 'GET' && !request.path.startsWith('/api/')) {
      return response.sendFile(path.join(distDirectory, 'index.html'));
    }
    return next();
  });
}

app.use((request, response) => {
  response.status(404).json({ error: 'Not found.' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Eagle Live API listening on port ${port}`);
});
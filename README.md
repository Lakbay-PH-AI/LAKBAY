# Lakbay AI Philippines

Premium AI-powered travel planning and travel research for trips around the Philippines. The app includes a production-style React/Vite frontend, a Node.js static/API server, environment configuration, database schema, GitHub CI, and Hostinger-ready deployment notes.

## Features

- AI planner workspace with prompt builder, protected generate/run actions, provider compare readiness, and reusable prompt output.
- Modules for hotels, accommodations, transport, tickets, activities, discounts, promo opportunities, Klook exploration, saved trips, settings, integrations, profile, and admin controls.
- Sign-in gate behavior for AI search, prompt generation, saved trips, provider tools, exports, and personalized workspace features.
- Recommendation cards with visible URLs, external link behavior, copy URL, save action, source labels, and verification statuses.
- AI provider management surface for ChatGPT, Claude, Gemini, Grok, OpenRouter, and custom providers.
- Webhook settings for trip, AI response, export, deal, provider failure, and settings events.
- Dark/light themes and adjustable glass intensity.
- Node.js hosting entrypoint with API health, auth/session, trips, AI-run queue, and webhook-test endpoints.
- SQL schema for users, sessions, trips, saved links, providers, webhook endpoints, and webhook logs.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production Build

```bash
npm run build
npm start
```

The Node server serves `dist` and API routes on `PORT` or `3000`.

## Hostinger Node.js Hosting

1. Push the repository to GitHub.
2. In Hostinger, create a Node.js app using Node `20.19+` or `22`.
3. Set the startup file to `server.js`.
4. Set the build command to `npm ci && npm run build`.
5. Set the start command to `npm start`.
6. Add environment variables from `.env.example`.
7. Configure `DATABASE_URL` if using managed Postgres. Without it, the demo server uses `data/runtime/*.json` as a local development fallback.

## Database

Apply `db/schema.sql` to your managed Postgres database:

```bash
npm run db:schema
```

Provider API keys and webhook signing secrets belong on the server only. Do not place live secrets in frontend code.

## GitHub Ready

The workflow in `.github/workflows/ci.yml` runs:

```bash
npm ci
npm run lint
npm run build
```

## API Routes

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `GET /api/trips`
- `POST /api/trips`
- `POST /api/ai/run`
- `POST /api/webhooks/test`

Protected routes require `Authorization: Bearer <token>`.

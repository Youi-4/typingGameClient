# Typing Game Client

React frontend for the multiplayer typing game. It includes authentication flows, room creation and joining, live race updates, stats, and leaderboard views.

## Stack

- React
- TypeScript
- Vite
- React Query
- Socket.IO client

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `VITE_API_URL` and `VITE_SOCKET_URL` for your backend.
4. Start the app with `npm run dev`.

## Scripts

- `npm run dev` starts the Vite dev server.
- `npm run build` creates a production build.
- `npm run test:e2e` runs the Playwright end-to-end suite.

## Notes

- Keep real API URLs, tokens, and secrets out of commits, docs, and screenshots.
- The backend project lives separately and must be running for local multiplayer.

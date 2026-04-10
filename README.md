# Typing Game Client

React frontend for a real-time multiplayer typing race game. Players join public or private rooms, race to type a paragraph, and see live WPM stats, rankings, and a leaderboard.

**Live site:** https://typecrisp.vercel.app/

## Stack

- **React 19 + TypeScript** — UI and type safety
- **Vite** — dev server and production builds (with React Compiler via Babel plugin)
- **Socket.IO client** — real-time race state (player progress, room lifecycle)
- **React Query (TanStack Query)** — server state for profiles, stats, and leaderboard
- **Axios** — REST calls through a shared `apiClient` instance
- **Formik** — form handling for sign-up / login
- **Framer Motion + Lottie** — animations
- **Playwright** — end-to-end tests
- **Vercel** — deployment, with rewrites proxying `/api` to the Railway-hosted backend

## Architecture Decisions

### Context-based state over a global store

The app uses four React contexts instead of Redux or Zustand:

| Context | Purpose |
|---|---|
| `AuthProvider` | JWT auth state, login/logout mutations, Google OAuth token handling, automatic token refresh (6-day interval against a 7-day expiry) |
| `UserProfileProvider` | Fetches and caches the user profile via React Query; exposes a mutation for profile updates |
| `SharedSpaceProvider` | Owns the Socket.IO connection, room join/leave lifecycle, and the shared message stream that drives the race UI |
| `ThemeProvider` | Dark/light theme toggle |

This keeps each concern isolated with its own provider and avoids pulling in an external state library for what is essentially four independent slices.

### Feature-based file structure for the game

The typing game logic lives under `src/features/typing-game/` and is split into composable pieces:

- **`useTypingRace`** — core typing loop: keystroke handling, WPM calculation, mistake tracking, completion detection. Broadcasts snapshots to other players every 100 ms via Socket.IO.
- **`useRoomLifecycle`** — countdown/waiting state machine, input enable/disable, room leave scheduling on unmount.
- **`RaceTrack`** — renders each player's progress bar and rank badge.
- **`ResultsPanel`** — post-race stats, WPM graph, and play-again action.
- **`CountdownBanner`** — animated countdown overlay.

The top-level `TypingGame.tsx` composes these hooks and components, handling stat submission and rank assignment.

### Dual auth: registered users and guests

`SharedSpaceProvider` fetches either a socket token (authenticated) or a guest token before connecting. Guests can play but their stats are not persisted. This lets anyone try the game without signing up while still tracking progress for registered users.

### REST + WebSocket split

- **REST** (`apiClient` + Axios) handles auth, profiles, stats, leaderboard, and room creation.
- **WebSocket** (Socket.IO) handles everything that needs to be real-time: joining rooms, broadcasting typing progress, room status transitions, and player leave/join events.

Room creation is a REST call that returns a `roomId`; the client then joins that room over the socket. This keeps the HTTP API stateless and lets the socket layer focus on ephemeral, per-room state.

### Public vs. private game modes

Public games use the `/public_game` namespace and server-managed matchmaking (no room size). Private games use `/private_game` with a player-chosen room size (1–5). The namespace is set before connecting so the server routes each socket to the right lobby logic.

### Router with keyed remount

`Router.tsx` wraps `TypingGame` in a `TypingGameKeyed` component that keys on `roomId`. This forces a full remount when navigating between rooms, guaranteeing all game state resets cleanly without manual cleanup.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `VITE_API_URL` and `VITE_SOCKET_URL` for your backend.
4. Start the app with `npm run dev`.

## Scripts

- `npm run dev` — start the Vite dev server.
- `npm run build` — type-check and create a production build.
- `npm run test:e2e` — run the Playwright end-to-end suite.

## Notes

- Keep real API URLs, tokens, and secrets out of commits, docs, and screenshots.
- The backend project lives separately and must be running for local multiplayer.

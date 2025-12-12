# RIT Google Sign-In Demo (Vite + React + Node/Express)

This project demonstrates Google Sign-In gated to RIT email domains (only `@rit.edu` and `@g.rit.edu` are allowed) using:
- Frontend: Vite + React + React Router
- Backend: Node + Express + google-auth-library

The frontend obtains a Google ID token (via Google Identity Services) and posts it to the backend. The backend verifies the token, checks the email domain, and responds accordingly. [link to Google Cloud Auth]([https://console.cloud.google.com/auth/clients?authuser=1&project=lfg-auth-code&supportedpurview=project)

## Project Structure

- client/
  - pages/
    - LoginPage.tsx – Manual login page with a Google button.
    - GoogleAuthPage.tsx – Automatic sign-in prompt page.
    - PortalPage.tsx – Post-login example page.
  - src/
    - App.tsx – Routes.
  - index.html – Includes Google Identity Services script.
- server/
  - src/server.ts – API with `/google-login` and `/create-account`.

## Prerequisites

- Node.js 18+
- A Google Cloud OAuth 2.0 Client ID of type “Web application”
  - APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application
  - Authorized JavaScript origins:
    - http://localhost:5173
  - Copy the client ID

## Environment Variables

Create `.env` files from the provided examples.

client/.env

- VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
- VITE_API_BASE=http://localhost:4000

server/.env

- GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID (must match the frontend client ID)
- CLIENT_URL=http://localhost:5173
- PORT=4000
- JWT_SECRET=some-long-random-string (optional, if you add session/JWT)

Example:

client/.env

VITE_GOOGLE_CLIENT_ID=773077641600-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
VITE_API_BASE=http://localhost:4000

server/.env

GOOGLE_CLIENT_ID=773077641600-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
CLIENT_URL=http://localhost:5173
PORT=4000

## Install & Run

In two terminals:

Terminal A – backend

- cd server
- npm install
- npm run dev

Terminal B – frontend

- cd client
- npm install
- npm run dev

Open http://localhost:5173

## Usage

There are two login entry points:

1) Manual button: http://localhost:5173/
   - Shows a Google Sign-In button.
   - On success, posts the ID token to the backend and navigates to the portal.

2) Automatic sign-in prompt: http://localhost:5173/auth/google
   - Automatically prompts the account chooser on page load.
   - Falls back to rendering a Google button if the prompt is blocked.

After a successful sign-in with a permitted domain, you are navigated to /portal with your Google email.

## Backend API

POST /google-login

- Body: { "credential": "<ID_TOKEN_FROM_GSI>" }
- Verifies the token with `google-auth-library` against `GOOGLE_CLIENT_ID`.
- Enforces allowed email domains: only `@rit.edu` or `@g.rit.edu`.
- Responses:
  - 200: { email }
  - 400: missing credential or token invalid/audience mismatch
  - 403: email domain not allowed

POST /create-account

- Body: { googleEmail, username, password }
- Demo-only endpoint to persist a local account in users.json.

## Troubleshooting

invalid_client / no registered origin

- Your Google OAuth client must be type “Web application”.
- Add http://localhost:5173 to Authorized JavaScript origins.
- Ensure the frontend and backend use the SAME client ID.
- Restart both servers after updating .env.

Always getting 400 “Google authentication failed”

- Usually indicates audience/client ID mismatch or missing credential.
- Check client/.env and server/.env use the same Web OAuth client ID.
- Confirm the frontend is using VITE_API_BASE=http://localhost:4000 and sends POST with JSON body.
- Watch server logs (server/src/server.ts logs):
  - Missing credential → frontend isn’t posting the token.
  - verifyIdToken error with audience ��� client ID mismatch.

403 “Only @rit.edu or @g.rit.edu emails are allowed”

- The Google account’s primary email in the token does not end with `@rit.edu` or `@g.rit.edu`.
- Switch to the correct RIT Google account. The automatic page disables auto-select and shows an account chooser.

Prompt not showing or wrong account auto-selected

- The auto-auth page calls `google.accounts.id.disableAutoSelect()` and sets `auto_select: false`.
- If prompt is blocked, the page renders a Google Sign-In button as fallback.

## Security Notes

- Domain filtering on the frontend is only for UX; the backend enforces it.
- Always serve over HTTPS in production and use HttpOnly/Secure cookies or JWTs for sessions.

## License

MIT
# RE:LIFE

RE:LIFE helps people choose a safe next step for an old or damaged electronic device. This repository contains a React/Vite frontend and an Express/MongoDB API.

## Project layout

- `frontend/` — React application, Vite development server, and API client.
- `backend/` — Express API, MongoDB models, assessment services, and API tests.

## Run locally

Requirements: Node.js 18 or newer, npm, and a reachable MongoDB instance.

1. Configure the backend environment. Copy `backend/.env.example` to `backend/.env`, then set `MONGO_URI` and a private `JWT_SECRET`. Keep backend secrets in `backend/.env`; never put them in frontend variables.
2. In a terminal, install and run the API:

   ```powershell
   cd backend
   npm ci
   npm run dev
   ```

3. In another terminal, configure and run the client:

   ```powershell
   cd frontend
   Copy-Item .env.example .env
   npm ci
   npm run dev
   ```

   The client uses `VITE_API_BASE_URL=http://localhost:5000/api` by default. Set the API's `CLIENT_URL` to the frontend origin if you use a different port or host.

4. Open the URL printed by Vite (normally `http://localhost:5173`). Check the API at `http://localhost:5000/api/health`.

The frontend creates a guest session, registers a device, requests an assessment, saves the selected pathway and safety checklist, and requests a server-issued certificate. The certificate lookup is public. `frontend/src/services/api.js` is the single frontend API client.

## Useful checks

```powershell
cd backend
npm test
```

```powershell
cd frontend
npm run lint
npm run build
```

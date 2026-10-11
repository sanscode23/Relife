# RE:LIFE frontend

React + Vite client for the RE:LIFE API in `../backend`.

## Run locally

1. Install dependencies:

   ```powershell
   cd frontend
   npm ci
   ```

2. Create `frontend/.env` (optional when using the local API default):

   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

   This variable is a public API URL, not a secret. Never add JWT secrets, database
   URIs, AWS credentials, or other server credentials to frontend environment
   variables.

3. Configure the backend's required private settings in `backend/.env` using
   `backend/.env.example`, and make the configured MongoDB database available.
   Start the backend in one terminal:

   ```powershell
   cd backend
   npm install
   npm run dev
   ```

4. Start the frontend in another terminal:

   ```powershell
   cd frontend
   npm run dev
   ```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

## Application flows

- An assessment creates a guest session when needed, registers a device, then
  calls `POST /api/devices/:id/assessment`.
- Recommendation pathways are saved with `POST /api/devices/:id/path`.
- For the `SELL_OR_DONATE` pathway, the five safety checks are persisted through
  the backend. A server-issued verification certificate is available after all
  five checks are complete.
- Certificate IDs are checked through the public
  `GET /api/certificates/:verificationId` endpoint. The QR code links to the
  frontend's `/verify/:verificationId` route.
- The RE Help chatbot is a local, rule-based guide. The backend has no chatbot
  endpoint; it does not call an AI service.

## Checks

```powershell
npm run lint
npm run build
```

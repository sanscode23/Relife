# Frontend Integration Guide for RE:LIFE

## Environment Configuration

Copy the three service files from `/server/frontend-integration/` directly into your React client codebase (`/client/src/services/`):
- `deviceService.js`
- `recommendationService.js`
- `certificateService.js`

### Client Environment Variable

In your `/client/.env` file, set the ONLY variable required by the frontend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> [!IMPORTANT]
> **No secret keys** (AWS credentials, JWT secrets, database URIs) should ever be present in the frontend client. The frontend communicates strictly via the REST API endpoints under `/api`.

### Authentication Token Handling

The services automatically store and read the JWT bearer token in `localStorage` under the key:
```javascript
"relife_token"
```

All API requests unwrap the standardized backend envelope:
`{ "success": true, "data": { ... } }` and return the inner `data` object directly or throw readable JavaScript errors on HTTP failures.

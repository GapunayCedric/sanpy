# SA Tourism – Deployment Suggestions

## Environment

- **Backend:** Node 18+, MySQL 8+
- **Frontend:** Static build (Vite); serve via Nginx or same host.

## Backend

1. Set production env vars (see `backend/.env.example`):
   - `NODE_ENV=production`
   - `DB_*` for MySQL
   - Strong `JWT_SECRET`
   - `FRONTEND_URL` for CORS (e.g. `https://tourism.sanpablo.gov.ph`)
   - Optional: adjust `RATE_LIMIT_*`, `UPLOAD_DIR`, `MAX_FILE_SIZE_MB`

2. Build and run:
   ```bash
   cd backend && npm ci && npm run build && npm start
   ```

3. Process manager: use **PM2** or systemd:
   ```bash
   pm2 start dist/index.js --name sanpy-api
   ```

4. Reverse proxy (Nginx): proxy `/api` and `/uploads` to the Node server (e.g. port 5000).

## Frontend

1. Set `VITE_API_BASE` if API is on a different origin (e.g. `https://api.tourism.sanpablo.gov.ph`). Update `frontend/src/api/client.ts` to use it for production.

2. Build:
   ```bash
   cd frontend && npm ci && npm run build
   ```

3. Serve `frontend/dist` with Nginx (or any static host). Single-page app: point all routes to `index.html`.

## Database

1. Create DB: `CREATE DATABASE sanpy_tourism;`
2. Run schema: `mysql -u user -p sanpy_tourism < database/schema.sql`
3. Create at least one admin user (insert into `users` with role `admin`, status `approved`, and bcrypt password hash).

## Security checklist

- [ ] Strong `JWT_SECRET` and no default secrets in production
- [ ] HTTPS only
- [ ] CORS restricted to frontend origin
- [ ] Rate limiting enabled
- [ ] File upload: validate MIME and size; store outside web root or serve via controlled route
- [ ] DB user with minimal required privileges

## Optional

- **Backup:** Regular MySQL dumps and backup of `backend/uploads`.
- **Monitoring:** Logging + health check on `GET /health`.
- **Email:** Implement actual email in forgot-password and (optional) registration approval notifications.

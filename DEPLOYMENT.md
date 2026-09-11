# TrueHost Deployment Guide — Prime Realty Kenya

This is a **PHP + MySQL + React** app. It is fully compatible with TrueHost shared hosting. No Node.js runtime is required on the server — only PHP 8.0+ and MySQL.

## 1. Build the frontend for TrueHost

On your local machine:

```bash
cd frontend
npm install
npm run build:truehost
```

> **Why `build:truehost`?**
> This command configures Vite to build with root base (`--base=/`), generating a `dist/.htaccess` with root-relative asset URLs (`/assets/...`) and no subdirectory-specific `RewriteBase`, so it works at the domain root.
> If building for local XAMPP testing, simply run `npm run build`.
> **Do NOT** upload a build made with plain `npm run build` (which defaults to `base: '/homes/'`). Its HTML references `/homes/assets/*` and will 404 at `https://yourdomain.com/assets/*` — this was the Sep-2026 asset outage.

This produces the production-ready static bundle in `dist/`.

## 2. Upload files to TrueHost

Typical TrueHost structure (cPanel File Manager or FTP):

```
public_html/
├── assets/                    <-- from dist/assets/
├── .htaccess                  <-- from dist/.htaccess
├── index.html                 <-- from dist/index.html
├── favicon.svg / icons        <-- from dist/
├── manifest.webmanifest       <-- from dist/
├── sw.js                      <-- from dist/
├── backend/                   <-- entire backend folder
│   ├── api/
│   ├── config/
│   ├── includes/
│   ├── database/
│   ├── uploads/               <-- must be writable (755)
│   ├── logs/                  <-- must be writable (755)
│   ├── .htaccess
│   ├── index.php
│   └── .env
```
> Delete any leftover `public_html/homes/` folder from earlier attempts. A stale `homes/index.html` there serves HTML that references `/homes/assets/*`, which 404s because the assets live at the root (`/assets/*`).

### Important: protect `backend/`
The included `backend/.htaccess` already blocks direct access to `.env`, `*.sql`, `logs/`, `config/`, `includes/`, `database/` and `uploads/documents/private/` — keep it in place. Private property documents are only served through the authenticated endpoint `GET /api/admin/documents/serve/{id}`.

The backend resolves its own base path at runtime, so it automatically works at `/backend/` on TrueHost or `/homes/backend/` on XAMPP.

### Admin panel
- Admin dashboard: `https://yourdomain.com/admin`
- The vertical admin menu can be hidden/shown with the hamburger button in the admin top bar; on mobile it slides in as a drawer.
- Admin notifications page: `/admin/notifications` (linked from the bell icon).

## 3. Create the database in TrueHost cPanel

1. In TrueHost cPanel → **MySQL Databases**:
   - Create a new database (e.g. `cpaneluser_homes`).
   - Create a new MySQL user (e.g. `cpaneluser_homesuser`) with a strong password.
   - Add the user to the database and check **ALL PRIVILEGES**.
2. Open **phpMyAdmin** from cPanel:
   - Click on your newly created database in the left sidebar.
   - Click **Import** tab.
   - Select `backend/database/production_complete.sql` (or `production_complete.sql` from root) and click **Import / Go**.
   - This single file sets up the complete schema and all live data (properties, plots, agents, admin users, permissions, and settings) in one step.

## 4. Configure `backend/.env`

Create or edit `backend/.env` on the TrueHost server:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cpaneluser_homes
DB_USER=cpaneluser_homesuser
DB_PASSWORD=your_database_password_here

BASE_URL=https://yourdomain.com/backend
FRONTEND_URL=https://yourdomain.com
SESSION_SECURE=true
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

JWT_SECRET=<paste a 48-char random string from: openssl rand -base64 48>
```

> `SESSION_SECURE=true` is **required** when using HTTPS, otherwise login cookies are rejected.

> ⚠️ **Never rely on the fallback credentials** hard-coded at the bottom of `backend/config/config.php` (they exist only so the app can boot without `.env`). Always upload a real `backend/.env` to the server — `.env` is gitignored, so it is never included in a git-based deploy and must be created in cPanel File Manager. If this repository was ever public, rotate the cPanel database password and remove the baked fallback.

## 5. File permissions

In cPanel File Manager:
- Ensure `backend/uploads` has permission `755`.
- Ensure `backend/logs` has permission `755`.
- All PHP and static files should be `644`.

```bash
chmod 755 backend/uploads
chmod 755 backend/logs
```

## 7. Default admin login (after seed.sql)

```
Email:    admin@realestate.co.ke
Password: Admin@123
```

**Change this immediately** from `/admin → Users → Edit**.

## 8. SSL

Enable AutoSSL in cPanel. The `.htaccess` already redirects to HTTPS once you set `SESSION_SECURE=true`.

## 9. Email (SMTP)

Fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` in `.env` so password-reset and inquiry notifications work. TrueHost often blocks port 25 — use port `465` (SMTPS) or `587` (STARTTLS).

## 10. Troubleshooting

| Symptom | Fix |
|---|---|
| Admin link in footer does nothing | You are not logged in. Click "Login" first. |
| "CORS policy" errors | Update `ALLOWED_ORIGINS` in `backend/.env` to exactly match your frontend origin. |
| Login loop on HTTPS | Set `SESSION_SECURE=true` in `backend/.env`. |
| Images not loading | Check `VITE_UPLOAD_BASE` matches your domain (or omit it — auto-detected) and `backend/uploads` is readable. |
| 404 on every route | Confirm `dist/.htaccess` is present (regenerate with `npm run build`). |
| **JS/CSS return 404 while HTML loads** | A `/homes/`-base build was uploaded to the domain root, or a stale `public_html/homes/` folder exists. Rebuild with `npm run build:truehost`, upload `dist/` contents to `public_html/`, and delete `public_html/homes/`. |
| **"attribution-reporting" Permissions-Policy warning** | The deployed `dist/.htaccess` now sets `Permissions-Policy` without `attribution-reporting`. Ensure no parent (server) `.htaccess` still emits it. |
| **500 on data endpoints but `/auth/me` returns 401** | The DB layer fails while session auth (no DB) still works. DevTools → Network → failing request → **Response** tab: body `"Service temporarily unavailable"` (JSON) = DB connection failed → fix `backend/.env` on the server. Empty/HTML body = query-time fatal (e.g. schema not imported) → import `backend/database/production_complete.sql`. For a one-shot verdict upload `backend/db-check.php`, open `/backend/db-check.php?diag=1`, then **DELETE the file**. Exact errors are always in `backend/logs/php_errors.log`. |
| 403 on backend files like `/backend/config/...` | Expected — the hardened `.htaccess` blocks internal folders. |
| 500 on API call | Check `backend/logs/php_errors.log`. |

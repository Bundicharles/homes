# TrueHost Deployment Guide — Prime Realty Kenya

This is a **PHP + MySQL + React** app. It is fully compatible with TrueHost shared hosting. No Node.js runtime is required on the server — only PHP 8.0+ and MySQL.

## 1. Build the frontend

On your local machine:

```bash
cd frontend
npm install
npm run build
```

This produces the static bundle in `dist/`. The build step also writes `dist/.htaccess` for SPA routing.

## 2. Upload files to TrueHost

Typical TrueHost structure (cPanel File Manager or FTP):

```
public_html/
├── (contents of dist/)            <-- built React app
├── backend/                       <-- entire backend folder
│   ├── api/
│   ├── config/
│   ├── includes/
│   ├── database/
│   ├── uploads/                   <-- must be writable (755 or 775)
│   ├── logs/                      <-- must be writable
│   ├── .htaccess
│   ├── index.php
│   └── .env
```

### Important: protect `backend/`
TrueHost lets `public_html` be served directly. Place `backend/` *inside* `public_html` but block direct access to `config/`, `includes/`, `database/` by adding this to the root `.htaccess` (in `public_html/backend/`):

```apache
<FilesMatch "\.(env|sql|log)$">
  Order allow,deny
  Deny from all
</FilesMatch>
```

The `backend/.htaccess` already routes `/api/*` to `api/index.php`.

## 3. Create the database

1. In cPanel → MySQL Databases, create a database (e.g. `account_realestate`) and a user.
2. In phpMyAdmin, import:
   - `backend/database/schema.sql`
   - `backend/database/seed.sql` (optional — seeds demo data + admin user)
3. Note the **DB name**, **user**, and **password** for step 4.

## 4. Configure `backend/.env`

Edit `backend/.env` on the server:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=youraccount_realestate
DB_USER=youraccount_dbuser
DB_PASSWORD=********

BASE_URL=https://yourdomain.com/backend
FRONTEND_URL=https://yourdomain.com
SESSION_SECURE=true
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

JWT_SECRET=<paste a 48-char random string from: openssl rand -base64 48>
```

`SESSION_SECURE=true` is **required** when using HTTPS, otherwise sessions/cookies break.

## 5. Configure the frontend

The frontend reads `VITE_API_URL` at build time. Before running `npm run build`, create `frontend/.env.production`:

```env
VITE_API_URL=https://yourdomain.com/backend/api
VITE_UPLOAD_BASE=https://yourdomain.com
```

Then rebuild. Do **not** put secrets in the frontend `.env` — anything in `VITE_*` is shipped to the browser.

## 6. File permissions

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
| Images not loading | Check `VITE_UPLOAD_BASE` matches your domain and `backend/uploads` is readable. |
| 404 on every route | Confirm `dist/.htaccess` is present (regenerate with `npm run build`). |
| 500 on API call | Check `backend/logs/php_errors.log`. |

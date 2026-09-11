# Prime Realty Kenya — Complete Hosting & Deployment Guide

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Local Development Setup (XAMPP)](#2-local-development-setup-xampp)
3. [Production Deployment (Shared Hosting / TrueHost)](#3-production-deployment-shared-hosting--truehost)
4. [Environment Configuration](#4-environment-configuration)
5. [Database Setup](#5-database-setup)
6. [Frontend Build & Deployment](#6-frontend-build--deployment)
7. [File Permissions](#7-file-permissions)
8. [SSL & HTTPS](#8-ssl--https)
9. [Email (SMTP)](#9-email-smtp)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

### For Local Development (XAMPP)
- **Windows OS** (Windows 10/11)
- **XAMPP** 8.2+ (Apache 2.4.58+ + PHP 8.2+ + MySQL 8+/MariaDB 10.4+)
- **Node.js** 18+ and npm
- **Git** (optional, for cloning)

### For Production (TrueHost/Shared Hosting)
- **cPanel** access with:
  - PHP 8.2+ (with PDO MySQL, GD, mbstring, OpenSSL extensions)
  - MySQL 8+ / MariaDB 10.4+
  - FTP/File Manager access
  - phpMyAdmin access
  - AutoSSL/Let's Encrypt support (recommended)
- Local machine with Node.js 18+ (for building the frontend)
- No Node.js required on the production server itself — only PHP

---

## 2. Local Development Setup (XAMPP)

### Step 1: Place the project in XAMPP
```cmd
# Copy the project to the XAMPP web root
C:\xampp\htdocs\homes\
```

### Step 2: Start XAMPP services
1. Open **XAMPP Control Panel**
2. Start **Apache** and **MySQL** modules
3. Verify: open `http://localhost/` — you should see the XAMPP welcome page

### Step 3: Create the database
1. Open **phpMyAdmin**: `http://localhost/phpmyadmin`
2. Click **Databases** tab
3. Database name: `real_estate_platform`
4. Collation: `utf8mb4_unicode_520_ci`
5. Click **Create**
6. Select the new database
7. Click **Import** tab
8. Choose `backend/database/schema.sql` → Click **Go**
9. Choose `backend/database/seed.sql` → Click **Go**

**Or via command line:**
```cmd
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS real_estate_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci"
& "C:\xampp\mysql\bin\mysql.exe" -u root real_estate_platform < backend/database/schema.sql
& "C:\xampp\mysql\bin\mysql.exe" -u root real_estate_platform < backend/database/seed.sql
```

### Step 4: Configure the backend `.env`
Create `backend/.env` (copy from `.env.example` or use existing):
```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=real_estate_platform
DB_USER=root
DB_PASSWORD=

# Application Configuration
BASE_URL=http://localhost/homes/backend
FRONTEND_URL=http://localhost
SESSION_NAME=real_estate_session
SESSION_LIFETIME=1440
SESSION_SECURE=false
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost,http://127.0.0.1:5173,http://127.0.0.1

# JWT Configuration (fallback only — sessions are primary auth)
JWT_SECRET=your-super-secret-key-change-in-production

# Upload Configuration (10GB max)
UPLOAD_MAX_SIZE=10240
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif,webp,avif,svg,pdf,doc,docx,xls,xlsx,txt,mp4,webm,mov,avi,mkv,mp3,wav

# SMTP Configuration (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_ENCRYPTION=tls
SMTP_FROM_NAME=Prime Realty Kenya
SMTP_FROM_EMAIL=info@realestate.co.ke

# Google Maps API (optional)
GOOGLE_MAPS_API_KEY=
```

### Step 5: Install frontend dependencies
```cmd
cd frontend
npm install
```

### Step 6: Choose your workflow

**Option A — Development (hot reload)**
```cmd
cd frontend
npm run dev
```
- Frontend: `http://localhost:5173`
- Vite dev server proxies `/api` → `http://localhost/homes/backend/api`
- All API calls work automatically

**Option B — Production build (served by Apache)**
```cmd
cd frontend
npx vite build
```
- Output goes to `backend/../dist/` (the root `dist/` folder)
- Copy dist contents to `C:\xampp\htdocs\` (web root):
  ```cmd
  xcopy /E /I /Y dist\* C:\xampp\htdocs\
  ```
- Frontend: `http://localhost/`
- Backend API: `http://localhost/homes/backend/api/`

### Step 7: Verify
- **Frontend**: `http://localhost/` (returns 200)
- **API**: `http://localhost/homes/backend/api/properties` (returns JSON)
- **Admin**: `http://localhost/admin`
- **Default admin login**: `admin@realestate.co.ke` / `Admin@123`

---

## 3. Production Deployment (Shared Hosting / TrueHost)

### Step 1: Build the frontend on your local machine
```cmd
cd frontend
npm install
npm run build:truehost    # Base: / (root-relative, no RewriteBase needed)
```

This produces the production-ready static bundle in `dist/` (relative to project root).

> **Why `build:truehost`?** This command configures Vite to build with root base (`--base=/`), generating a `dist/.htaccess` with root-relative asset URLs (`/assets/...`) and no subdirectory-specific `RewriteBase`, so it works at the domain root.

For local XAMPP builds: `npm run build` (base: `/homes/`, asset URLs prefixed with `/homes/`).

### Important: Deploy root entry files

The root `.htaccess` and `index.php` are **custom server-level files** that contain security rules, MIME-type configuration, and SPA fallback logic. They are **not** generated by Vite. Always upload them alongside your build:

```
public_html/
├── .htaccess      ← Root custom .htaccess (NOT dist/.htaccess)
├── index.php      ← Root entry point (handles SPA fallback safely)
├── dist/.htaccess ← Vite-generated (use only if root .htaccess is unavailable)
```

If deploying from `dist/` only, ensure the Vite-generated `.htaccess` is also uploaded.

### Step 2: Upload files via FTP/cPanel File Manager

**Typical TrueHost structure:**
```
public_html/                    ← Web root
├── index.html                  ← From dist/
├── .htaccess                   ← From dist/
├── assets/                     ← From dist/assets/
├── favicon.svg                 ← From dist/
├── favicon-16x16.png           ← From dist/
├── apple-touch-icon.png        ← From dist/
├── manifest.webmanifest        ← From dist/
├── sw.js                       ← From dist/
├── offline.html                ← From dist/
├── pwa-*.png                   ← From dist/
├── backend/                    ← Entire backend folder
│   ├── api/
│   ├── config/
│   ├── includes/
│   ├── database/
│   ├── uploads/                ← Must be writable (755)
│   ├── logs/                   ← Must be writable (755)
│   ├── .htaccess
│   ├── index.php
│   └── .env                    ← Production environment config
└── (other frontend pages if not using SPA fallback)
```

### Step 3: Create the database in TrueHost cPanel
1. In **cPanel → MySQL Databases**:
   - Create database: `cpaneluser_homes` (or any name)
   - Create MySQL user with a strong password
   - Add user to database → **ALL PRIVILEGES**
2. Open **phpMyAdmin** from cPanel:
   - Click your database in the left sidebar
   - Click **Import** tab → Select `backend/database/schema.sql` → **Go**
   - Click **Import** tab → Select `backend/database/seed.sql` → **Go**

### Step 4: Configure `backend/.env` for production
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cpaneluser_homes
DB_USER=cpaneluser_homesuser
DB_PASSWORD=your_database_password_here

# IMPORTANT: Update these for your domain
BASE_URL=https://yourdomain.com/backend
FRONTEND_URL=https://yourdomain.com
SESSION_NAME=real_estate_session
SESSION_LIFETIME=1440
SESSION_SECURE=true              # REQUIRED for HTTPS — login cookies rejected otherwise

# Update ALLOWED_ORIGINS to match your domain exactly (no trailing slashes)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Generate with: openssl rand -base64 48
JWT_SECRET=<48-char random string>

# Upload Configuration
UPLOAD_MAX_SIZE=10240
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif,webp,avif,svg,pdf,doc,docx,xls,xlsx,txt,mp4,webm,mov,avi,mkv,mp3,wav

# SMTP Configuration
SMTP_HOST=smtp.yourhost.com      # TrueHost often blocks port 25 — use 465 or 587
SMTP_PORT=465                    # 465 (SMTPS) or 587 (STARTTLS)
SMTP_USERNAME=your@email.com
SMTP_PASSWORD=your_email_password
SMTP_ENCRYPTION=tls
SMTP_FROM_NAME=Prime Realty Kenya
SMTP_FROM_EMAIL=info@yourdomain.com

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Step 5: Set file permissions
In cPanel File Manager:
- `backend/uploads` → **755**
- `backend/logs` → **755**
- All PHP and static files → **644**

```bash
chmod 755 backend/uploads
chmod 755 backend/logs
chmod 644 backend/*.php
chmod 644 backend/api/*.php
```

### Step 6: Enable SSL
1. In cPanel → **SSL/TLS Status** → Enable AutoSSL
2. The `.htaccess` already redirects to HTTPS once `SESSION_SECURE=true` is set

### Step 7: Update DNS
Point your domain's A record to your TrueHost server IP address.

---

## 4. Environment Configuration Reference

### Backend `.env` Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `DB_HOST` | Yes | MySQL host | `127.0.0.1` |
| `DB_PORT` | Yes | MySQL port | `3306` |
| `DB_NAME` | Yes | Database name | `real_estate_platform` |
| `DB_USER` | Yes | Database user | `root` |
| `DB_PASSWORD` | Yes | Database password | *(empty)* |
| `BASE_URL` | Yes | Backend base URL | `http://localhost/homes/backend` |
| `FRONTEND_URL` | Yes | Frontend URL (for verification emails) | `http://localhost:5173` |
| `SESSION_NAME` | No | PHP session name | `real_estate_session` |
| `SESSION_LIFETIME` | No | Session lifetime (seconds) | `1440` |
| `SESSION_SECURE` | **Prod: Yes** | Secure-only cookies (HTTPS) | `false` |
| `ALLOWED_ORIGINS` | Yes | CORS allowed origins (comma-separated) | `http://localhost:5173,http://localhost:3000` |
| `JWT_SECRET` | Yes | JWT signing secret | *(generated random)* |
| `JWT_ALGORITHM` | No | JWT algorithm | `HS256` |
| `JWT_EXPIRY` | No | JWT expiry | `7d` |
| `UPLOAD_MAX_SIZE` | No | Max upload size (MB) | `10240` (10GB) |
| `UPLOAD_ALLOWED_TYPES` | No | Allowed upload types | *(21 types)* |
| `SMTP_HOST` | No | SMTP server | *(empty)* |
| `SMTP_PORT` | No | SMTP port | `587` |
| `SMTP_USERNAME` | No | SMTP username | *(empty)* |
| `SMTP_PASSWORD` | No | SMTP password | *(empty)* |
| `SMTP_ENCRYPTION` | No | Encryption type | `tls` |
| `SMTP_FROM_NAME` | No | From name | `Prime Realty Kenya` |
| `SMTP_FROM_EMAIL` | No | From email | `info@realestate.co.ke` |
| `GOOGLE_MAPS_API_KEY` | No | Google Maps API key | *(empty)* |

### Frontend `.env.production` Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API base URL (e.g., `https://yourdomain.com/backend/api`) |
| `VITE_UPLOAD_BASE` | Upload base URL (e.g., `https://yourdomain.com/backend`) |

### Frontend `.env` (Local Dev) Variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `/homes/backend/api` |
| `VITE_UPLOAD_BASE` | `/homes/backend` |

---

## 5. Database Setup

### Schema Import (22 tables)
The `backend/database/schema.sql` file creates all tables. Key tables:

1. **Roles**: 7 roles (Super Admin → Customer)
2. **Permissions**: 49 permissions across 8 groups
3. **role_permissions**: Many-to-many role ↔ permission
4. **user_roles**: Secondary role assignments
5. **users**: User accounts (Argon2id passwords)
6. **properties**: Core property listings
7. **property_types**: 10 property types (Apartment, Villa, etc.)
8. **property_images**: Multiple images per property
9. **features**: 25 property features (pool, garden, etc.)
10. **property_features**: Many-to-many property ↔ feature
11. **property_documents**: Protected documents (deeds, titles, etc.)
12. **property_verifications**: Verification workflow
13. **agents**: Real estate agents
14. **property_agents**: Many-to-many property ↔ agent
15. **earb_info**: Estate Agents Registration Board info
16. **favorites**: User ↔ property favorites
17. **interested_properties**: User ↔ property interest tracking
18. **inquiries**: Contact form submissions
19. **inquiry_messages**: Threaded inquiry messages
20. **viewing_requests**: Property viewing scheduling
21. **notifications**: User notifications
22. **promotions**: Marketing promotions
23. **settings**: 40+ key-value site settings
24. **social_links**: Social media links
25. **testimonials**: Customer testimonials
26. **faqs**: FAQ entries
27. **pages**: CMS pages
28. **page_sections**: Page builder sections
29. **menus**: Navigation menus
30. **menu_items**: Menu items
31. **media**: Media library
32. **seo_metadata**: SEO metadata
33. **property_views**: View analytics
34. **audit_logs**: Admin action logs
35. **contact_submissions**: Legacy contact form

### Seed Data Import
The `backend/database/seed.sql` file populates:
- 7 roles with hierarchical permissions
- 49 permissions with descriptions
- Role-permission matrix (Super Admin: all 49, Administrator: 47, etc.)
- Default admin user: `admin@realestate.co.ke` / password hash for `Admin@123`
- 10 property types, 25 features, 4 agents, 7 EARB info fields
- 44 general settings + 7 security settings
- 8 social links, 4 testimonials, 8 FAQs
- 8 system pages, 3 menus, 18 menu items
- 5 sample properties with images, features, agents, documents
- 5 verification records, 4 promotions
- 4 demo customer users
- 8 favorites, 4 interested properties
- 3 inquiries with 5 messages
- 3 viewing requests, 8 property views
- 4 SEO metadata records, 6 audit logs, 5 notifications

### Default Admin Credentials
After seeding:
- **Email**: `admin@realestate.co.ke`
- **Password**: `Admin@123` (DEPLOYMENT.md) or `password` (README.md)

**Change this immediately** from `/admin → Users → Edit`.

---

## 6. Frontend Build & Deployment

### Build Commands

| Environment | Command | Base URL | Output |
|-------------|---------|----------|--------|
| Local XAMPP (subfolder) | `npm run build:local` | `/homes/dist/` | `dist/` |
| Local XAMPP (web root) | `npm run build` | `/` | `dist/` |
| TrueHost/Shared hosting | `npm run build:truehost` | `/` | `dist/` |
| Development | `npm run dev` | (dev server) | (hot reload at `:5173`) |

### Vite Configuration Details
- **Port**: 5173 (dev only)
- **Output**: `../dist/` (relative to `frontend/`)
- **Manual chunking**: vendor (React), icons (Lucide), query (TanStack), axios, form (react-hook-form)
- **Aliases**: `@`, `@/components`, `@/pages`, `@/admin`, `@/services`, `@/hooks`, `@/context`, `@/utils`, `@/layouts`

### SPA Fallback Routing
The built `.htaccess` ensures SPA routing works:
```apache
RewriteEngine On

# Do not rewrite existing files, directories, or backend routes
RewriteRule ^backend(/.*)?$ - [L]
RewriteRule ^dist(/.*)?$ - [L]

# Return 404 for missing static assets
RewriteCond %{REQUEST_URI} \.(?:js|mjs|css|json|webmanifest|svg|png|jpg|jpeg|webp|avif|ico|woff|woff2|ttf|eot|map|txt|xml)$ [NC]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ - [R=404,L]

# Serve existing files and directories directly
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# SPA fallback for client-side routes
RewriteRule ^ index.html [L]
```
Static assets that exist are served directly with correct MIME types. Missing static assets return a proper 404 (not the SPA `index.html`), preventing MIME-type errors. All other routes fall back to `index.html` for React Router.

### PWA Support
The build includes:
- `manifest.webmanifest` — PWA manifest
- `sw.js` — Service worker with caching strategies
- `offline.html` — Offline fallback page
- Icons at 16x16, 32x32, 180x180, 192x192, 512x512, maskable 512x512

---

## 7. File Permissions

### Production (TrueHost/cPanel)
```
backend/uploads/       ← 755  (writable for file uploads)
backend/logs/          ← 755  (writable for error logs)
backend/.env           ← 600 or 644  (must be web-inaccessible; .htaccess blocks it)
All PHP files          ← 644
All static assets      ← 644
```

### Local (XAMPP)
```
backend/uploads/       ← 755
backend/logs/          ← 755
```

### Security Hardening (`.htaccess` in `backend/`)
The backend `.htaccess` blocks:
- `.env`, `.sql`, `.log`, `.ini`, `.md`, `.lock`, `.json`, `.example` files
- Dotfiles (`.htaccess`, `.git`, etc.)
- Internal directories: `config/`, `includes/`, `database/`, `logs/`
- `uploads/documents/private/` (documents served only via authenticated API)

The API `.htaccess` routes `/api/` requests to `api/index.php` with `DirectorySlash Off` to prevent 301 redirects that would bypass the router.

---

## 8. SSL & HTTPS

### Enabling SSL on TrueHost
1. In cPanel → **SSL/TLS Status** → Enable **AutoSSL**
2. Wait for certificate issuance (usually instant)
3. Verify: `https://yourdomain.com` should show a padlock

### Required Settings for HTTPS
In `backend/.env`, set:
```env
SESSION_SECURE=true    # REQUIRED — otherwise login cookies are rejected
```

The `.htaccess` automatically redirects HTTP to HTTPS when `SESSION_SECURE=true`.

### HTTPS Checklist
- [ ] `SESSION_SECURE=true` in `.env`
- [ ] `ALLOWED_ORIGINS` includes `https://` URLs only
- [ ] `BASE_URL` uses `https://`
- [ ] `FRONTEND_URL` uses `https://`
- [ ] AutoSSL is enabled in cPanel

---

## 9. Email (SMTP)

### TrueHost SMTP Notes
- Port 25 is often blocked — use **port 465 (SMTPS)** or **port 587 (STARTTLS)**
- Recommended: `SMTP_ENCRYPTION=tls` with port 587

### SMTP Configuration
```env
SMTP_HOST=smtp.yourhost.com
SMTP_PORT=465          # or 587
SMTP_USERNAME=your@email.com
SMTP_PASSWORD=your_email_password
SMTP_ENCRYPTION=tls    # or ssl
SMTP_FROM_NAME=Prime Realty Kenya
SMTP_FROM_EMAIL=info@yourdomain.com
```

### Emails Sent By The System
1. **Registration verification** — triggered on `POST /auth/register`
2. **Password reset** — triggered on `POST /auth/forgot-password`
3. **Inquiry notifications** — triggered when new inquiry is received
4. **Viewing request confirmations** — triggered on `POST /viewing-requests`

---

## 10. Troubleshooting

### Frontend Issues

| Symptom | Fix |
|---------|-----|
| Asset 404 errors (`Failed to load resource: 404`) | Frontend was built with wrong base URL. For root deployment: `npm run build` (base `/`). For subfolder: `npm run build:local` (base `/homes/dist/`). |
| "Cannot connect to backend" | Check that `VITE_API_URL` matches your backend URL. For local: `/homes/backend/api`. For production: `https://yourdomain.com/backend/api` |
| Manifest fetch error (`http://localhost/manifest.webmanifest failed`) | Frontend not at web root. Copy dist contents to `htdocs/` root or rebuild with correct base. |
| React Router 404 on refresh | Root `.htaccess` must have SPA fallback rule (`RewriteRule ^ index.html [L]`). |
| Login loop on HTTPS | Set `SESSION_SECURE=true` in `.env`. |
| CORS policy errors | Update `ALLOWED_ORIGINS` in `.env` to exactly match your frontend origin. |

### Backend Issues

| Symptom | Fix |
|---------|-----|
| 500 on API call | Check `backend/logs/php_errors.log`. Ensure MySQL is running and database exists. |
| 404 on API routes | Ensure `backend/api/.htaccess` exists and Apache `mod_rewrite` is enabled. Check `DirectorySlash Off`. |
| Database connection failed | Verify `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` in `.env`. Confirm MySQL is running. |
| Login fails silently | Check `SESSION_SECURE` — must be `true` on HTTPS, `false` on HTTP. |
| File upload fails | Verify `backend/uploads/` has 755 permissions. Check `UPLOAD_MAX_SIZE` and `.user.ini` settings. |
| `.env` file accessible | Verify `.htaccess` security rules are in place. Test: `curl https://yourdomain.com/backend/.env` should return 403. |
| PHP fatal error: "Failed opening required 'api/menu/index.php'" | Fixed typo in `api/index.php` — was requiring non-existent `menu/` dir instead of `sitemap/`. |

### Database Issues

| Symptom | Fix |
|---------|-----|
| "Unknown database 'real_estate_platform'" | Create the database first in cPanel → MySQL Databases, then import schema.sql. |
| "Access denied for user" | Verify `DB_USER` and `DB_PASSWORD` in `.env` match the MySQL user credentials. |
| "Table doesn't exist" errors | Import `schema.sql` before `seed.sql`. |
| Fulltext search returns no results | Ensure MySQL collation is `utf8mb4_unicode_520_ci` as specified in schema. |

### Permission Issues

| Symptom | Fix |
|---------|-----|
| Can't log in as admin | Default password is `Admin@123` (or `password` per README). Check seed.sql for your version. |
| Admin panel shows "Access denied" | Ensure your user has `role_id` 1-6 (staff). Customers (role_id 7) are redirected to `/dashboard`. |
| "Admin access required" | The `AdminRoute` guard checks if user role is staff (any non-customer). |

### Development Commands

```bash
# Build frontend for production (web root, base: /)
cd frontend && npm run build

# Build for local XAMPP subfolder (base: /homes/dist/)
cd frontend && npm run build:local

# Build for TrueHost (base: /, special .htaccess)
cd frontend && npm run build:truehost

# Start development server
cd frontend && npm run dev

# Lint frontend
cd frontend && npm run lint

# Lint backend PHP
php -l backend/api/index.php

# Test database connection
php backend/test_db.php  # (temporary diagnostic script)
```

### Quick Verification Checklist
After deployment, verify:
- [ ] `curl -s -o /dev/null -w "%{http_code}" http://localhost/` → **200**
- [ ] `curl -s -o /dev/null -w "%{http_code}" http://localhost/assets/index-*.js` → **200**
- [ ] `curl -s -o /dev/null -w "%{http_code}" http://localhost/manifest.webmanifest` → **200**
- [ ] `curl -s http://localhost/homes/backend/api/auth/check` → `{"success":true,"message":"","data":{"authenticated":false}}`
- [ ] `curl -s http://localhost/homes/backend/api/properties` → returns property JSON array
- [ ] `curl -s http://localhost/homes/backend/api/settings/public` → returns settings JSON object
- [ ] Login: `admin@realestate.co.ke` / `Admin@123`

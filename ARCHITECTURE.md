# Prime Realty Kenya — Full Architecture

## Overview

**Prime Realty Kenya** is a production-ready real estate property selling platform built for a Kenya-based business. It is a PHP 8.2+ + MySQL + React 18 application with no Node.js runtime required on the server for production.

### Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 + React Router 6 + Axios + TanStack Query 5 + Lucide React |
| Backend | PHP 8.2+ (plain PHP, no framework) + PDO + MySQL 8 / MariaDB 10.4 |
| Database | MySQL 8+ (UTF8MB4, `utf8mb4_unicode_520_ci` collation) |
| Server | Apache 2.4.58 (XAMPP on Windows) |
| Auth | PHP Sessions + HttpOnly/Secure/SameSite cookies + (JWT fallback) |
| Build | Vite with manual chunking, SPA fallback via `.htaccess` |
| Deployment | Shared hosting compatible (TrueHost/cPanel) |

### Deployment Architecture

```
Production URL: http://localhost/  (frontend served from web root)
API URL:        http://localhost/homes/backend/api/  (backend in subfolder)
Admin URL:      http://localhost/admin

Filesystem layout:
C:\xampp\htdocs\                  ← Apache web root (dist contents)
├── index.html, assets/, .htaccess, manifest.webmanifest, sw.js, etc.
├── homes/
│   ├── backend/
│   │   ├── index.php            ← 404 fallback
│   │   ├── api/
│   │   │   ├── index.php        ← API router (single entry point)
│   │   │   ├── .htaccess        ← Routes all API requests to index.php
│   │   │   ├── auth/            ← Auth endpoints
│   │   │   ├── properties/      ← Property CRUD (public + admin)
│   │   │   ├── inquiries/       ← Contact form + inquiry management
│   │   │   ├── customers/       ← Admin customer management
│   │   │   ├── settings/        ← Settings + social links + uploads
│   │   │   ├── promotions/      ← Promotion management
│   │   │   ├── notifications/   ← Notification CRUD
│   │   │   ├── documents/       ← Document mgmt + authenticated file serving
│   │   │   ├── users/           ← User management
│   │   │   ├── agents/          ← Agent management
│   │   │   ├── roles/           ← Role/permission management
│   │   │   ├── messages/        ← Inquiry message handling
│   │   │   ├── analytics/       ← Dashboard stats, charts, audit logs
│   │   │   ├── seo/             ← Sitemap.xml, robots.txt, SEO metadata
│   │   │   ├── viewing_requests/ ← Viewing request scheduling
│   │   │   ├── pages/           ← CMS page routes
│   │   │   ├── faqs/            ← FAQ CRUD
│   │   │   ├── testimonials/    ← Testimonial management
│   │   │   ├── menus/           ← Menu/item CRUD
│   │   │   └── media/           ← Media library CRUD
│   │   ├── config/
│   │   │   ├── config.php       ← Env loading + defaults (singleton)
│   │   │   ├── database.php     ← PDO connection (singleton)
│   │   │   └── cors.php         ← CORS middleware
│   │   ├── includes/
│   │   │   ├── auth.php         ← Auth class (sessions, login, register, lockout)
│   │   │   ├── security.php     ← Security headers, sessions, CSRF, audit log
│   │   │   ├── permissions.php  ← RBAC permission checking
│   │   │   ├── validation.php   ← Input validation
│   │   │   ├── upload.php       ← File upload + image optimization
│   │   │   └── response.php     ← JSON response helpers
│   │   ├── database/
│   │   │   ├── schema.sql       ← 22-table MySQL schema
│   │   │   └── seed.sql         ← Seed data (roles, permissions, admin, sample data)
│   │   ├── uploads/             ← File uploads (branding, media, properties, documents, etc.)
│   │   ├── .env                 ← Environment configuration
│   │   ├── .htaccess            ← Security rules + API routing
│   │   └── .user.ini            ← PHP runtime overrides (10GB uploads)
│   ├── frontend/                ← Development source
│   │   ├── src/
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── tailwind.config.cjs
│   │   └── dist/                ← Production build output
│   ├── logs/
│   └── README.md
└── (other projects: admin6, cold-room, joyvista, etc.)
```

---

## Frontend Architecture

### Entry Point & Provider Hierarchy

**`frontend/src/main.jsx`** — Application bootstrap:

```
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider>        ← TanStack Query (5min staleTime, retry=1, no refetchOnWindowFocus)
      <SettingsProvider>         ← Fetches /settings/public, injects CSS variables + favicon
        <AuthProvider>           ← Session check via /auth/check, login/register/logout
          <NotificationProvider> ← Polls /notifications every 30s
            <PWAProvider>        ← Service worker registration, install prompt, offline detection
              <BrowserRouter>    ← Dynamic basename: '/homes/dist' for local, '/' for prod
                <App />
              </BrowserRouter>
            </PWAProvider>
          </NotificationProvider>
        </AuthProvider>
      </SettingsProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
```

### Routing — `App.jsx`

React Router v6 with **three layout tiers**:

#### Public Routes (`PublicLayout`)
```
/                          → Home
/properties              → Properties list (with URL-based filters)
/properties/:slug        → Property details page
/about                   → About page
/gallery                 → Gallery
/services                → Services page
/contact                 → Contact form page
/favorites               → Favorites (guest-aware via localStorage)
/interested-properties   → Interested properties
/login                   → Login page
/register                → Registration page
/forgot-password         → Forgot password
/reset-password          → Reset password (token from URL)
/verify-email            → Email verification
/privacy                 → Privacy policy
/terms                   → Terms of service
/disclaimer              → Property disclaimer
/unauthorized            → 403 page
/:pageSlug               → Dynamic CMS page (catches blog posts, etc.)
*                        → 404 Not Found
```

#### Admin Routes (`AdminLayout` + `AdminRoute` guard)
Requires staff role (`super-admin`, `administrator`, `property-manager`, `content-manager`, `agent`, `accountant`). Redirects customers to `/dashboard`, unauthenticated to `/login`.
```
/admin                   → Dashboard (analytics, stats)
/admin/properties        → Properties list (searchable, paginated)
/admin/properties/add    → Add property (form)
/admin/properties/edit/:id → Edit property
/admin/properties/types  → Property type management
/admin/properties/features → Feature management
/admin/properties/documents → Document library
/admin/properties/verification → Verification workflow
/admin/messages          → Message inbox
/admin/messages/:id      → Message detail
/admin/viewing-requests  → Viewing request management
/admin/customers         → Customer list
/admin/customers/:id     → Customer detail
/admin/agents            → Agent management
/admin/promotions        → Promotion manager
/admin/media             → Media library
/admin/pages             → Pages list
/admin/pages/add         → Page builder (new)
/admin/pages/new         → Page builder (new)
/admin/pages/builder/:id → Page builder (edit)
/admin/menus             → Menu management
/admin/testimonials      → Testimonials
/admin/faqs              → FAQs
/admin/branding          → Branding settings
/admin/fonts             → Font settings
/admin/colors            → Color settings
/admin/contact           → Contact settings
/admin/social            → Social settings
/admin/seo               → SEO settings
/admin/security          → Security settings
/admin/users             → User management
/admin/roles             → Roles & permissions
/admin/audit-logs        → Audit log viewer
/admin/analytics         → Analytics dashboard
/admin/settings          → All settings
/admin/earb              → EARB info management
/admin/notifications     → Notification management
/admin/profile           → Admin profile
```

#### Customer Routes (`CustomerLayout` + `ProtectedRoute` guard)
Requires authentication. Redirects unauthenticated to `/login`.
```
/dashboard               → Customer dashboard
/dashboard/profile       → Profile management
/dashboard/favorites     → My favorites
/dashboard/interested    → Interested properties
/dashboard/inquiries     → My inquiries
/dashboard/viewings     → My viewing requests
/dashboard/notifications → My notifications
```

### Route Guards

- **`ProtectedRoute`** (`src/components/ProtectedRoute/index.jsx`): Checks `isAuthenticated` from AuthContext. Shows `LoadingSkeleton` while loading. Redirects to `/login` if unauthenticated. Supports optional `allowedRoles` parameter.
- **`AdminRoute`** (`src/components/AdminRoute/index.jsx`): Extends ProtectedRoute. Defines `STAFF_ROLES` array: `super-admin`, `administrator`, `property-manager`, `content-manager`, `agent`, `accountant`. Redirects customers to `/dashboard`, unauthenticated to `/login`.

### State Management — 4 React Contexts

1. **`AuthContext.jsx`** — Session-based authentication:
   - On mount: calls `GET /auth/check` to verify session
   - Stores user in React state + `localStorage` (via `authStorage.js`)
   - `login()`: calls `authAPI.login()`, stores user, updates TanStack Query cache directly
   - `register()`: calls `authAPI.register()`, throws on error
   - `logout()`: calls `authAPI.logout()`, clears state + localStorage, updates cache
   - `refetchUser()`: on-demand user refresh

2. **`SettingsContext.jsx`** — Global settings + theming:
   - Fetches `GET /settings/public` (10-minute stale time)
   - Dynamically injects CSS custom properties: `--color-primary`, `--color-secondary`, `--color-accent`, `--color-background`, `--color-surface`, `--color-text`, `--color-muted`
   - Applies heading/body fonts: `--font-heading`, `--font-body`
   - Dynamically replaces favicon based on `branding_favicon` setting

3. **`NotificationContext.jsx`** — Real-time notifications:
   - Polls `GET /notifications` every 30 seconds
   - Polls `GET /notifications/unread-count` every 30 seconds
   - `markAllRead()`: optimistic cache update (marks all as read locally)
   - `markRead(id)`, `deleteNotification(id)`: invalidate queries
   - Only fetches when `user` is authenticated (`enabled: !!user`)

4. **`PWAContext.jsx`** — Progressive Web App:
   - Registers service worker with dynamic `sw.js` URL based on `BASE_URL`
   - Captures `beforeinstallprompt` for install prompt
   - Detects iOS Safari and shows install guide
   - Tracks online/offline status
   - Handles service worker updates (auto-reload on `controllerchange`)
   - `installApp()`, `updateApp()`, `showInstallGuide`

### API Service Layer — `services/api.ts`

Single Axios instance with:
- `baseURL`: Dynamic resolution via `resolveBaseURL()`
  - If `VITE_API_URL` env var set → use it
  - If on localhost or path starts with `/homes` → `/homes/backend/api`
  - Otherwise → `/backend/api` (TrueHost root domain)
- `withCredentials: true` — session cookies sent automatically
- `timeout: 30000` (30s)
- **Response interceptor**: Unwraps the `{success, message, data}` envelope — returns `response.data` directly (the inner payload). On error, rejects with `{message, errors, status}`

**22 API service modules**:
`propertiesAPI`, `adminPropertiesAPI`, `authAPI`, `settingsAPI`, `inquiriesAPI`, `adminInquiriesAPI`, `viewingAPI`, `adminViewingsAPI`, `adminStatsAPI`, `propertyTypesAPI`, `featuresAPI`, `adminVerificationAPI`, `userProfileAPI`, `favoritesAPI`, `interestedAPI`, `promotionsAPI`, `adminPromotionsAPI`, `notificationsAPI`, `mediaAPI`, `galleryAPI`, `customersAPI`, `agentsAPI`, `pagesAPI`, `menusAPI`, `testimonialsAPI`, `faqsAPI`, `analyticsAPI`, `contactAPI`, `seoAPI`, `usersAPI`, `documentsAPI`

### Utility Functions — `utils/index.js`

15 utility functions:
- `formatPrice(price, currency)` — KSH/USD formatting with Kenyan locale
- `formatPriceRaw`, `formatNumber` — locale-aware number formatting
- `truncateText`, `calculateReadingTime`, `getRelativeTime`
- `extractList`, `extractTotal` — normalize paginated API responses
- `generateWhatsAppUrl`, `generatePropertyWhatsAppMessage` — WhatsApp integration
- `debounce`, `classNames`, `generateSlug`, `getInitials`
- `getUploadBase()` — resolves upload URL base (`/homes/backend` vs `/backend`)
- `getAppBase()` — returns app base path for static assets
- `resolveAssetUrl(url)` — normalizes asset URLs across environments
- `formatBytes`

### Layout Components

1. **`PublicLayout`**: Flex column layout with `<AnnouncementBar>` → `<Header>` → `<PromotionCard>` → `<main><Outlet>` → `<Footer>` → `<SocialFloatingButtons>`. Full-height flex container.

2. **`AdminLayout`**: Fixed-height flex container. Left sidebar (`AdminSidebar`) with collapse/expand and mobile drawer. Topbar (`AdminTopbar`) with hamburger menu toggle. Main content area wrapped in `<ErrorBoundary>` with location-based reset key. PWA offline banner, update notification, and install modal overlays.

3. **`CustomerLayout`**: Similar to AdminLayout but with `CustomerSidebar` and `CustomerTopbar`.

### Key UI Components

- **`AdminSidebar`**: 20+ navigation items with lucide-react icon mapping, collapsible desktop + off-canvas mobile drawer, permission-aware rendering, section expand/collapse, dark mode toggle
- **`AdminTopbar`**: Sticky header with business name, PWA install button, notifications dropdown (5 most recent with unread badges), profile dropdown with avatar + logout
- **`Header`**: Public header with responsive logo, desktop nav (Home, Properties, Gallery, About, Services, Contact), mobile hamburger, search, user menu
- **`Footer`**: Dark footer with contact info, social links, newsletter signup, payment icons
- **`PropertyCard`**: Auto-rotating image slideshow (3.5s interval, pause on hover), favorite toggle (localStorage/API), share, WhatsApp, info overlay, VAT-excl badge
- **`PromotionCard`**: Fetches active promotions, frequency rules (once_per_session, once_per_day, etc.), display types: banner/card/popup/modal/corner/inline/footer
- **`PropertyGrid`**: URL-parameter-based search/filter, TanStack Query with `keepPreviousData`, skeleton loading, empty state, pagination
- **`PropertyFilters`**: Collapsible filter groups (type, price, bedrooms, bathrooms, features, verification, status, location)

### Build Configuration

- **`vite.config.js`**: Path aliases (`@`, `@/components`, `@/pages`, etc.), dev server on port 5173 with proxy (3 rules: `/api`, `/homes/backend`, `/backend`), build outputs to `../dist/` with manual chunking (vendor, icons, query, axios, form), custom Vite plugin writes `.htaccess` with SPA fallback
- **`tailwind.config.cjs`**: 8 semantic colors, `Inter` font, container with edge-to-edge layout, 3 custom animations, property status badge classes
- **PWA assets** (`public/`): `manifest.webmanifest` (start_url: `./admin`, scope: `./`), `sw.js` service worker, `offline.html` fallback, icons (16x16, 32x32, 180x180, 192x192, 512x512, maskable)

---

## Backend Architecture

### API Request Flow

```
Browser Request
    ↓
Apache .htaccess routing
    ↓
/backend/api/index.php  (or /api/index.php via /homes/backend/api/index.php)
    ↓
Security::init()        ← disables error display, security headers, session config
Cors::init()            ← CORS headers, origin allowlist
Cors::handlePreflight() ← 204 for OPTIONS
    ↓
Path resolution          ← Dynamic base-path detection (works at any URL depth)
    ↓
ApiRouter::dispatch()   ← Segment-based route matching with {param} placeholders
    ↓
Auth middleware          ← getSessionUser() or checkRememberToken()
Permission middleware    ← hasPermission() (admins auto-pass)
    ↓
Route handler closure    ← PDO queries via Database singleton
    ↓
Response::send()         ← JSON {success, message, data} envelope
    ↓
Axios response interceptor ← Unwraps data envelope
    ↓
React component          ← useQuery/useMutation
```

### ApiRouter Class (`api/index.php`)

**Bootstrap** (lines 1-50):
1. Sets `Content-Type: application/json; charset=utf-8`
2. Requires config: `config/config.php`, `config/database.php`, `config/cors.php`
3. Requires core: `security.php`, `response.php`, `auth.php`, `permissions.php`, `validation.php`, `upload.php`
4. `Security::init()` → `Cors::init()` → `Cors::handlePreflight()` (204 for OPTIONS)
5. Parses request method, URI path, query string → `$GLOBALS['_GET_PARAMS']`, parses JSON body → `$GLOBALS['_INPUT']`

**Dynamic base-path resolution** (lines 22-43): Parses `REQUEST_URI` and `SCRIPT_NAME` to compute the API base path. Supports any hosting depth: `/homes/backend/api` (XAMPP), `/backend/api` (TrueHost), or subfolders. Falls back to regex-based path stripping for edge cases.

**Route matching**: Splits path into segments, compares against registered routes (supports `{param}` placeholders). If match found → `executeRoute()`. If no match → `Response::notFound()`.

**executeRoute middleware pipeline**:
1. If `auth !== 'public'`: calls `Auth::getCurrentUser()`. If no user → 401.
2. If `auth === 'admin'`: checks `Permissions::isStaff()` — 403 if not staff.
3. If `auth === 'permission'` with permission string: calls `Permissions::requirePermission()` (admins bypass).

**Route types**:
- `'public'` — no auth required
- `'authenticated'` — any logged-in user
- `'admin'` — staff only (role_id <= 6)
- `'permission'` + permission string — granular RBAC check (admins auto-pass)

**Module loading** (lines 114-134): Requires all endpoint module files in order:
auth, properties (index + admin), inquiries, customers, settings, promotions, notifications, documents, users, agents, roles, messages, analytics, seo, viewing_requests, pages, faqs, testimonials, menus, media

### Configuration (`config/`)

**`config.php`** (109 lines): Singleton `Config` class.
- Loads `.env` from 3 paths: `backend/.env` → `../../.env` → `backend/.env` (in config dir)
- Manual env parser (no vlucas/phpdotenv dependency) — handles `#`/`//` comments, quoted values, `$_ENV` + `$_SERVER` + `putenv()`
- **~25 config defaults**: DB credentials, JWT config (fallback only), session settings, allowed origins, upload limits, SMTP, base URLs
- `getRequired()`: exits with 500 JSON if a required var is missing

**database.php** (93 lines): Singleton `Database` class.
- Single PDO instance: `ERRMODE_EXCEPTION`, `FETCH_ASSOC`, `EMULATE_PREPARES=false`
- Sets `NAMES utf8mb4 COLLATE utf8mb4_unicode_520_ci` on connect
- Static helpers: `query()`, `querySingle()`, `execute()`, `lastInsertId()`, transaction methods (`beginTransaction()`, `commit()`, `rollback()`), `inTransaction()`
- On connection failure: logs to error_log, returns 500 JSON with generic message

**cors.php** (66 lines): `Cors` class.
- Parses `ALLOWED_ORIGINS` (comma-separated) into array
- Auto-allows same-host requests (origin host matches `HTTP_HOST`) — crucial for same-origin requests
- Sets `Allow-Credentials: true`, allows all CRUD methods + OPTIONS
- Headers: `Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-Admin-Token`
- `handlePreflight()`: 204 + exit for OPTIONS requests

### Core Includes

#### `includes/auth.php` (323 lines) — Auth class
- **`login(email, password, remember)`**: Fetches user + role slug (JOIN). `password_verify` against Argon2id hash. Account lockout after 5 failed attempts (30-min lockout via `login_attempts` + `lockout_until`). `session_regenerate_id(true)`. Sets `$_SESSION` with user_id, role_id, ip, ua, login_time. Optional 30-day remember cookie (secure + httponly). Audit logs login. Returns user data minus password_hash.
- **`logout()`**: Audit logs, clears remember token, destroys session, clears cookies.
- **`checkRememberToken()`**: Reads `remember_token` cookie, queries user with valid token, delegates to `loginWithToken()`.
- **`loginWithToken()`**: Sets session data (no session regeneration — token re-auth only).
- **`getCurrentUser()`**: Cached in `self::$currentUser`. Checks session first; if no session, tries `checkRememberToken()`. Fetches user + role slug + permissions. Strips sensitive fields.
- **`isLoggedIn()`**: Convenience wrapper.
- **`requireAuth()` / `requireAdmin()`**: Throws 401/403 via Response if unauthenticated/not admin. Admin check uses `role_id > 6` (note: this is inverted logic — role_id 1-6 are staff, 7 is customer).
- **`register()`**: Validates email uniqueness, email format, password min 8, name, phone. Inserts user with `role_id=7` (customer), email verification token. Also inserts into `user_roles` table. Wrapped in transaction.
- **`setResetToken()`**: Generates 32-byte token, 1-hour expiry.
- **`resetPassword()`**: Validates token expiry, min 8 chars, re-hashes with Argon2id.
- **`verifyEmail()`**: Single SQL UPDATE, returns success if row affected.

#### `includes/permissions.php` (152 lines) — Permissions class
- **RBAC with caching**: `getUserPermissions()` caches in `$permissionsCache[$userId]`. Queries both primary `role_id` and secondary `user_roles` via UNION. `getRolePermissions()` caches per role.
- **Alias system**: `viewing_requests.*` ↔ `viewings.*` bidirectional aliases.
- **`hasPermission()`**: Checks direct + alias.
- **`requirePermission()`**: Optionally bypasses for admins (`isAdmin()`).
- **`isAdmin()`**: role_slug in `['super-admin', 'administrator']`.
- **`isStaff()`**: role_slug !== 'customer' (any non-customer logged-in user).
- **`isCustomer()`**: role_slug === 'customer'.
- **`getPermissionList()` / `getRolePermissionMatrix()`**: For admin UI.

#### `includes/response.php` (83 lines) — Response class
Standard JSON response helpers following a consistent envelope pattern:
- `{success: true, message: string, data: ...}` for success
- `{success: false, message: string, errors: object}` for errors
- `send()`, `success()`, `error()`, `notFound()` (404), `unauthorized()` (401), `forbidden()` (403), `serverError()` (500), `validationError()` (422), `paginated()` (includes total/page/limit/total_pages/has_next/has_prev)

#### `includes/security.php` (246 lines) — Security class
- **`init()`**: Disables error display (production-safe), sets security headers, configures sessions.
- **`disableErrorDisplay()`**: `display_errors=0`, logs to `logs/php_errors.log` (auto-creates dir).
- **`setSecurityHeaders()`**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, `Referrer-Policy`, strict CSP, `Permissions-Policy` (camera/microphone/geolocation disabled).
- **`configureSession()`**: `httponly=1`, `use_strict_mode=1`, `samesite=Lax`, configurable `secure` flag, named session, only starts if not already started.
- **CSRF**: `generateCSRFToken()` (32-byte hex in session), `validateCSRFToken()` (hash_equals).
- **`generateSecureToken()`**: `bin2hex(random_bytes($length))`.
- **Passwords**: `hashPassword()` uses Argon2id (memory=64MB, time=4, threads=3). `verifyPassword()` wraps `password_verify`.
- **`checkRateLimit()`**: Session-based sliding window rate limiter.
- **`getClientIP()`**: Checks CF-Connecting-IP, X-Real-IP, X-Forwarded-For, Client-IP headers before REMOTE_ADDR.
- **`validateFileUpload()`**: Checks uploaded file, size, extension (blocks PHP/executables), MIME type mapping per extension.
- **`logAudit()`**: Inserts into `audit_logs` table (user_id, action, table, record_id, old_values JSON, new_values JSON, ip, user_agent).
- **`generateSlug()` / `generateUniqueSlug()`**: URL slug generation with database uniqueness check.

#### `includes/upload.php` (377 lines) — Upload class
- **`uploadFile()`**: Core upload handler. Validates file existence, extension (blocks PHP/executables), allowed types from config, size limit (parsed from config — supports MB/GB notation). MIME type validation via `finfo`. Image validation via `getimagesize` for image directories. Creates upload directory if missing. Generates unique filename (`date('Ymd')_uniqid.ext`). Records file_size, mime_type, dimensions for images.
- **Directory-specific methods**: `uploadPropertyImage()` → properties/, `uploadImage()` → agents/, `uploadDocument()` → documents/, `uploadMedia()` → media/, `uploadBranding()` → branding/
- **`deleteFile()`**: Resolves and unlinks relative path.
- **`serveProtectedDocument()`**: Serves `property_documents` through authenticated API. Access control: property creator, admin, assigned agent (email match), or inquirer. Sets Content-Type headers and streams via `readfile()`.
- **`optimizeImage()`**: Resizes to max 1920×1080 using GD. Preserves transparency for PNG/GIF/WebP/AVIF. Quality 85 for JPEG/WebP, level 6 for PNG.
- **`parseSizeToBytes()`**: Handles integer (MB) or string notation (10G, 512M, etc.).

#### `includes/validation.php` (141 lines) — Validation class
- **`isValidEmail()`**: `filter_var` with FILTER_VALIDATE_EMAIL.
- **`isValidPhone()`**: Regex `^\+?\d{9,15}$` after stripping spaces/dashes/parens.
- **`isValidSlug()`**: `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- **`sanitizeString()`**: trim + strip_tags.
- **`sanitizeHtml()`**: Allows whitelist of HTML tags (p, br, strong, b, em, i, u, a, ul, ol, li, h1-h6, blockquote, code, pre, hr, span, div, table, etc.).
- **`validate()`**: Rule-based validator supporting: required, email, phone, url, min/max string length, min/max_numeric.
- **`validateImageUpload()`**: Image-specific validation (extension + MIME check).
- **`formatPhoneNumber()`**: Converts local Kenyan numbers (07xx, 254) to E.164 international format (+254...).

### API Endpoint Summary

#### Auth (`/auth`) — public
| Method | Route | Action |
|--------|-------|--------|
| POST | `/auth/register` | Validates name/email/phone/password, rate-limited, creates user (role 7=customer), email verification token |
| POST | `/auth/login` | Rate-limited (5/hr/IP), validates credentials, session regeneration, optional 30-day "remember me" cookie, audit log |
| POST | `/auth/logout` | Destroys session, clears remember token cookie |
| GET | `/auth/me` | Returns current user data |
| POST | `/auth/forgot-password` | Generates 1-hour reset token |
| POST | `/auth/reset-password` | Validates token + new password (min 8 chars) |
| POST | `/auth/verify-email` | Validates verification token |
| GET | `/auth/check` | Returns `{authenticated: bool, user: ...}` |

#### Properties (`/properties` + `/admin/properties`)
| Method | Route | Auth |
|--------|-------|------|
| GET | `/properties` | public — paginated list with dynamic filters (type, county, town, area, keyword, price, bedrooms, bathrooms, verification_status, sort, featured) |
| GET | `/properties/featured` | public — featured properties |
| GET | `/properties/latest` | public — latest published properties |
| GET | `/properties/{slug}` | public — full property detail (images, features, agents, view tracking) |
| GET | `/properties/filter/options` | public — property types, features, counties |
| GET | `/property-types` | public — active property types |
| GET | `/features` | public — all features by category |
| POST | `/properties/{id}/view` | public — increment view count + log |
| GET | `/admin/properties` | `properties.view` — admin list with search |
| GET | `/admin/properties/{id}` | `properties.view` — full detail for editing |
| POST | `/admin/properties` | `properties.create` — transactional create (property + features + agents + SEO + images) |
| PUT | `/admin/properties/{id}` | `properties.edit` — update with features/agents/images/SEO replacement |
| DELETE | `/admin/properties/{id}` | `properties.delete` — delete + related records + uploaded images |
| PATCH | `/admin/properties/{id}/status` | `properties.publish` — publish/unpublish |
| POST | `/admin/properties/bulk` | `properties.edit` — bulk actions: publish, unpublish, feature, archive, delete |
| POST | `/admin/properties/{id}/duplicate` | `properties.create` — deep-copy property |
| GET | `/admin/property-types` | `properties.view` — all property types |
| POST/PUT/DELETE | `/admin/property-types/{id}` | create/edit/delete property type |
| GET | `/admin/features` | `properties.view` — all features |
| POST/PUT/DELETE | `/admin/features/{id}` | create/edit/delete features |
| GET | `/admin/verifications` | `properties.view` — properties pending verification |
| PATCH | `/admin/verifications/{id}` | `properties.edit` — verification status + audit trail |

#### Inquiries & Messages
| Method | Route | Auth |
|--------|-------|------|
| POST | `/contact` | public — contact form → inquiries + inquiry_messages + contact_submissions |
| POST | `/inquiries` | public — property inquiry with property_id |
| GET | `/admin/inquiries` | `messages.view` — paginated, status/search/type filters |
| GET | `/admin/inquiries/{id}` | `messages.view` — detail with messages |
| PATCH | `/admin/inquiries/{id}` | `messages.reply` — status/assigned_to/subject |
| POST | `/admin/inquiries/{id}/messages` | `messages.reply` — send reply (internal notes supported) |
| GET | `/admin/inquiries/stats` | `messages.view` — status counts |
| PUT | `/admin/inquiries/{id}` | `messages.reply` — full update |
| DELETE | `/admin/inquiries/{id}` | `messages.delete` — delete |
| GET | `/customer/inquiries` | authenticated — user's inquiries |
| GET | `/customer/inquiries/{id}` | authenticated — specific inquiry |
| POST | `/customer/inquiries/{id}/messages` | authenticated — customer reply |
| GET | `/admin/messages` | `messages.view` — inbox alias |
| GET | `/admin/messages/{id}` | `messages.view` — detail alias |
| PUT | `/admin/messages/{id}/read` | `messages.edit` — mark as read |
| DELETE | `/admin/messages/{id}` | `messages.delete` — delete |

#### Customers, Favorites, Interested Properties, Auth Profile
| Method | Route | Auth |
|--------|-------|------|
| GET | `/admin/customers` | `customers.view` — with search + joined counts |
| GET | `/admin/customers/{id}` | `customers.view` — detail |
| PUT | `/admin/customers/{id}` | `customers.edit` — update |
| PATCH | `/admin/customers/{id}` | `customers.edit` — partial update |
| PUT | `/admin/customers/{id}/status` | `customers.edit` — status change |
| POST | `/admin/customers/disable` | `customers.edit` — enable/disable |
| DELETE | `/admin/customers/{id}` | `customers.delete` — delete |
| GET | `/favorites` | authenticated — user's favorites |
| POST | `/favorites` | authenticated — add (INSERT IGNORE) |
| DELETE | `/favorites/{id}` | authenticated — remove by favorite_id or property_id |
| GET | `/interested-properties` | authenticated — user's interested properties |
| POST | `/interested-properties` | authenticated — add with notes |
| DELETE | `/interested-properties/{id}` | authenticated — remove |
| PUT | `/auth/profile` | authenticated — update own profile |
| PUT | `/auth/password` | authenticated — change password (current + new, min 8) |

#### Settings, Pages, Media, SEO
| Method | Route | Auth |
|--------|-------|------|
| GET | `/settings/public` | public — all public settings + social links + types + features + agents + menus + pages + earb + home page |
| GET | `/pages/{slug}` | public — published CMS page with sections |
| GET | `/admin/settings` | `settings.view` — all settings |
| PUT | `/admin/settings` | `settings.edit` — bulk update |
| GET | `/admin/settings/{group}` | `settings.view` — filtered by group |
| GET/POST/PUT/DELETE | `/admin/social-links` | CRUD |
| GET/PUT | `/admin/earb` | EARB info CRUD |
| POST | `/upload` | `media.upload` — file upload to media table |
| GET | `/admin/media` | `media.view` — list with search/type filters |
| DELETE | `/admin/media/{id}` | `media.delete` |
| PUT | `/admin/media/{id}` | `media.edit` |
| GET `/sitemap.xml` | public — generates XML from pages + properties |
| GET `/robots.txt` | public — disallows admin, account, uploads |
| GET | `/seo/metadata` | public — by page_type + slug |
| GET | `/seo/metadata/{page_type}` | public |
| PUT | `/admin/seo/{page_type}` | admin — upsert SEO metadata |

#### Promotions
| Method | Route | Auth |
|--------|-------|------|
| GET | `/promotions` | public — active promotions in date range |
| GET | `/admin/promotions` | `promotions.view` |
| GET | `/admin/promotions/{id}` | `promotions.view` |
| POST | `/admin/promotions` | `promotions.create` — display config, frequency rules |
| PUT | `/admin/promotions/{id}` | `promotions.edit` |
| DELETE | `/admin/promotions/{id}` | `promotions.delete` |
| POST | `/promotions/view` | public — track view |
| POST | `/promotions/click` | public — track click |

#### Notifications, Documents, Users, Agents, Roles
| Method | Route | Auth |
|--------|-------|------|
| GET/PATCH/DELETE | `/notifications` | authenticated — CRUD + mark read |
| GET | `/notifications/unread-count` | authenticated |
| PATCH | `/notifications/read` | authenticated — mark all read |
| GET | `/admin/documents` | permission — list with filters |
| GET | `/admin/documents/{id}` | permission — detail |
| POST | `/admin/documents` | permission — upload (multipart) |
| PUT/DELETE | `/admin/documents/{id}` | permission |
| GET | `/admin/documents/serve/{id}` | permission — streams protected file with access control |
| GET/POST/PUT/DELETE | `/admin/users` | CRUD (prevents self-deletion) |
| GET/POST/PUT/DELETE | `/admin/agents` | CRUD + photo upload |
| GET | `/admin/agents/{id}/inquiries` | agent-specific inquiries |
| GET/POST/PUT/DELETE | `/admin/roles` | CRUD (prevents system role 1-2 deletion) |
| GET/POST/PUT/DELETE | `/admin/verifications` | permission-based verification workflow |

#### Analytics, Viewing Requests, Testimonials, FAQs, Menus
| Method | Route | Auth |
|--------|-------|------|
| GET | `/admin/dashboard/stats` | admin — aggregate counts |
| GET | `/admin/analytics/charts` | admin — time-series + top lists |
| GET | `/admin/audit-logs` | `audit_logs.view` — filtered, paginated |
| POST | `/viewing-requests` | public — schedule viewing |
| GET | `/admin/viewing-requests` | admin — status/agent/search filters |
| GET/PATCH/PUT/DELETE | `/admin/viewing-requests/{id}` | admin management |
| GET | `/customer/viewings` | authenticated — user's requests |
| GET | `/testimonials` | public — approved only |
| GET/POST/PUT/DELETE | `/admin/testimonials` | CRUD |
| GET | `/faqs` | public — active only |
| GET/POST/PUT/DELETE | `/admin/faqs` | CRUD |
| GET/POST/PUT/DELETE | `/admin/menus` | CRUD (with items replacement) |

### Database Schema — 22 Tables

#### Identity & Access
**`roles`** (7 seed roles):
| id | name | slug |
|---|---|---|
| 1 | Super Admin | super-admin |
| 2 | Administrator | administrator |
| 3 | Property Manager | property-manager |
| 4 | Sales Agent | agent |  (slug: "agent")
| 5 | Content Manager | content-manager |
| 6 | Accountant | accountant |
| 7 | Customer | customer |

**`permissions`** (49 permissions across 8 groups):
- `properties`: view, create, edit, delete, publish
- `messages`: view, reply, edit, delete
- `customers`: view, edit, delete
- `agents`: view, create, edit, delete
- `viewings`: view, edit, delete
- `promotions`: view, create, edit, delete
- `media`: view, create, edit, delete, upload
- `pages`: view, create, edit, delete
- `content`: manage (FAQs, testimonials)
- `settings`: view, edit
- `users`: view, create, edit, delete
- `analytics`: view, charts, audit_logs

**`role_permissions`**: Many-to-many role ↔ permission
**`user_roles`**: Many-to-many user ↔ role (secondary role assignments)

**`users`**: User accounts — `role_id` (FK→roles, default 7=customer), name, email (unique), phone, phone_verified, `password_hash` (Argon2id), profile_image, status (active/inactive/suspended/banned), email_verified, email_verification_token, remember_token + expiry, password_reset_token + expiry, last_login, login_attempts, lockout_until, timestamps.

#### Property Listings
**`property_types`** (10 seed): Apartment, Villa, Maisonette, Bungalow, Townhouse, Mansion, Office, Warehouse, Commercial, Land

**`properties`**: Core listing — `property_type_id`, name, slug (unique), `description` (LONGTEXT), `price` (DECIMAL 15,2), currency, location, county, town, area, estate, address, lat/lng, bedrooms, bathrooms, parking_spaces, house_size, land_size, floors, year_built, furnishing_status, status (8 statuses: Draft/Published/Available/Reserved/Under Offer/Sold/Coming Soon/Hidden), verification_status (6 statuses), verification_notes, verified_by/verified_at, featured, views_count, published_at, created_by/updated_by, timestamps. Fulltext index on 8 text columns.

**`property_images`**: filename, alt_text, caption, is_primary, sort_order, file_size, mime_type, width, height. CASCADE delete to properties.

**`features`** (25 seed): Pool, Garden, Garage, CCTV, etc. with icon, category, is_default, sort_order.

**`property_features`**: Many-to-many property ↔ feature (unique constraint).

**`property_documents`**: title, filename, file_path, file_size, mime_type, `document_type` (deed/title/tax_receipt/approval/survey/insurance/other), `visibility` (private/admin_only), uploaded_by.

**`property_verifications`**: Workflow table — submitted_by, reviewed_by, status (6 statuses), notes, reviewed_at.

**`agents`** (4 seed): name, photo, phone, email, bio, registration_number, credentials (JSON), license_number, license_expiry, specialization, properties_sold, rating, status.

**`property_agents`**: Many-to-many property ↔ agent (is_primary flag).

#### EARB Information
**`earb_info`**: Key-value table for Estate Agents Registration Board info — key_name, display_name, value, field_type (text/textarea/number/date/file/boolean), sort_order, is_active.

#### Customer Interactions
**`favorites`**: Many-to-many user ↔ property (unique constraint).
**`interested_properties`**: user ↔ property with notes (unique constraint).
**`inquiries`**: name, email, phone, subject, message, `status` (6 statuses), assigned_to, `source` (website/property_page/contact_form/api/other), user_id/property_id nullable.
**`inquiry_messages`**: Threaded messages — inquiry_id, sender_id, `sender_type` (customer/agent/admin), message, is_internal_note.
**`viewing_requests`**: preferred_date, preferred_time_start/end, `status` (5 statuses), assigned_agent, admin_notes.

#### Content Management
**`pages`**: title, slug (unique), content (LONGTEXT), status (draft/published), is_system, sort_order, show_in_menu, parent_id (hierarchical).
**`page_sections`**: Page builder — section_type, title, content (JSON), sort_order, is_active.
**`menus`**: name, slug (unique), location, is_active.
**`menu_items`**: menu_id, title, url, target, sort_order, parent_id (hierarchical), is_active, css_class, icon.

#### Media Library
**`media`**: filename, original_name, file_path, file_size, mime_type, width, height, alt_text, caption, title, description, usage_count, uploaded_by.

#### Marketing
**`promotions`**: title, description, image, button_text/url, start/end_date, active, `display_type` (7 types), `display_frequency` (8 rules), position, priority, close_button, background_color, text_color, `page_visibility` (JSON).
**`promotion_views`**: promotion_id, user_id, session_id, ip_address.
**`promotion_clicks`**: Same structure as views.

#### System & Settings
**`settings`**: 40+ key-value settings across 6 groups — `key` (unique), `value` (TEXT), `type` (8 types), `group_name`, label, description, sort_order, `is_public`. Groups: general, system, contact, branding, seo, email, security.

**`social_links`**: platform, url, icon, sort_order, is_active.

**`testimonials`**: name, email, phone, rating (1-5), title, content, property_id, `status` (pending/approved/rejected).

**`faqs`**: question, answer, category, sort_order, is_active.

#### SEO & Analytics
**`seo_metadata`**: page_type, page_id, slug, meta_title/description/keywords, canonical_url, OG fields, twitter_card, is_indexed.

**`property_views`**: property_id, user_id, session_id, ip_address, user_agent, referrer, city, country.

**`audit_logs`**: user_id, `action` (8 types), table_name, record_id, old_values (JSON), new_values (JSON), ip_address, user_agent.

**`notifications`**: user_id, type, title, message, reference_type/id, is_read.

**Contact submissions** (from contact form): stored separately in `contact_submissions` as backward compatibility.

### Authentication & Authorization

#### Authentication Flow (Session-based)
1. User submits login form → `POST /auth/login`
2. Auth class validates credentials via `password_verify` (Argon2id)
3. Account lockout after 5 failed attempts (30-min lockout)
4. On success: `session_regenerate_id(true)`, stores user_id + role_id + ip + ua in `$_SESSION`
5. Optional 30-day "remember me" cookie (secure + httponly)
6. Frontend receives user data, stores in AuthContext + localStorage
7. Subsequent requests: browser sends session cookie automatically (withCredentials)
8. `GET /auth/check` verifies session on page load — also checks remember-me token if session is empty
9. Logout: `POST /auth/logout` — destroys session, clears remember cookie

#### Authorization (RBAC)
- 7 roles with hierarchical access levels:
  - **Super Admin** (id 1): All permissions (49/49)
  - **Administrator** (id 2): All except `roles.edit` and `audit_logs.view` (47/49)
  - **Property Manager** (id 3): 22 specific property/customer/viewing permissions
  - **Content Manager** (id 5): Page, menu, testimonial, FAQ, media permissions
  - **Agent** (id 4): Own inquiry messages, own viewings, own properties
  - **Accountant** (id 6): Read-only analytics/stats
  - **Customer** (id 7): Frontend-only access (favorites, inquiries, viewings)

- **Secondary roles** via `user_roles` table allow users to have multiple roles simultaneously
- **Permission aliases**: `viewing_requests.*` ↔ `viewings.*` (bidirectional)
- Admin middleware uses `isStaff()` (any non-customer role) for route-level enforcement
- Permission-level routes use `requirePermission()` with admin bypass

### Security Features
- **Session security**: HttpOnly + Secure + SameSite=Lax cookies, `session.use_strict_mode=1`, session name configuration, 1440s lifetime
- **Error suppression**: `disableErrorDisplay()` in production — logs to file only, never displays to user
- **Security headers**: CSP, X-Frame-Options (SAMEORIGIN), X-Content-Type-Options (nosniff), Referrer-Policy, Permissions-Policy (camera/mic/geolocation blocked)
- **CSRF**: 32-byte token generated per session, validated with `hash_equals()`
- **Rate limiting**: 5 login attempts per hour per IP (session-based sliding window)
- **Password hashing**: Argon2id (memory=64MB, time=4, threads=3)
- **File upload security**: Extension blacklist (no PHP/exec files), MIME type validation per extension, image dimension verification, 10GB max size
- **SQL injection**: All queries use PDO prepared statements
- **XSS prevention**: Output escaping via `htmlspecialchars`, HTML sanitization with tag whitelist
- **Audit logging**: All admin actions logged (login, logout, failed_login, created_property, published_property, changed_whatsapp_number, etc.)

#### Root `.htaccess` (SPA Fallback)
The root `.htaccess` at `C:\xampp\htdocs\.htaccess` handles SPA routing:
1. Does **not** rewrite `/backend/` or `/dist/` requests (serves them as-is)
2. Serves existing files/directories directly (`-f` / `-d` checks)
3. Falls through all other non-file requests to `index.html` (React Router handles client-side routing)

#### Root `index.php` (Frontend Fallback Server)
The root `index.php` serves as a fallback frontend entry point:
1. If `index.html` exists in web root → serve it as HTML
2. If `dist/index.html` exists → serve that
3. If neither exists → return 503 with a helpful "run `npm run build`" message

This allows the site to work at `http://localhost/` without a full production build, falling back gracefully.

### API Routing — Two-Pass Dispatch

The `ApiRouter::dispatch()` method uses a **two-pass matching algorithm**:

**Pass 1 — Static routes first**: Routes without `{param}` placeholders are matched exactly by segment count and value. This ensures `/admin/inquiries/stats` doesn't accidentally match `/admin/inquiries/{id}`.

**Pass 2 — Parameterized routes**: Routes with `{param}` placeholders are matched by segment count, with literal segments compared exactly and param segments captured into `$params`.

This two-pass approach resolves ambiguity between static and parameterized routes with the same segment count.

```
GET /properties              → matches '/properties' (static, pass 1)
GET /properties/my-house     → matches '/properties/{slug}' (param, pass 2)
GET /admin/inquiries/stats   → matches '/admin/inquiries/stats' (static, pass 1)
GET /admin/inquiries/123     → matches '/admin/inquiries/{id}' (param, pass 2)
```
- `.env`, `.sql`, `.log`, `.ini`, `.md`, `.lock`, `.json`, `.example` files: **403 Forbidden**
- Dotfiles (`.htaccess`, `.git`, etc.): **403 Forbidden**
- Internal directories (`config/`, `includes/`, `database/`, `logs/`): **403 Forbidden**
- `uploads/documents/private/`: **403 Forbidden** (documents served only via authenticated API)
- API requests (`^.*/api/`): Rewritten to `api/index.php` with QSA flag
- Apache `DirectorySlash Off` in `api/` prevents 301 redirect that would bypass the router

### Build & Deployment

#### Development
```bash
# Terminal 1 - PHP backend (Apache already serving)
# Terminal 2 - Frontend dev server
cd frontend
npm run dev    # http://localhost:5173 (Vite dev server)
              # Proxies /api → http://localhost/homes/backend/api
```

#### Production Build
```bash
cd frontend
npm run build  # Base: / (root-relative)
               # Output: dist/ with index.html, assets/, .htaccess, sw.js, manifest.webmanifest
```

#### Deployment Steps (TrueHost)
1. Build frontend: `npm run build:truehost` (base `/` + .htaccess with no RewriteBase)
2. Upload `dist/` contents to `public_html/`
3. Upload entire `backend/` folder
4. Create MySQL database + import `schema.sql` + `seed.sql`
5. Configure `backend/.env` with production DB credentials + HTTPS settings
6. Set `SESSION_SECURE=true` for HTTPS
7. Set file permissions: `backend/uploads` 755, `backend/logs` 755

#### Default Credentials
- Admin: `admin@realestate.co.ke` / `Admin@123` (after seed.sql)
- README.md mentions: `admin@realestate.co.ke` / `password`

### Complete Frontend Routing Table (from `App.jsx`)

**Public Routes** (`PublicLayout`):
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Hero search, featured/latest properties, plots/land showcases, categories, testimonials |
| `/properties` | `Properties` | Grid/list with URL-param filters, pagination |
| `/properties/:slug` | `PropertyDetails` | Full property detail page |
| `/about` | `About` | Company information |
| `/gallery` | `Gallery` | Image gallery |
| `/services` | `Services` | Services page |
| `/contact` | `Contact` | Contact form with contact info cards |
| `/favorites` | `Favorites` | Favorites (guest-aware via localStorage) |
| `/interested-properties` | `InterestedProperties` | Interested properties list |
| `/login` | `Login` | Login form |
| `/register` | `Register` | Registration form |
| `/forgot-password` | `ForgotPassword` | Password reset request |
| `/reset-password` | `ResetPassword` | Password reset (token from URL) |
| `/verify-email` | `VerifyEmail` | Email verification |
| `/privacy` | `PrivacyPolicy` | Privacy policy |
| `/terms` | `Terms` | Terms of service |
| `/disclaimer` | `PropertyDisclaimer` | Property disclaimer |
| `/unauthorized` | `Unauthorized` | 403 page |
| `/plots` | `Plots` | Plot-specific listing page |
| `/:pageSlug` | `DynamicPage` | CMS page (catches blog posts, etc.) |
| `*` | `NotFound` | 404 page |

**Admin Routes** (`/admin`, guarded by `AdminRoute`):
| Path | Component |
|------|-----------|
| `/admin` | `AdminDashboard` |
| `/admin/properties` | `AdminProperties` |
| `/admin/properties/add` | `AddProperty` |
| `/admin/properties/edit/:id` | `EditProperty` |
| `/admin/properties/types` | `PropertyType` |
| `/admin/properties/features` | `PropertyValue` |
| `/admin/properties/documents` | `Documents` |
| `/admin/properties/verification` | `Verification` |
| `/admin/messages` | `AdminMessages` |
| `/admin/messages/:id` | `MessageView` |
| `/admin/viewing-requests` | `ViewingRequests` |
| `/admin/customers` | `AdminCustomers` |
| `/admin/customers/:id` | `CustomerView` |
| `/admin/agents` | `AdminAgents` |
| `/admin/promotions` | `PromotionManager` |
| `/admin/media` | `MediaLibrary` |
| `/admin/pages` | `AdminPages` |
| `/admin/pages/add` | `PageBuilder` |
| `/admin/pages/new` | `PageBuilder` |
| `/admin/pages/builder/:id` | `PageBuilder` |
| `/admin/menus` | `Menus` |
| `/admin/testimonials` | `Testimonials` |
| `/admin/faqs` | `FAQs` |
| `/admin/branding` | `BrandingSettings` |
| `/admin/fonts` | `FontSettings` |
| `/admin/colors` | `ColorSettings` |
| `/admin/contact` | `ContactSettings` |
| `/admin/social` | `SocialSettings` |
| `/admin/seo` | `SEOSettings` |
| `/admin/security` | `SecuritySettings` |
| `/admin/users` | `UserManagement` |
| `/admin/roles` | `Roles` |
| `/admin/audit-logs` | `AuditLogs` |
| `/admin/analytics` | `Analytics` |
| `/admin/settings` | `Settings` |
| `/admin/earb` | `EarbInfo` |
| `/admin/notifications` | `AdminNotifications` |
| `/admin/profile` | `AdminProfile` |

**Customer Routes** (`/dashboard`, guarded by `ProtectedRoute`):
| Path | Component |
|------|-----------|
| `/dashboard` | `CustomerDashboard` |
| `/dashboard/profile` | `CustomerProfile` |
| `/dashboard/favorites` | `CustomerFavorites` |
| `/dashboard/interested` | `CustomerInterested` |
| `/dashboard/inquiries` | `CustomerInquiries` |
| `/dashboard/viewings` | `CustomerViewings` |
| `/dashboard/notifications` | `CustomerNotifications` |

### Layout Components

**PublicLayout** (`src/layouts/PublicLayout`):
- `<PWAOfflineBanner>` — offline status indicator
- `<AnnouncementBar>` — marquee announcement bar
- `<Header>` — logo, nav, search, user menu
- `<PromotionCard>` — active promotions
- `<main><Outlet>` — page content
- `<Footer>` — contact info, links, newsletter
- `<SocialFloatingButtons>` — WhatsApp + social media
- `<PWAInstallModal>` / `<PWAUpdateNotification>` — PWA prompts

**AdminLayout** (`src/layouts/AdminLayout`):
- Fixed-height flex container
- `<AdminSidebar>` (collapsible desktop + mobile drawer)
- `<AdminTopbar>` (notifications, profile, menu toggle)
- `<main>` with `<ErrorBoundary>` (resets on route change)
- PWA overlays (offline banner, update notification, install modal)

**CustomerLayout** (`src/layouts/CustomerLayout`):
- Similar to AdminLayout but with `CustomerSidebar` and `CustomerTopbar`

### Tailwind Configuration

**`tailwind.config.cjs`**:
- 8 semantic colors: `primary` (#2563eb), `secondary` (#7c3aed), `accent` (#ea580c), `background` (#ffffff), `surface` (#f8fafc), `text` (#1e293b), `muted` (#64748b), `border` (#e2e8f0)
- Semantic status colors: `success` (#10b981), `warning` (#f59e0b), `error` (#ef4444)
- `Inter` system font family (sans/heading/body)
- Full-width container (100% at all breakpoints)
- 3 custom animations: `fade-in`, `slide-up`, `slide-down`
- Custom spacing: `72`, `84`, `96`, `128`

**`index.css`/**`index.html`**:
- CSS variables: `--color-primary`, `--color-secondary`, `--color-accent`, `--color-background`, `--color-surface`, `--color-text`, `--color-muted`, `--font-heading`, `--font-body`
- Component classes: `.btn`, `.btn-primary`, `.btn-outline`, `.btn-secondary`, `.card`, `.input`, `.badge-*`, property status classes
- Responsive utility classes: `.text-primary`, `.bg-primary`, `.transition-smooth`, `.shadow-card`, `.line-clamp-*`

### PWA Assets
The `public/` directory contains:
- `favicon.svg`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`
- `manifest.webmanifest` (start_url: `./admin`, scope: `./`)
- `sw.js` — service worker with cache strategies
- `offline.html` — offline fallback page
- `pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`
- `logo.svg`, `logo-white.svg`

### Key Frontend Components Detail

- **`PropertyCard`**: Auto-rotating image slideshow (3.5s interval, pause on hover), favorite toggle (localStorage for guests, API for logged-in), share button, WhatsApp button, property info overlay, VAT-excl badge, property status badges
- **`PropertySearch`**: Search form on the home page
- **`PropertyFilters`**: Collapsible filter groups (type, price range, bedrooms, bathrooms, features, verification status, property status)
- **`PropertyGallery`**: Full-screen image gallery with thumbnail navigation
- **`PropertyGrid`**: Property listing grid with view mode toggle (grid/list)
- **`PromotionCard`**: Fetches active promotions, applies frequency rules (always/once_per_session/once_per_day/etc.), supports display types: banner/card/popup/modal/corner/inline/footer
- **`AdminSidebar`**: 20+ navigation items with lucide-react icon mapping, collapsible desktop + off-canvas mobile drawer, permission-aware (checks `permission` property on nav items), section expand/collapse, dark mode toggle
- **`AdminTopbar`**: Sticky header with business name, PWA install button, notifications dropdown (shows 5 most recent with unread badges), profile dropdown with avatar + logout
- **`Header`**: Public header with responsive logo, desktop nav links, mobile hamburger menu, search button, user menu (login/logout + favorites icons)
- **`Footer`**: Dark footer with contact info, social links, newsletter signup, payment method icons

### Utility Functions (`utils/index.js`)
15 utility functions:
- `formatPrice(price, currency)` — KES/USD with Kenyan locale (`en-KE`)
- `formatPriceRaw`, `formatNumber` — locale-aware number formatting
- `truncateText`, `calculateReadingTime`, `getRelativeTime`
- `extractList`, `extractTotal` — normalize paginated API responses from the `{success, data, pagination}` envelope
- `generateWhatsAppUrl`, `generatePropertyWhatsAppMessage` — WhatsApp integration
- `debounce`, `classNames`, `generateSlug`, `getInitials`
- `getUploadBase()` — resolves upload URL (`/homes/backend` vs `/backend`)
- `getAppBase()` — returns app base path for static assets
- `resolveAssetUrl(url)` — normalizes asset URLs across environments (handles DB-stored paths, relative URLs, logo/favicon paths)
- `formatBytes`

### Vite Configuration (`vite.config.js`)

**Aliases**: `@`, `@/components`, `@/pages`, `@/admin`, `@/services`, `@/hooks`, `@/context`, `@/utils`, `@/layouts`

**Dev server** (port 5173):
- Proxy `/api` → `http://localhost:80/homes/backend/api` (with `changeOrigin`)
- Proxy `/homes/backend` → `http://localhost:80` (direct Apache)
- Proxy `/backend` → `http://localhost:80` (rewritten to `/homes/backend` for TrueHost compatibility)

**Build**:
- Output: `../dist/` (empties outDir)
- Manual chunking: `vendor` (react, react-dom, react-router), `icons` (lucide-react), `query` (@tanstack/react-query), `axios`, `form` (react-hook-form)
- CSS code splitting enabled, source maps enabled
- Custom plugin writes `.htaccess` with SPA fallback + PWA headers

### Development Notes
- No TypeScript — frontend uses plain JavaScript (.jsx)
- No state management library (Redux/Zustand) — uses React Context + TanStack Query
- No UI framework — custom Tailwind components
- The `src/hooks/` directory exists but is **empty** (all data fetching done inline via `useQuery`/`useMutation`)
- Vite proxy handles 3 URL patterns for local dev: `/api`, `/homes/backend`, `/backend`
- No UI framework — custom Tailwind components
- Custom `ApiRouter` (no framework routing like Slim/Laravel routes)
- Vite proxy configured for local dev: proxies `/api`, `/homes/backend`, and `/backend` (rewritten) to Apache
- Frontend basename is dynamic: `/homes/dist` when served from subfolder, `/` when at root
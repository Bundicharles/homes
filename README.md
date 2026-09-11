# Prime Realty Kenya

Production-ready professional real-estate property selling platform built for a Kenya-based business.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + React Router + Axios + TanStack Query + Lucide React icons
- **Backend**: Plain PHP 8.2+ REST API with PDO and PHPMailer
- **Database**: MySQL 8+ (MariaDB 10.4) on XAMPP
- **Hosting**: Windows XAMPP (Apache 2.4.58, PHP 8.2.12, MySQL 10.4.32)

## Project Structure

```
homes/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components (public, admin, customer)
│   │   ├── layouts/             # Layout components
│   │   ├── context/             # React contexts (Auth, Settings, Notifications)
│   │   ├── services/            # API service layer (Axios)
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx              # Main app with routes
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.cjs
│   └── dist/                    # Production build output
├── backend/
│   ├── api/                     # REST API endpoints
│   │   ├── index.php            # API router
│   │   ├── auth/                # Authentication endpoints
│   │   ├── properties/          # Property endpoints (public + admin)
│   │   ├── inquiries/           # Customer inquiries
│   │   ├── settings/            # Site settings
│   │   ├── promotions/          # Promotions management
│   │   ├── notifications/       # User notifications
│   │   ├── customers/           # Customer management
│   │   ├── agents/              # Agent management
│   │   ├── analytics/           # Dashboard analytics
│   │   ├── menu/                # Menu management
│   │   ├── seo/                 # SEO endpoints
│   │   ├── users/               # User management
│   │   ├── roles/               # Role management
│   │   ├── pages/               # CMS pages
│   │   ├── menus/               # Navigation menus
│   │   ├── testimonials/        # Testimonials
│   │   ├── faqs/                # FAQs
│   │   ├── documents/           # Property documents
│   │   └── viewing_requests/    # Viewing requests
│   ├── config/                  # Configuration files
│   │   ├── config.php           # Central configuration
│   │   ├── database.php         # PDO database connection
│   │   └── cors.php             # CORS handling
│   ├── includes/                # Shared utilities
│   │   ├── auth.php             # Authentication class
│   │   ├── security.php         # Security utilities
│   │   ├── permissions.php      # Permission checking
│   │   ├── validation.php       # Input validation
│   │   ├── upload.php           # File upload handling
│   │   └── response.php         # API response helpers
│   └── database/                # Database files
│       ├── schema.sql           # Complete database schema
│       └── seed.sql             # Seed data
└── README.md
```

## Prerequisites

- Windows OS
- XAMPP installed with Apache 2.4.58+, PHP 8.2.12+, MySQL 10.4.32+
- Node.js 18+ and npm

## Installation

### 1. Clone or copy the project

Place the project folder in your XAMPP htdocs directory:
```
C:\xampp\htdocs\homes\
```

### 2. Start XAMPP services

1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL** modules

### 3. Create the database

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Create a new database named `real_estate_platform`
3. Import the database schema:
   - Go to the `homes/backend/database/` folder
   - Import `schema.sql`
   - Then import `seed.sql`

Alternatively, run via command line:
```bash
mysql -u root -p real_estate_platform < backend/database/schema.sql
mysql -u root -p real_estate_platform < backend/database/seed.sql
```

### 4. Configure backend

Edit `backend/config/config.php` if needed:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'real_estate_platform');
define('DB_USER', 'root');
define('DB_PASS', '');
```

Default super admin credentials:
- Email: `admin@realestate.co.ke`
- Password: `password`

### 5. Install frontend dependencies

```bash
cd frontend
npm install
```

### 6. Build frontend for production

```bash
cd frontend
npm run build
```

This creates the production build in `dist/` (relative to the project root), and a `closeBundle` hook automatically syncs the build artifacts to the project root.

### 7. Configure Vite proxy (development only)

For development, the Vite dev server proxies `/api` requests to the PHP backend:
```javascript
// frontend/vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost/homes/backend/api',
      changeOrigin: true,
    },
  },
},
```

### 8. Access the application

**Public site**: http://localhost/homes/ (after building and syncing to root)
**Admin panel**: http://localhost/homes/admin
**API base**: http://localhost/homes/backend/api

## Development

### Start development server

```bash
cd frontend
npm run dev
```

This starts the Vite dev server on http://localhost:5173 with API proxying to the PHP backend.

### Backend API testing

You can test API endpoints directly:
```bash
curl http://localhost/homes/backend/api/properties
curl http://localhost/homes/backend/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@realestate.co.ke","password":"password"}'
```

## Architecture

### Authentication Flow

1. User logs in via `/api/auth/login`
2. PHP creates a session and returns user data
3. Frontend stores user in AuthContext and localStorage
4. Subsequent API requests include session cookies
5. Protected routes verify authentication via `/api/auth/check`

### API Request Flow

```
React Component
    ↓
Axios API Service (src/services/api.ts)
    ↓
Vite Proxy (dev) / Direct HTTP (prod)
    ↓
PHP API Router (backend/api/index.php)
    ↓
Endpoint Handler (e.g., properties/index.php)
    ↓
Auth/Permission Checks (includes/auth.php, includes/permissions.php)
    ↓
Database Query (PDO via includes/database.php)
    ↓
JSON Response
```

### Security Features

- PHP session-based authentication
- HttpOnly, Secure, SameSite cookies
- CSRF token validation
- Rate limiting on auth endpoints
- Password hashing with `password_hash()`
- File upload validation with MIME checks
- SQL injection prevention via prepared statements
- XSS prevention via output escaping
- Audit logging for admin actions

### Database Schema

30+ tables including:
- `users`, `roles`, `permissions`, `role_permissions`, `user_roles`
- `properties`, `property_types`, `property_features`, `property_images`
- `inquiries`, `favorites`, `interested_properties`, `viewing_requests`
- `promotions`, `notifications`, `settings`, `social_links`
- `pages`, `menus`, `menu_items`, `testimonials`, `faqs`
- `agents`, `property_documents`, `audit_logs`, `seo_metadata`

## Default Roles

- **Super Admin**: Full system access
- **Administrator**: Full access except system settings
- **Customer**: Browse properties, submit inquiries, manage favorites
- **Agent**: View assigned properties, manage inquiries
- **Viewer**: Read-only access to public content

## Features

### Public
- Property listing with advanced filtering
- Property details with gallery, maps, agent info
- Search and filter by type, location, price, features
- WhatsApp integration for inquiries
- Contact form
- About, Services, Privacy Policy, Terms pages
- Responsive design with dark mode support

### Admin Panel
- Dashboard with analytics and statistics
- Property management (CRUD, bulk actions, duplicate, status updates)
- Customer management and status updates
- Agent management
- Message/inquiry management with read/unread status
- Viewing request management
- Document management
- User and role management with permissions
- CMS pages management
- Navigation menu management
- Testimonials management
- FAQs management
- Settings (contact, branding, colors, fonts, social, SEO)
- E.A.R.B. info management
- Audit logs

### Customer Dashboard
- Personal dashboard overview
- My Favorites
- My Inquiries
- Interested Properties
- My Viewings
- Notifications
- Profile management

## Environment Variables

The frontend uses Vite environment variables:
```env
VITE_API_URL=http://localhost/homes/backend/api
```

## Troubleshooting

### npm commands fail on Windows

If npm commands fail due to PowerShell execution policy:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```

### Apache not starting

Check if port 80 is already in use:
```bash
netstat -ano | findstr :80
```

### Database connection errors

1. Verify MySQL is running in XAMPP
2. Check database credentials in `backend/config/config.php`
3. Ensure database `real_estate_platform` exists

### Frontend build errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Ensure Node.js version is 18+
- Check for TypeScript syntax in .jsx files (use plain JS)

## License

Proprietary - All rights reserved

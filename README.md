# Secured Login

A full-stack authentication system with a React frontend, Express API, Prisma ORM, and PostgreSQL.

## Architecture

```text
React Frontend
     ↓
Express API
     ↓
Validation + Rate Limiting
     ↓
Authentication / Authorization
     ↓
Prisma ORM
     ↓
PostgreSQL
     ↓
secured_login
```

## Database

```text
PostgreSQL
└── secured_login
    ├── users
    ├── sessions
    ├── verification_tokens
    ├── password_reset_tokens
    └── audit_logs
```

The application connects as the `root` database role. The `postgres` superuser is only used for setup and administration.

## Features

### Authentication

- Registration
- Login / logout
- Session management
- `GET /api/auth/me`
- Email verification
- Forgot / reset / change password

### Security

- Argon2id password hashing
- Secure HttpOnly session cookies
- CSRF protection (double-submit cookie)
- Server-side Zod validation
- Rate limiting
- Helmet security headers
- CORS restrictions
- Request size limits
- Account lockout after failed logins
- Session revocation
- Generic auth errors to prevent account enumeration
- No sensitive data in API responses or logs

### Authorization

| Role | Access |
|------|--------|
| `USER` | Own profile and account actions |
| `ADMIN` | Manage users, disable accounts, view audit logs |

Backend authorization is enforced on every protected route. React route guards are UX only.

## Quick start

### 1. Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm

### 2. Install dependencies

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 3. Create the database

Run as the `postgres` superuser:

```bash
psql -U postgres -f server/scripts/setup-db.sql
```

This creates:

- role: `root`
- database: `secured_login`

Default dev password: `secured_login_dev`

### 4. Configure environment

Copy the example env file and adjust if needed:

```bash
cp server/.env.example server/.env
```

Required variables:

- `DATABASE_URL`
- `SESSION_SECRET` (minimum 32 characters)
- `CLIENT_URL`

### 5. Migrate and seed

```bash
npm run db:setup
```

This generates the Prisma client, runs migrations, and creates a default admin user:

- Email: `admin@example.com`
- Password: `SecureAdminPass123!`

Override with `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`.

### 6. Run the app

Terminal 1 — API:

```bash
npm run dev:server
```

Terminal 2 — frontend:

```bash
npm run dev:client
```

- Frontend: http://localhost:5173
- API: http://localhost:5000
- Health check: http://localhost:5000/health

Verification and reset links are logged to the API console in development.

## API overview

### Auth

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/auth/csrf` | No | Issue CSRF token |
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/auth/verify-email` | No | Verify email |
| POST | `/api/auth/resend-verification` | No | Resend verification |
| POST | `/api/auth/forgot-password` | No | Request reset |
| POST | `/api/auth/reset-password` | No | Reset password |
| POST | `/api/auth/change-password` | Yes | Change password |

### Admin

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/admin/users` | Admin | List users |
| PATCH | `/api/admin/users/:id` | Admin | Enable/disable users, change role |
| GET | `/api/admin/audit-logs` | Admin | View security logs |

## Validation layers

```text
React validation (Zod)
      ↓
Express validation (Zod)
      ↓
PostgreSQL constraints
```

## Security testing

Run the automated security test suite:

```bash
npm test
```

Coverage includes:

- Correct and failed login
- Duplicate registration without enumeration
- Weak/invalid passwords and emails
- Expired and revoked sessions
- Logout
- Expired and used reset tokens
- CSRF rejection
- Unauthorized and forbidden access
- SQL injection input rejection
- Oversized and malformed requests

## HTTP responses

| Situation | Status |
|-----------|--------:|
| Success | 200 |
| Created | 201 |
| Invalid input | 400 |
| Not authenticated | 401 |
| Not authorized | 403 |
| Not found | 404 |
| Conflict | 409 |
| Too many requests | 429 |
| Server failure | 500 |

## Project structure

```text
client/          React frontend
server/          Express API
  prisma/        Schema and migrations
  src/
    controllers/
    middleware/
    routes/
    services/
    validators/
```

## Production notes

- Set `NODE_ENV=production`
- Use strong secrets and HTTPS
- Configure a real email provider in `server/src/services/email.service.ts`
- Review CORS and cookie settings for your domain

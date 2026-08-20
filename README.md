# 🍽️ Eato - Smart Restaurant Ordering System

A cross-platform restaurant ordering system built with a **pnpm monorepo** architecture. Web and Mobile share business logic through a shared package.

## 📐 Architecture

```
eato/
├── packages/
│   ├── shared/          # Shared code (API, types, stores, utils)
│   ├── web/             # Vite + React + Tailwind + shadcn/ui
│   └── mobile/          # Expo React Native + NativeWind
├── backend/             # Express + Prisma + PostgreSQL + Redis
├── docs/                # Documentation
└── docker-compose.yml   # Local development setup
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | pnpm workspaces |
| **Web Frontend** | Vite + React 18 + TypeScript + Tailwind CSS |
| **Mobile Frontend** | React Native (Expo) + TypeScript |
| **Shared Code** | API client, TypeScript types, Zustand stores |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Cache** | Redis (ioredis) |
| **Real-time** | Socket.io |
| **Auth** | JWT (Access + Refresh tokens) |
| **Payment** | Stripe |
| **API Docs** | Swagger / OpenAPI 3.0 |
| **Error Tracking** | Sentry (free tier) |
| **Monitoring** | Sentry Performance + Profiling |

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0
- **PostgreSQL** (local or Supabase)
- **Redis** (local or Upstash)

### 1. Clone & Install

```bash
git clone <repo-url>
cd eato
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment files
cp backend/.env.example backend/.env

# Edit backend/.env with your database URL, Redis URL, JWT secrets, and Stripe keys
```

### 3. Database Setup

```bash
# Generate Prisma client
cd backend
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed the database
pnpm prisma:seed
```

### 4. Start Development

```bash
# From root directory - starts backend and web
pnpm dev

# Or start individually:
pnpm dev:backend    # Backend on port 5000
pnpm dev:web        # Web on port 5173
pnpm dev:mobile     # Mobile (opens Expo Go)
```

### 5. API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:5000/api/docs
- **JSON Spec**: http://localhost:5000/api/docs.json

### 6. Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eato.com | Admin123! |
| Staff | staff@eato.com | Staff123! |
| Kitchen | kitchen@eato.com | Staff123! |
| Customer | customer@eato.com | Customer123! |

## 📦 Package Structure

### `@eato/shared`

Shared business logic used by both Web and Mobile:

- **`types/`** - TypeScript interfaces matching Prisma schema
- **`api/`** - Axios-based API client with platform-adaptive storage
- **`stores/`** - Zustand state management (auth, cart, order, theme)
- **`utils/`** - Pure utility functions (formatting, validation, calculations)
- **`constants/`** - Application-wide constants and enum configs

### `@eato/web`

Vite-powered React web application:

- React Router DOM v6 for navigation
- Tailwind CSS + shadcn/ui components
- React Query for server state management
- Socket.io client for real-time updates
- Admin dashboard with theme customization
- Sentry error tracking and performance monitoring
- Skeleton loaders and spinners for loading states

### `@eato/mobile`

Expo React Native mobile application:

- React Navigation (Stack + Bottom Tabs)
- NativeWind for styling
- Expo SecureStore for token storage
- Socket.io client for real-time updates
- Customer-facing features only

### `@eato/backend`

Express REST API server:

- JWT authentication (Access + Refresh tokens)
- Prisma ORM with PostgreSQL
- Redis for caching, rate limiting, JWT blacklist
- Socket.io for real-time order updates
- Stripe integration for online payments
- Swagger / OpenAPI 3.0 documentation
- Sentry error tracking and performance monitoring

## 🎨 Theme Customization

Admins can customize the color theme from the Admin Dashboard:

1. Navigate to `/admin` → **Theme** tab
2. Select a color preset or enter a custom hex color
3. Changes apply instantly via CSS custom properties

Available themes: Orange, Blue, Green, Purple, Rose, Teal

## 🔌 API Documentation

Swagger UI is available at `/api/docs` when the backend is running. It includes:

- Full endpoint documentation for all routes
- Request/response schemas
- Authentication setup (Bearer token)
- Example requests and responses

## 🔍 Error Tracking (Sentry)

Sentry is integrated for both backend and web frontend (free tier):

- **Backend**: `@sentry/node` with Express integration, profiling, and performance monitoring
- **Web**: `@sentry/react` with browser tracing, replay on error, and source maps

To enable, add your Sentry DSN to `backend/.env`:
```
SENTRY_DSN="https://your-dsn@sentry.io/project-id"
```

For the web frontend, set `VITE_SENTRY_DSN` in your environment or `.env` file.

## 🔒 Security

- JWT tokens with short-lived access (15min) and long-lived refresh (7d)
- Refresh tokens blacklisted in Redis on logout
- Rate limiting on auth routes (10 requests/minute)
- Password hashing with bcrypt (12 rounds)
- CORS configured for specific origins
- Helmet.js for HTTP security headers

## 🚢 Deployment

### Web (Vercel/Netlify)
```bash
cd packages/web
pnpm build
# Deploy the dist/ folder
```

### Backend (Render)
```bash
cd backend
pnpm build
# Deploy with start command: node dist/server.js
```

### Database (Supabase)
- Free tier: 500MB PostgreSQL
- Create a project and use the connection string

### Redis (Upstash)
- Free tier: 256MB
- Create a Redis database and use the connection URL

### Error Tracking (Sentry)
- Free tier: 5K transactions/month, 10K errors/month
- Create a project at [sentry.io](https://sentry.io)
- Copy the DSN to your environment variables

## 📖 Documentation

- [Architecture Guide](docs/architecture.md)
- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Development Guide](docs/development.md)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

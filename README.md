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
| **Web Frontend** | Vite 8 + React 19 + TypeScript 7 + Tailwind CSS 4 + shadcn/ui (19 components) |
| **Mobile Frontend** | React Native (Expo 57) + TypeScript 7 + 8 reusable UI components |
| **Shared Code** | API client, TypeScript types, Zustand stores, design tokens |
| **Backend** | Node.js + Express 5 + TypeScript 7 |
| **Database** | PostgreSQL + Prisma 7 |
| **Cache** | Redis (ioredis 6) |
| **Real-time** | Socket.io |
| **Auth** | JWT (Access + Refresh tokens) |
| **Payment** | Stripe 22 |
| **API Docs** | Swagger / OpenAPI 3.0 |
| **Error Tracking** | Sentry 10 (free tier) |
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
cd backend

# Generate Prisma client (types + query builder from schema.prisma)
pnpm prisma:generate

# Run migrations (creates tables in database from schema changes)
pnpm prisma:migrate

# Seed the database (populates demo users, menu items, categories)
pnpm prisma:seed
```

**What each command does:**

| Command | Purpose | When to run |
|---------|---------|-------------|
| `prisma:generate` | Generates TypeScript types and query client from `schema.prisma` | After changing schema |
| `prisma:migrate` | Creates SQL migration, applies to database, regenerates client | After changing schema |
| `prisma:seed` | Populates database with demo data (users, menu, categories) | Once after first migration |

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
- **`stores/`** - Zustand state management (auth, cart, order, theme, notification)
- **`utils/`** - Pure utility functions (formatting, validation, calculations)
- **`constants/`** - Application-wide constants and enum configs
- **`tokens.ts`** - Shared design tokens (colors, typography, spacing, radii, shadows)

### `@eato/web`

Vite-powered React web application with a modern, premium design:

- React Router DOM v7 for navigation
- Tailwind CSS 4 + shadcn/ui component library (19 components)
- Glass morphism effects, animated gradients, micro-interactions
- Plus Jakarta Sans font with warm food-themed color palette
- Full dark mode support with warm tones
- 30+ CSS animations (float, shimmer, glow, bounce-in, stagger, etc.)
- React Query for server state management
- Socket.io client for real-time updates
- Admin dashboard with theme customization
- Admin reports & analytics (daily/weekly/monthly)
- Notification system (news ticker + popup)
- Sentry error tracking and performance monitoring
- Skeleton loaders and spinners for loading states

### `@eato/mobile`

Expo React Native mobile application with modern food delivery app design:

- React Navigation (Stack + Bottom Tabs) with smooth transitions
- Reusable UI component library (Button, Card, Input, Badge, Avatar, etc.)
- Animated API micro-interactions (fade-in, scale, stagger)
- Ionicons for consistent iconography
- Expo SecureStore for token storage
- Socket.io client for real-time updates
- Notification system (news ticker + popup)
- Customer-facing features only

### `@eato/backend`

Express REST API server:

- JWT authentication (Access + Refresh tokens)
- Prisma ORM with PostgreSQL
- Redis for caching, rate limiting, JWT blacklist
- Socket.io for real-time order updates
- Stripe integration for online payments
- Swagger / OpenAPI 3.0 documentation
- Analytics & reporting API (admin only)
- Sentry error tracking and performance monitoring

## 🎨 Design System

### Typography
- **Font**: Plus Jakarta Sans (Google Fonts)
- **Weights**: 200-800 (variable font)

### Color Palette
- **Primary**: Warm orange `#ea580c` (appetizing, energetic)
- **Background Light**: `hsl(40 33% 98%)` (warm white)
- **Background Dark**: `hsl(20 14% 6%)` (warm dark)
- **Accent colors**: Cream, Sage, Warm gradients

### Design Tokens
Shared between Web and Mobile via `@eato/shared/tokens`:
```typescript
import { colors, typography, spacing, radii, shadows } from '@eato/shared/tokens';
```

### Animations
30+ CSS animations defined in `index.css`:
- `animate-float`, `animate-float-slow` — floating elements
- `animate-shimmer` — loading shimmer effect
- `animate-glow-pulse`, `animate-pulse-glow` — glow effects
- `animate-gradient-shift` — animated gradient text
- `animate-bounce-in`, `animate-scale-in` — entrance animations
- `animate-fade-in-up`, `animate-slide-up` — page transitions
- `stagger-children` — cascading child animations

### Utility Classes
- `glass` / `glass-strong` — Glass morphism backgrounds
- `glow` / `glow-lg` — Orange glow shadows
- `hover-lift` — Cards lift on hover
- `gradient-text` / `gradient-text-animated` — Gradient text effects
- `food-gradient` / `hero-gradient` — Background gradients
- `shimmer-bg` — Shimmer loading background

### Web UI Components (19)
| Component | Description |
|-----------|-------------|
| `Button` | 6 variants: default, destructive, outline, secondary, ghost, gradient, glow + loading state |
| `Card` | Glass morphism variant, hover-lift |
| `Badge` | 7 variants: default, secondary, destructive, outline, success, warning, info + pulse, dot |
| `Input` | Label, error, icon support |
| `Avatar` | Image or initials fallback, 4 sizes |
| `Dialog` | Radix UI modal with animations |
| `Tabs` | Radix UI tabs with animated indicator |
| `Select` | Custom styled dropdown |
| `Switch` | Radix UI toggle switch |
| `Toast` | Notification toasts with 5 variants |
| `Sheet` | Side panel (4 directions) |
| `Progress` | Animated progress bar |
| `Separator` | Horizontal/vertical divider |
| `Skeleton` | Animated loading placeholder |
| `Spinner` | Circular loading indicator |
| `PageLoading` | Full-page centered loader |
| + 4 page-specific skeletons | Home, Menu, Cart, Order |

### Mobile UI Components (8)
| Component | Description |
|-----------|-------------|
| `Button` | 5 variants, 3 sizes, loading state |
| `Card` | 3 variants: default, elevated, outlined |
| `Input` | Label, focus/error states, icon |
| `Badge` | 5 color variants |
| `Avatar` | Image or initials, 3 sizes |
| `EmptyState` | Icon, title, subtitle, action |
| `Skeleton` | Animated pulse placeholder |
| `ScreenHeader` | Title, subtitle, actions |

## 🎨 Theme Customization

Admins can customize the color theme from the Admin Dashboard:

1. Navigate to `/admin` → **Theme** tab
2. Select a color preset or enter a custom hex color
3. Changes apply instantly via CSS custom properties

Available themes: Orange, Blue, Green, Purple, Rose, Teal

## 🔔 Notification System

The notification system supports two types of alerts:

### News Ticker
- Scrolling banner displayed at the top of the page/app
- Auto-rotates through multiple announcements
- Clickable links for promotions
- Can be dismissed by users

### Popup Notifications
- Modal dialogs with optional images
- Single popup or multi-slide carousel
- Appears after 1 second delay
- Dismissed state persists per session

### Admin Management
- Create/edit/delete notifications from Admin Dashboard → Notifications tab
- Set type (ticker/popup), title, message, image, link
- Priority control (0-100) for ordering
- Active/inactive toggle

## 📊 Reports & Analytics

Admin reports with daily, weekly, and monthly views:

### Overview
- Total Revenue, Total Orders, Avg Order Value, New Customers

### Revenue Trend
- Bar chart showing revenue over time for the selected period

### Popular Items
- Top 10 best-selling menu items by quantity

### Peak Hours
- Orders by hour of day to identify busy times

### Order Status
- Distribution of orders by status (pending, confirmed, preparing, etc.)

### Payment Methods
- Breakdown by payment method (cash, card, online)

Access via Admin Dashboard → Reports tab, or via API at `/api/v1/analytics/*`

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

### Web (Vercel)

A `vercel.json` is included at the project root. Vercel will:
1. Install all workspace dependencies
2. Build only `@eato/web` (shared package is compiled inline by Vite)

**Vercel Settings:**
- **Root Directory**: `/` (or leave empty)
- **Framework**: Vite (auto-detected)
- **Build Command**: `pnpm --filter @eato/web build`
- **Output Directory**: `packages/web/dist`

No need to build the shared package separately — Vite resolves `@eato/shared/*` directly from source.

### Web (Netlify)
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

### Database (Supabase/Neon)
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

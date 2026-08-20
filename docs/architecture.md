# Architecture Guide

## Overview

Eato uses a **monorepo architecture** with pnpm workspaces to share code between Web and Mobile platforms while maintaining clear separation of concerns.

## Directory Structure

```
eato/
├── packages/
│   ├── shared/                 # Platform-agnostic business logic
│   │   ├── src/
│   │   │   ├── api/           # API client with platform adaptation
│   │   │   ├── types/         # TypeScript interfaces
│   │   │   ├── stores/        # Zustand state management
│   │   │   ├── utils/         # Pure utility functions
│   │   │   └── constants/     # App-wide constants
│   │   └── package.json
│   │
│   ├── web/                    # Vite + React web app
│   │   ├── src/
│   │   │   ├── components/    # UI components (shadcn/ui)
│   │   │   │   ├── ui/        # Button, Card, Skeleton, Spinner, etc.
│   │   │   │   ├── layout/    # Header, Footer
│   │   │   │   └── notification/ # NewsTicker, NotificationPopup
│   │   │   ├── pages/         # Route pages
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── stores/        # Web-specific store setup
│   │   │   ├── lib/           # Utilities and API setup
│   │   │   └── sentry.ts      # Sentry initialization
│   │   └── package.json
│   │
│   └── mobile/                 # Expo React Native app
│       ├── src/
│       │   ├── screens/       # Screen components
│       │   ├── components/    # Reusable components (NewsTicker, NotificationPopup)
│       │   ├── hooks/         # Custom hooks
│       │   └── stores/        # Mobile-specific store setup
│       └── package.json
│
├── backend/                    # Express API server
│   ├── src/
│   │   ├── config/            # Environment and service config
│   │   │   ├── index.ts       # Environment validation
│   │   │   ├── database.ts    # Prisma client
│   │   │   ├── redis.ts       # Redis client
│   │   │   ├── stripe.ts      # Stripe integration
│   │   │   ├── swagger.ts     # OpenAPI spec
│   │   │   └── sentry.ts      # Sentry initialization
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── modules/           # Feature modules (auth, menu, etc.)
│   │   └── socket/            # Socket.io event handlers
│   ├── prisma/                # Database schema and migrations
│   └── package.json
│
└── docker-compose.yml         # Local development services
```

## Data Flow

```
┌─────────────┐     ┌─────────────┐
│   Web App   │     │  Mobile App │
│  (React)    │     │(React Native│
└──────┬──────┘     └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 │
         ┌───────▼───────┐
         │  @eato/shared │
         │  (API Client) │
         └───────┬───────┘
                 │
         ┌───────▼───────┐
         │    Backend    │
         │   (Express)   │
         └───────┬───────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼───┐  ┌────▼────┐  ┌───▼───┐
│  PG   │  │  Redis  │  │Stripe │
│  DB   │  │  Cache  │  │Payment│
└───────┘  └─────────┘  └───────┘
                 │
          ┌──────▼──────┐
          │   Sentry    │
          │ (Error +    │
          │  Perf)      │
          └─────────────┘
```

## Shared Package

The `@eato/shared` package is the core of the monorepo. It provides:

### Platform Adaptation

The API client uses a **StorageAdapter** interface that abstracts storage operations:

```typescript
interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
```

- **Web**: Uses `localStorage`
- **Mobile**: Uses `expo-secure-store`

### Store Factories

Each Zustand store is a **factory function** that accepts platform-specific dependencies:

```typescript
// Creates auth store with platform-specific storage and API
const useAuthStore = createAuthStore(storageAdapter, authApi);
```

This pattern allows Web and Mobile to use the same store logic with different implementations.

## Backend Architecture

### Module Pattern

Each feature (auth, menu, cart, order, staff, notification, analytics) follows the same structure:

```
modules/
└── feature/
    ├── validation.ts   # Zod schemas for request validation
    ├── service.ts      # Business logic
    └── routes.ts       # Express route handlers (with Swagger annotations)
```

### Middleware Stack

1. **Sentry**: Request handler + error handler
2. **Security**: Helmet, CORS
3. **Parsing**: JSON, URL-encoded, cookies
4. **Rate Limiting**: Redis-backed, per-route configurable
5. **Authentication**: JWT verification
6. **Validation**: Zod schema validation
7. **Error Handling**: Global error formatter

### Real-time Communication

Socket.io handles real-time order updates:

```
Customer App ──order:subscribe──► Socket.io Server
                                        │
Staff Dashboard ◄──order:new────────────┘
Kitchen Display ◄──order:statusUpdate───┘
```

### API Documentation

Swagger / OpenAPI 3.0 documentation is auto-generated from route annotations:

- **Swagger UI**: `/api/docs` (interactive API explorer)
- **JSON Spec**: `/api/docs.json` (machine-readable)

### Error Monitoring

Sentry tracks errors and performance across both backend and frontend:

- **Backend**: Express integration, Node.js profiling, performance traces
- **Frontend**: Browser tracing, error replay, source maps
- **Free Tier**: 5K transactions/month, 10K errors/month

## Database Schema

Key relationships:

- **User** → has one **Cart** → has many **CartItems**
- **User** → has many **Orders** → has many **OrderItems**
- **MenuCategory** → has many **MenuItems**
- **OrderItem** references **MenuItem** (with price snapshot)

## Notification System

The notification system provides two types of alerts:

### News Ticker (Scrolling Banner)
- Displayed at the top of the page/app
- Auto-rotates through multiple announcements every 5 seconds
- Clickable links for promotions
- Dismissable by users
- Priority-based ordering (higher priority shown first)

### Popup Notifications (Modal)
- Full-screen modal with optional images
- Supports single popup or multi-slide carousel
- Appears after 1.5 second delay
- Dismissed state persists per session (not in storage)

### Data Flow
```
Admin Dashboard ──create──► Backend API ──store──► PostgreSQL
                                                      │
Web App ◄──fetch──► GET /notifications/active ◄───────┘
Mobile App ◄──fetch──► GET /notifications/active ◄─────┘
```

## Analytics & Reporting

The analytics system provides admin-only reporting with daily, weekly, and monthly aggregations.

### Data Points
- **Revenue**: Total, trend over time, average order value
- **Orders**: Count by status, payment method breakdown
- **Popular Items**: Top sellers by quantity and revenue
- **Peak Hours**: Orders by hour of day for staffing optimization
- **Customers**: New customer count per period

### Architecture
```
analytics/
├── validation.ts   # Zod schemas (period, limit)
├── service.ts      # Prisma aggregations + grouping
└── routes.ts       # 7 GET endpoints (admin-only)
```

### Caching
Analytics data is not cached (queries are time-sensitive). The Prisma `aggregate` and `groupBy` APIs handle efficient database-level aggregation.

## Loading States

The web frontend uses skeleton loaders and spinners for better UX:

- **Skeleton**: Animated placeholder matching content shape
- **Spinner**: Circular loading indicator with optional label
- **PageLoading**: Full-page centered loader
- **MenuSkeleton**: Grid layout skeleton for menu page
- **OrderSkeleton**: Card list skeleton for orders page
- **CartSkeleton**: Two-column layout skeleton for cart page
- **HomeSkeleton**: Hero + features + grid skeleton for landing page

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│                   Vercel/Netlify                 │
│              (Static Web Build)                  │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│              Render.com (Backend)                │
│         Express + Socket.io + Stripe            │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
   ┌──────▼──────┐ ┌──▼──┐ ┌──────▼──────┐
   │  Supabase   │ │Redis│ │   Stripe    │
   │ (PostgreSQL)│ │     │ │ (Payments)  │
   └─────────────┘ └─────┘ └─────────────┘
          │
   ┌──────▼──────┐
   │   Sentry    │
   │ (Monitoring)│
   └─────────────┘
```

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
│   │   │   ├── pages/         # Route pages
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── stores/        # Web-specific store setup
│   │   │   └── lib/           # Utilities and API setup
│   │   └── package.json
│   │
│   └── mobile/                 # Expo React Native app
│       ├── src/
│       │   ├── screens/       # Screen components
│       │   ├── components/    # Reusable components
│       │   ├── hooks/         # Custom hooks
│       │   └── stores/        # Mobile-specific store setup
│       └── package.json
│
├── backend/                    # Express API server
│   ├── src/
│   │   ├── config/            # Environment and service config
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

Each feature (auth, menu, cart, order, staff) follows the same structure:

```
modules/
└── feature/
    ├── validation.ts   # Zod schemas for request validation
    ├── service.ts      # Business logic
    └── routes.ts       # Express route handlers
```

### Middleware Stack

1. **Security**: Helmet, CORS
2. **Parsing**: JSON, URL-encoded, cookies
3. **Rate Limiting**: Redis-backed, per-route configurable
4. **Authentication**: JWT verification
5. **Validation**: Zod schema validation
6. **Error Handling**: Global error formatter

### Real-time Communication

Socket.io handles real-time order updates:

```
Customer App ──order:subscribe──► Socket.io Server
                                        │
Staff Dashboard ◄──order:new────────────┘
Kitchen Display ◄──order:statusUpdate───┘
```

## Database Schema

Key relationships:

- **User** → has one **Cart** → has many **CartItems**
- **User** → has many **Orders** → has many **OrderItems**
- **MenuCategory** → has many **MenuItems**
- **OrderItem** references **MenuItem** (with price snapshot)

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
```

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
│   │   │   ├── constants/     # App-wide constants
│   │   │   └── tokens.ts      # Shared design tokens (colors, spacing, etc.)
│   │   └── package.json
│   │
│   ├── web/                    # Vite + React web app
│   │   ├── src/
│   │   │   ├── components/    # UI components
│   │   │   │   ├── ui/        # 19 shadcn/ui components
│   │   │   │   │   ├── button.tsx, card.tsx, badge.tsx, input.tsx
│   │   │   │   │   ├── avatar.tsx, dialog.tsx, tabs.tsx, select.tsx
│   │   │   │   │   ├── switch.tsx, toast.tsx, sheet.tsx, progress.tsx
│   │   │   │   │   ├── separator.tsx, skeleton.tsx, spinner.tsx
│   │   │   │   │   ├── page-loading.tsx
│   │   │   │   │   └── *-skeleton.tsx (home, menu, cart, order)
│   │   │   │   ├── layout/    # Header (glass morphism), Footer
│   │   │   │   └── notification/ # NewsTicker, NotificationPopup
│   │   │   ├── pages/         # Route pages (8 pages, fully redesigned)
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── stores/        # Web-specific store setup
│   │   │   ├── lib/           # Utilities and API setup
│   │   │   ├── index.css      # Tailwind 4 theme, 30+ animations, dark mode
│   │   │   └── sentry.ts      # Sentry initialization
│   │   └── package.json
│   │
│   └── mobile/                 # Expo React Native app
│       ├── src/
│       │   ├── screens/       # Screen components (6 screens, redesigned)
│       │   ├── components/    # Reusable components
│       │   │   ├── ui/        # 8 mobile UI components
│       │   │   │   ├── Button.tsx, Card.tsx, Input.tsx, Badge.tsx
│       │   │   │   ├── Avatar.tsx, EmptyState.tsx, Skeleton.tsx
│       │   │   │   └── ScreenHeader.tsx
│       │   │   ├── NewsTicker.tsx
│       │   │   └── NotificationPopup.tsx
│       │   └── stores/        # Mobile-specific store setup
│       └── package.json
│
├── backend/                    # Express API server
│   ├── src/
│   │   ├── config/            # Environment and service config
│   │   │   ├── index.ts       # Environment validation
│   │   │   ├── database.ts    # Prisma client (with driver adapter)
│   │   │   ├── redis.ts       # Redis client
│   │   │   ├── stripe.ts      # Stripe integration
│   │   │   ├── swagger.ts     # OpenAPI spec
│   │   │   └── sentry.ts      # Sentry initialization
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── modules/           # Feature modules (auth, menu, cart, order, staff, notification, analytics)
│   │   └── socket/            # Socket.io event handlers
│   ├── prisma/                # Database schema and migrations
│   ├── prisma.config.ts       # Prisma 7 configuration
│   └── package.json
│
├── docs/                       # Documentation
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

## Design System

### Typography
- **Font**: Plus Jakarta Sans (Google Fonts, variable weight 200-800)
- **Applied via**: CSS `font-family` in `index.css` body rule

### Color Architecture
The color system uses CSS custom properties (HSL) for theme support:

```
index.css (@theme block)
├── Light mode (:root)
│   --background, --foreground, --primary, --card, etc.
├── Dark mode (.dark)
│   --background, --foreground, --primary, --card, etc.
└── Extended palette
    --color-warm-50..900, --color-cream-*, --color-sage-*
```

**Web**: Colors applied via Tailwind CSS classes (`bg-primary`, `text-muted-foreground`)
**Mobile**: Colors imported from `@eato/shared/tokens` and used in StyleSheet

### Shared Design Tokens (`@eato/shared/tokens`)

```typescript
import { colors, typography, spacing, radii, shadows } from '@eato/shared/tokens';

colors.primary[500]  // '#ea580c'
typography.fontFamily.sans  // 'Plus Jakarta Sans'
spacing[4]          // '16px'
radii.xl            // '1rem'
shadows.glow        // '0 0 20px rgba(234, 88, 12, 0.2)'
```

### Animation System

30+ CSS animations defined in `index.css` `@theme` block:

| Animation | Use Case |
|-----------|----------|
| `animate-float` / `animate-float-slow` | Floating decorative elements |
| `animate-shimmer` | Loading skeleton shimmer |
| `animate-glow-pulse` | Active status indicators |
| `animate-gradient-shift` | Animated gradient text |
| `animate-bounce-in` | Logo/element entrance |
| `animate-scale-in` | Modal/dialog appearance |
| `animate-fade-in-up` | Page/section transitions |
| `animate-slide-up` | Cart item entrance |
| `stagger-children` | Cascading child animations |

### Utility CSS Classes

| Class | Effect |
|-------|--------|
| `glass` / `glass-strong` | Glass morphism (backdrop-blur + translucent bg) |
| `glow` / `glow-lg` | Orange glow box-shadow |
| `hover-lift` | translateY(-4px) + shadow on hover |
| `gradient-text` | Static gradient text |
| `gradient-text-animated` | Animated shifting gradient text |
| `food-gradient` | Orange-to-amber gradient background |
| `hero-gradient` | Radial gradient hero background |
| `shimmer-bg` | Shimmer loading background |
| `page-transition` | Fade-in-up page entrance |
| `scrollbar-hide` | Hidden scrollbar |

### Web Component Library (19 components)

Located at `packages/web/src/components/ui/`:

| Component | Variants | Key Features |
|-----------|----------|--------------|
| `Button` | default, destructive, outline, secondary, ghost, gradient, glow | Loading state, sizes (sm/md/lg/xl/icon) |
| `Card` | default, glass | Hover-lift, shadow depth |
| `Badge` | default, secondary, destructive, outline, success, warning, info | Pulse animation, dot indicator |
| `Input` | — | Label, error, icon, focus ring |
| `Avatar` | — | Image/fallback, 4 sizes |
| `Dialog` | — | Radix UI, open/close animations |
| `Tabs` | — | Radix UI, animated indicator |
| `Select` | — | Custom dropdown, label/error |
| `Switch` | — | Radix UI toggle |
| `Toast` | default, success, destructive, warning, info | Auto-dismiss, icons |
| `Sheet` | top, bottom, left, right | Slide-in panel |
| `Progress` | — | Animated bar, gradient fill |
| `Separator` | horizontal, vertical | Decorative divider |
| `Skeleton` | — | Pulse animation |
| `Spinner` | sm, default, lg | Loading indicator |
| `PageLoading` | — | Full-page centered loader |

### Mobile Component Library (8 components)

Located at `packages/mobile/src/components/ui/`:

| Component | Variants | Key Features |
|-----------|----------|--------------|
| `Button` | primary, secondary, outline, ghost, gradient | 3 sizes, loading, icon |
| `Card` | default, elevated, outlined | Shadow depth |
| `Input` | — | Label, focus/error states, icon |
| `Badge` | default, success, warning, error, info | 2 sizes |
| `Avatar` | — | Image/initials, 3 sizes |
| `EmptyState` | — | Icon, title, action |
| `Skeleton` | — | Animated pulse |
| `ScreenHeader` | — | Title, subtitle, actions |

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

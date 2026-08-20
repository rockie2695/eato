# Development Guide

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 9.0.0
- **PostgreSQL** (local or Docker)
- **Redis** (local or Docker)

## Getting Started

### 1. Install Dependencies

```bash
# From root
pnpm install
```

### 2. Start Services (Docker)

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Verify services
docker-compose ps
```

### 3. Configure Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

### 4. Initialize Database

```bash
cd backend

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed with demo data
pnpm prisma:seed
```

### 5. Start Development Servers

```bash
# From root - starts backend and web
pnpm dev

# Or start individually:
pnpm dev:backend    # http://localhost:5000
pnpm dev:web        # http://localhost:5173
pnpm dev:mobile     # Opens Expo Go
```

## Development Workflow

### Shared Package Changes

When modifying `@eato/shared`:

1. Edit files in `packages/shared/src/`
2. Run `pnpm build:shared` to compile
3. Both Web and Mobile will hot-reload

### Backend Changes

1. Edit files in `backend/src/`
2. Server auto-restarts (tsx watch)
3. Test with Postman or frontend
4. API docs auto-update at http://localhost:5000/api/docs

### Database Changes

1. Edit `backend/prisma/schema.prisma`
2. Run `pnpm prisma:migrate` to create migration
3. Run `pnpm prisma:generate` to update client
4. Consider adding seed data if needed

## Project Structure Conventions

### File Naming

- **Components**: `PascalCase.tsx` (e.g., `Button.tsx`)
- **Hooks**: `camelCase.ts` with `use` prefix (e.g., `useSocket.ts`)
- **Utilities**: `camelCase.ts` (e.g., `formatPrice.ts`)
- **Stores**: `camelCase.ts` with `Store` suffix (e.g., `authStore.ts`)
- **Types**: `camelCase.ts` (e.g., `index.ts` for barrel exports)

### Code Style

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use named exports (not default exports)
- Keep functions small and focused
- Add JSDoc comments for public APIs

### Component Structure

```typescript
/**
 * Component Name.
 *
 * Description of what the component does.
 *
 * @example
 * <Component prop1="value" prop2={value} />
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps {
  prop1: string;
  prop2?: number;
}

export function Component({ prop1, prop2 = 0 }: ComponentProps) {
  return (
    <div className={cn('base-classes', conditionalClass)}>
      {/* Content */}
    </div>
  );
}
```

## Testing

### Manual Testing

1. **Auth Flow**: Register → Login → Access protected routes → Logout
2. **Menu**: Browse → Filter → Search → View details
3. **Cart**: Add items → Update quantity → Remove → Clear
4. **Orders**: Create order → Track status → View history
5. **Admin**: Manage menu → Manage staff → Customize theme
6. **Loading States**: Verify skeleton loaders appear during data fetching
7. **Swagger**: Visit http://localhost:5000/api/docs to explore the API

### API Testing

Use the Swagger UI at http://localhost:5000/api/docs for interactive testing.

Or use tools like:
- Postman
- Insomnia
- cURL

```bash
# Example: Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@eato.com","password":"Customer123!"}'
```

### Socket.io Testing

Use Socket.io Client for testing real-time events:

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your-access-token' }
});

socket.on('order:statusUpdate', (data) => {
  console.log('Order updated:', data);
});
```

## Debugging

### Backend Logs

```bash
# View Docker logs
docker-compose logs -f postgres
docker-compose logs -f redis

# View backend logs (when using pnpm dev)
# Logs appear in terminal
```

### Database Inspection

```bash
cd backend
pnpm prisma:studio
# Opens Prisma Studio at http://localhost:5555
```

### Redis Inspection

```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli

# Common commands
KEYS *           # List all keys
GET cart:user123  # Get cart cache
DEL cart:user123  # Clear cart cache
```

## Common Issues

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <process-id> /F
```

### Database Connection Failed

1. Ensure PostgreSQL is running: `docker-compose ps`
2. Check `DATABASE_URL` in `.env`
3. Verify database exists: `docker-compose exec postgres psql -U postgres`

### Redis Connection Failed

1. Ensure Redis is running: `docker-compose ps`
2. Check `REDIS_URL` in `.env`
3. Test connection: `docker-compose exec redis redis-cli ping`

### Prisma Client Out of Date

```bash
cd backend
pnpm prisma:generate
```

## IDE Setup

### VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Importer
- Prisma

### Settings

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Loading States

The web frontend provides multiple loading indicators:

### Available Components

| Component | Use Case |
|-----------|----------|
| `Spinner` | Inline loading indicator with optional label |
| `Skeleton` | Animated placeholder matching content shape |
| `PageLoading` | Full-page centered loader with icon |
| `MenuSkeleton` | Grid layout skeleton for menu page |
| `OrderSkeleton` | Card list skeleton for orders page |
| `CartSkeleton` | Two-column layout skeleton for cart page |
| `HomeSkeleton` | Hero + features + grid skeleton |

### Usage

```tsx
import { Spinner } from '@/components/ui/spinner';
import { MenuSkeleton } from '@/components/ui/menu-skeleton';

// Inline spinner
<Spinner size="lg" label="Loading..." />

// Full page skeleton
if (loading) return <MenuSkeleton />;
```

## API Documentation

Swagger UI is available at http://localhost:5000/api/docs when the backend is running.

To add new endpoints to the docs, add `@swagger` JSDoc annotations to route files:

```typescript
/**
 * @swagger
 * /menu/items:
 *   get:
 *     tags: [Menu]
 *     summary: Get menu items
 *     responses:
 *       200:
 *         description: List of items
 */
router.get('/items', async (req, res) => { ... });
```

## Error Monitoring

Sentry is configured for error tracking (free tier):

- **Backend**: Errors automatically reported when `SENTRY_DSN` is set
- **Frontend**: Errors automatically reported when `VITE_SENTRY_DSN` is set
- **Performance**: Traces sampled at 20% in production
- **Replay**: Full replay captured on frontend errors

To test Sentry in development, temporarily enable it in `packages/web/src/sentry.ts`.

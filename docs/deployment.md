# Deployment Guide

## Overview

This guide covers deploying each component of the Eato system to production using free-tier services.

## Prerequisites

- GitHub account (for repository)
- Vercel account (free tier)
- Render account (free tier)
- Supabase account (free tier)
- Upstash account (free tier)
- Stripe account (for payments)

## 1. Database (Supabase)

1. Create a new project on [Supabase](https://supabase.com)
2. Note the connection string from Settings → Database
3. Format: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

## 2. Redis (Upstash)

1. Create a new database on [Upstash](https://upstash.com)
2. Select a region close to your backend
3. Note the Redis URL from the database details

## 3. Backend (Render)

### Setup

1. Push your code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pnpm install && pnpm prisma:generate && pnpm build`
   - **Start Command**: `pnpm start`
   - **Environment**: Node

### Environment Variables

Set these in Render's dashboard:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=<your-supabase-connection-string>
REDIS_URL=<your-upstash-redis-url>
JWT_SECRET=<generate-a-32-char-random-string>
JWT_REFRESH_SECRET=<generate-another-32-char-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
STRIPE_SECRET_KEY=<your-stripe-secret-key>
STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
WEB_URL=<your-vercel-deployment-url>
APP_URL=<your-expo-app-url>
```

### Generate Secrets

```bash
# Generate random secrets
openssl rand -hex 32
```

### Stripe Webhook

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-backend.onrender.com/api/v1/payments/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## 4. Web Frontend (Vercel)

### Setup

1. Create a new project on [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `packages/web`
   - **Build Command**: `pnpm install && pnpm build`
   - **Output Directory**: `dist`

### Environment Variables

```
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

### Custom Domain (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## 5. Mobile App (Expo EAS)

### Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
cd packages/mobile
eas build:configure
```

### Build for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

### Update API URL

In `packages/mobile/src/stores/index.ts`, update the API base URL:

```typescript
const apiClient = createApiClient(mobileStorage, 'https://your-backend.onrender.com/api/v1');
```

## 6. Verify Deployment

1. **Backend**: Visit `https://your-backend.onrender.com/health`
2. **Web**: Visit your Vercel URL
3. **Mobile**: Test with Expo Go or installed app
4. **Stripe**: Test a payment in Stripe test mode

## Free Tier Limitations

| Service | Free Tier Limit |
|---------|----------------|
| Supabase | 500MB database, 50K monthly active users |
| Upstash | 256MB storage, 10K daily commands |
| Render | 750 hours/month, spins down after inactivity |
| Vercel | 100GB bandwidth, serverless function execution |
| Stripe | No monthly fees, 2.9% + 30¢ per transaction |

### Render Spin-down

Render's free tier spins down after 15 minutes of inactivity. The first request after spin-down may take 30-60 seconds. Consider upgrading to a paid plan for production use.

## Production Checklist

- [ ] Environment variables set correctly
- [ ] Database migrations applied
- [ ] Stripe webhook configured
- [ ] CORS origins updated for production URLs
- [ ] JWT secrets are strong and unique
- [ ] Database backups enabled (Supabase)
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Rate limiting configured appropriately
- [ ] SSL/HTTPS enabled (automatic on all platforms)

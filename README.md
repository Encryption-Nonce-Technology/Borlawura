# Borlawura

Borlawura is a waste pickup platform that connects households and businesses with nearby collectors.

Users can take photos of waste, choose type and quantity, and request pickup from their location. Collectors can go online, view active requests, and accept jobs.

## What the app does

- Lets users request waste pickup in a few steps:
  - capture photos
  - select waste type and quantity
  - submit pickup request with location
- Shows pickup tracking flow after request submission
- Gives collectors a dashboard for active pickup requests
- Includes a wallet screen placeholder for collector earnings

## Tech stack

Frontend:
- Expo + React Native + Expo Router
- React Query + tRPC client

Backend:
- Node.js + Hono + tRPC server
- Drizzle ORM + SQLite (`better-sqlite3`)

## Project structure

- `app/` - Expo Router screens (user + collector flows)
- `backend/` - API server, tRPC routers, DB schema
- `lib/trpc.ts` - shared tRPC client setup
- `constants/colors.ts` - brand and theme constants
- `assets/images/` - app icon, splash, adaptive icon, favicon

## User flow

1. Choose role (User or Collector)
2. User path:
   - open map/home
   - capture waste photos
   - set waste details
   - create pickup request
   - track status updates
3. Collector path:
   - toggle online status
   - view available requests
   - open request details

## Local setup

### Prerequisites

- Node.js (LTS recommended)
- npm

### Install dependencies

```bash
npm install --legacy-peer-deps
```

### Initialize database

```bash
npm run db:push
```

### Start backend

```bash
npm run start-backend
```

Backend runs at:
- `http://localhost:3000`

### Start app (native/dev server)

```bash
npm run start
```

### Start app (web)

```bash
npx rork start -p boi5ou8x4jjj9rp7w61tm --web --port 8084 --clear
```

Web app runs at:
- `http://localhost:8084`

## Environment variables

Optional:

- `EXPO_PUBLIC_API_BASE_URL`

If not set, the app falls back to localhost defaults in `lib/trpc.ts`.

## API overview

Main tRPC router:
- `pickups.create`
- `pickups.getById`
- `pickups.updateStatus`
- `pickups.getActiveRequests`
- `pickups.getCollectorById`
- `pickups.getCollectorPickups`

## Current status

- Core request and collector flows are implemented
- Collector assignment is currently simulated in-process
- Wallet data is currently mock/placeholder

## Feature status (requested upgrades)

- Show collector moving toward user: **Partial** (status + location exist, not true live tracking)
- Payments (MTN MoMo / Vodafone Cash / AirtelTigo): **Not implemented**
- Ratings and reviews (user rates collector, collector rates user): **Not implemented**
- Auto-cost from waste type + quantity + distance: **Partial** (quantity-only pricing currently)
- Subscription plans (weekly/monthly): **Not implemented**
- Admin dashboard (users, collectors, requests, analytics): **Not implemented**
- Collector wallet (real earnings, completed jobs, withdrawal): **Partial** (screen exists, mock data)
- Community pickup mode: **Not implemented**
- Route optimization: **Not implemented**
- Before and after proof photos: **Not implemented**
- SOS cleanup requests: **Not implemented**
- Offline mode with sync: **Not implemented**
- Phone + OTP authentication: **Not implemented**

## Delivery roadmap

### Phase 1 - Core trust and operations (highest priority)

1. Authentication (phone number + OTP)
2. Admin dashboard (users, collectors, requests, analytics)
3. Collector wallet upgrade (real earnings + withdrawal pipeline)
4. Payment rails integration (MoMo + cash options)

### Phase 2 - Request and pricing intelligence

1. Cost engine v2:
   - base by quantity
   - multipliers by waste type
   - distance component
   - urgency premium
2. SOS cleanup requests (higher fee + priority dispatch)
3. Before and after proof (collector completion evidence)
4. Ratings and reviews (two-way)

### Phase 3 - Logistics and growth

1. Live collector movement to user (real location streaming)
2. Route optimization for multi-pickup runs
3. Community pickup mode (neighborhood batching + shared cost)
4. Subscription plans (weekly and monthly)

### Phase 4 - Reliability

1. Offline mode:
   - queue requests when offline
   - sync when internet returns
2. Conflict handling and retry strategy
3. Background sync instrumentation

## Suggested implementation order (engineering)

1. Add auth tables + OTP flow (backend + app)
2. Add user/collector identity to all pickup routes
3. Add payment domain tables and payment intent state machine
4. Upgrade wallet from mock to DB-backed earnings ledger
5. Build admin web dashboard (separate app) with protected routes
6. Introduce pricing service module and migrate `pickups.create` pricing logic
7. Add live tracking service (collector location heartbeat)
8. Add route optimization + neighborhood grouping
9. Add offline queue and sync worker on client

## New domain modules to add

Backend:
- `auth` (OTP, session/token, role checks)
- `payments` (charge, verify, payout/withdraw)
- `pricing` (waste + quantity + distance + urgency)
- `ratings` (mutual review records)
- `subscriptions` (plans, enrollment, renewal state)
- `tracking` (collector live location updates)
- `admin` (analytics and operational queries)

Frontend:
- `app/(auth)/` for login + OTP verification
- `app/(admin)/` or separate admin web app for operations
- `app/(collector)/wallet` connected to backend earnings
- `offline queue` service for pending requests

## Immediate next sprint (build now)

If we start implementation now, the best first sprint is:

1. Phone + OTP auth
2. Role-based session handling
3. Real collector wallet data model + APIs
4. Admin dashboard MVP (users, collectors, requests, totals)

## Brand

- App name: **Borlawura**
- Tagline: **Snap it. Request it. It's gone.**
- Currency: **GHS (₵)**


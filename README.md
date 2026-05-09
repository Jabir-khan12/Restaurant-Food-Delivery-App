# FlavourFleet — Restaurant & Food Delivery Platform

A production-grade food delivery platform built as a monorepo with Express, React, and background workers.

## Architecture

```
apps/
  api/       → Express REST API + Socket.io (Node.js)
  web/       → Customer-facing React SPA (Vite)
  admin/     → Admin dashboard React SPA (Vite)
  worker/    → Background job processors (BullMQ)
packages/
  types/     → Shared Zod schemas & enums
  config/    → Environment validation
```

## Tech Stack

| Layer        | Technology                                      |
| ------------ | ----------------------------------------------- |
| Runtime      | Node.js 20+                                     |
| API          | Express, Socket.io, Zod validation              |
| Database     | MongoDB (Mongoose)                               |
| Cache/Queue  | Redis, BullMQ                                    |
| Auth         | JWT (access + refresh tokens), Argon2            |
| Frontend     | React 18, Vite, TailwindCSS, Radix UI           |
| State        | Zustand, TanStack React Query                   |
| Payments     | Stripe                                           |
| Email        | Resend                                           |
| Storage      | Cloudinary                                       |
| Monorepo     | Turborepo, pnpm workspaces                      |

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9
- **MongoDB** (local or Atlas URI)
- **Redis** (local or cloud)

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/worker/.env.example apps/worker/.env

# 3. Edit each .env file with your credentials

# 4. Start all services in development
pnpm dev

# 5. (Optional) Seed the database
cd apps/api && node src/scripts/seed.js
```

### Default Ports

| Service | URL                    |
| ------- | ---------------------- |
| API     | http://localhost:5000  |
| Web     | http://localhost:3000  |
| Admin   | http://localhost:3001  |

## Scripts

| Command            | Description                |
| ------------------ | -------------------------- |
| `pnpm dev`         | Start all apps in dev mode |
| `pnpm build`       | Build all apps             |
| `pnpm lint`        | Run linters                |
| `pnpm test`        | Run tests                  |
| `pnpm clean`       | Remove build artifacts     |
| `pnpm format`      | Format code with Prettier  |

## Docker Deployment

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f api

# Stop
docker compose down
```

Services exposed:
- **Web**: http://localhost:3000
- **Admin**: http://localhost:3001
- **API**: http://localhost:5000

## API Endpoints

| Resource        | Base Path                |
| --------------- | ------------------------ |
| Auth            | `/api/v1/auth`           |
| Restaurants     | `/api/v1/restaurants`    |
| Menu            | `/api/v1/menu`           |
| Cart            | `/api/v1/cart`           |
| Orders          | `/api/v1/orders`         |
| Addresses       | `/api/v1/addresses`      |
| Riders          | `/api/v1/riders`         |
| Reviews         | `/api/v1/reviews`        |
| Notifications   | `/api/v1/notifications`  |
| Health Check    | `/healthz`               |

## Environment Variables

See `.env.example` files in each app directory for the complete list.

## License

Private — All rights reserved.

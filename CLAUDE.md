# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run start:dev       # Run with hot reload (watch mode)
npm run start:debug     # Run with debugger

# Build & Production
npm run build           # Compile with nest build
npm run start:prod      # Run compiled output (dist/main)

# Code Quality
npm run lint            # ESLint with auto-fix
npm run format          # Prettier formatting

# Testing
npm run test            # Unit tests (Jest)
npm run test:watch      # Unit tests in watch mode
npm run test:cov        # Coverage report
npm run test:e2e        # End-to-end tests
```

To run a single test file: `npx jest path/to/spec.ts`

## Environment Variables

Create a `.env` file in the root:

```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=root
POSTGRES_DATABASE=nest
JWT_SECRET=your-secret-here
```

The app also requires a local PostgreSQL instance. TypeORM runs with `synchronize: true` in non-production environments (disabled when `NODE_ENV=production`).

## Architecture

This is a **NestJS monolith** (not a microservice setup). The app exposes REST endpoints and a Socket.io WebSocket server on the same port (3000).

### Modules

- **UserModule** — signup, login, profile. Uses Passport with LocalStrategy (email/password) and JwtStrategy (Bearer token).
- **AuctionsModule** — CRUD for auctions, bidding, image uploads. `AuctionsService` internally connects as a Socket.io *client* to the same server to broadcast bid events.
- **MyGateway** — WebSocket server. Clients join rooms by auction ID (`joinRoom` event). Bid events are broadcast room-wide: `{ type: 'bid', bidAmount, userId }`.
- **TaskService** — Cron job runs every minute (`* * * * *`) to transition auctions from `pending` → `active` when their `startDate` has passed.

### Database (PostgreSQL + TypeORM)

Three entities:
- **User** — `id`, `name`, `email`, `password` (bcrypt-hashed), `isAdmin`
- **Auction** — `id`, `itemName`, `description`, `ownerId`, `winnerId`, `image` (filename), `status` (`pending`/`active`/`closed`/`cancelled`), `startDate`
- **AuctionToUser** — junction table for bids with `auctionId`, `userId`, `bidAmount`

### Authentication

JWT secret is read from the `JWT_SECRET` env variable (set in `.env`). Tokens are passed as `Authorization: Bearer <token>`. Guards are applied per-route using `@UseGuards(JwtAuthGuard)`.

### File Uploads

Auction images are stored locally in `itemImages/` (excluded from git). Images are served via `GET /auctions/image/:imgName`.

### API Documentation

Swagger UI is available at `http://localhost:3000/api` when the app is running.

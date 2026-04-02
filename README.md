# Auctioneer

A real-time online auction platform built with NestJS, PostgreSQL, and Socket.io.

## Features

- User registration and JWT authentication
- Create and manage auctions with scheduled start and end dates
- Real-time bidding via WebSocket (Socket.io)
- Proxy / max bidding — the system auto-bids on your behalf up to your limit
- Buy Now — instantly close an auction at a fixed price
- Reserve price — no winner if bidding doesn't meet the minimum
- Auction extension — end time is automatically extended when a bid comes in near closing
- Buyer's premium — configurable fee shown as effective price on each bid
- In-app notifications — get notified when outbid, when you win, or when an auction closes
- Auction analytics — view count, unique bidders, bid timeline
- Cancel and relist auctions
- Multiple image uploads per auction
- Automatic auction lifecycle management via cron jobs
- Swagger API documentation

## Tech Stack

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL via TypeORM
- **Auth:** Passport.js — LocalStrategy + JwtStrategy
- **WebSocket:** Socket.io
- **File uploads:** Multer
- **Scheduling:** @nestjs/schedule (cron jobs)
- **Docs:** Swagger / OpenAPI

## Getting Started

### With Docker (recommended)

Make sure Docker Desktop is running, then:

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`.

### Without Docker

1. Make sure a PostgreSQL instance is running locally.

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root:
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-db-password
POSTGRES_DATABASE=nest
JWT_SECRET=your-jwt-secret
```

4. Start the development server:
```bash
npm run start:dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `POSTGRES_HOST` | PostgreSQL host |
| `POSTGRES_PORT` | PostgreSQL port (default 5432) |
| `POSTGRES_USER` | PostgreSQL user |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DATABASE` | Database name |
| `JWT_SECRET` | Secret key for signing JWT tokens |

## API Documentation

Swagger UI is available at `http://localhost:3000/api` when the app is running.

## Available Scripts

```bash
npm run start:dev     # Development with hot reload
npm run build         # Compile TypeScript
npm run start:prod    # Run compiled output
npm run lint          # ESLint with auto-fix
npm run test          # Unit tests
npm run test:cov      # Unit tests with coverage report
npm run test:e2e      # End-to-end tests
```

## Project Structure

```
src/
├── auctions/
│   ├── controllers/     # REST endpoints
│   ├── dto/             # Request validation
│   └── services/
│       ├── auctions/    # Core auction & bidding logic
│       └── task/        # Cron job (open/close auctions)
├── my-gateway/          # Socket.io WebSocket gateway
├── typeorm/             # TypeORM entities
└── user/
    ├── controllers/     # Auth & profile endpoints
    ├── dto/
    └── services/
        ├── auth/        # JWT & local auth strategies
        └── user/        # User management
```

## WebSocket Events

Clients connect and join an auction room by emitting `joinRoom` with the auction ID. Bid updates are broadcast to the room:

```json
{ "type": "bid", "bidAmount": 350, "userId": 2, "effectivePrice": 367.5 }
```

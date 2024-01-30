# Booking App

## Introduction

This booking app is a simple demonstration of a room booking system, showcasing key technologies and patterns in software development.

## Technology Stack

- Node.js (LTS version 20.11.0)
- NestJS
- PostgreSQL
- Prisma (ORM)
- Redis (Caching)
- RabbitMQ (Message Queue)
- Swagger (Documentation)
- pnpm (Package Manager)

## Getting Started

Install dependencies:
```bash
pnpm install
```
Start the app with Docker Compose:
```bash
pnpm run docker:up
```
Stop the app:
```bash
pnpm run docker:down
```
## Database Migrations

Run migrations:
```bash
pnpm run db:migrate
```
Seed the database (optional):
```bash
pnpm run db:seed
```
Reset the database and migrate (optional):
```bash
pnpm run db:migrate:reset
```

## Accessing Documentation
:memo: **Swagger API:** documentation is available at http://localhost:3000/api.

:memo: **Postman Collection:** collection for API testing is available at http://localhost:3000/api-json.


## Architecture Highlights:
- Caching Strategy: Redis caching is used for room availability checks.
- Message Queue: RabbitMQ handles asynchronous tasks like email notifications.
- Database Design: Efficient management of bookings and tracking room availability.

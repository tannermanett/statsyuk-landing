# Statsyuk Monorepo

This repository contains:

- `apps/landing`: Next.js landing page
- `apps/nhl-api`: Express + Postgres API and static site (from NHL-Database)

## Development

- Start landing (Next.js):
  - pnpm run dev:landing
- Start API (Express on port 3001):
  - pnpm run dev:api
- Start both (Windows PowerShell):
  - pnpm run dev

## Deploy

- Host `apps/landing` (Next.js) on Vercel or similar
- Host `apps/nhl-api` (Express) on your server/Render/Railway (ensure `PORT`, `DATABASE_URL`, `QUERYPASSWORD` envs)

## Environment variables

- Landing (Next.js):
  - NEXT_PUBLIC_APP_URL
  - WAITLIST_SHEET_WEBHOOK_URL (optional)
- API (Express):
  - PORT (default 3001)
  - DATABASE_URL
  - QUERYPASSWORD



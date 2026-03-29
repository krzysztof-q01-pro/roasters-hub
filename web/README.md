# Roasters Hub — Web Application

Katalog palarni specialty coffee. Platforma B2B łącząca roasterów z kawiarniami i konsumentami.

**Live:** https://beanmap-web.vercel.app

---

## Stack

Next.js 16.2.1 · TypeScript 5 · Tailwind CSS v4 · Prisma 7.5 · Vercel Postgres (Neon) · Clerk · Uploadthing · Resend

## Quick Start

```bash
# 1. Zainstaluj zależności (generuje Prisma client via postinstall)
cd web && npm install

# 2. Skonfiguruj zmienne środowiskowe
cp .env.example .env.local
# → Wypełnij wartościami: DATABASE_URL, DIRECT_URL (Vercel Postgres),
#   CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
#   UPLOADTHING_TOKEN, RESEND_API_KEY

# 3. Uruchom migracje i seed
npx prisma migrate dev
npx prisma db seed

# 4. Uruchom dev server
npm run dev
# → http://localhost:3000
```

## Aktualny Stan

Sprawdź [`/PROJECT_STATUS.md`](../PROJECT_STATUS.md) — co działa, co nie, co jest następne.

## Agent Instructions

Patrz [`AGENTS.md`](AGENTS.md) w tym katalogu — konwencje, wersje stacku, ISR rules.

## Dokumentacja

- **Nawigacja:** [`docs/OVERVIEW.md`](../docs/OVERVIEW.md)
- **Architektura:** [`docs/architecture/`](../docs/architecture/)
- **Design:** [`docs/design/stitch-brief.md`](../docs/design/stitch-brief.md)
- **Roadmap:** [`/ROADMAP.md`](../ROADMAP.md)

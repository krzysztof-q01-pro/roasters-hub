# Roasters Hub — Web Application

Katalog palarni specialty coffee. Platforma B2B łącząca roasterów z kawiarniami i konsumentami.

**Live:** https://beanmap-web.vercel.app _(Basic HTTP Auth — preview only)_

---

## Stack

Next.js 16.2.1 · TypeScript 5 · Tailwind CSS v4 · Prisma 7.5 · Supabase · Vercel

## Quick Start

```bash
# 1. Zainstaluj zależności
cd web && npm install

# 2. Skonfiguruj zmienne środowiskowe
cp .env.example .env.local
# → Wypełnij wartościami z Supabase project settings

# 3. Uruchom migracje i seed
npx prisma migrate dev
npx prisma db seed

# 4. Uruchom dev server
npm run dev
# → http://localhost:3000
```

## Aktualny Stan

Sprawdź [`/PROJECT_STATUS.md`](../PROJECT_STATUS.md) — co działa, co nie, co jest następne.

**Krótko:** Frontend 95% gotowy na mock data. Backend (DB, Auth, Server Actions) nie zaczęty.

## Struktura Aplikacji

```
src/
├── app/                    # Next.js App Router — strony
│   ├── page.tsx            # Homepage
│   ├── roasters/           # Katalog + profile (/roasters/[slug])
│   ├── map/                # Interaktywna mapa
│   ├── register/           # Formularz rejestracji palarni
│   └── admin/pending/      # Panel admina
├── components/
│   ├── roasters/           # RoasterCard, RoasterFilters, RoasterMap, ...
│   └── shared/             # Header, Footer
├── lib/
│   ├── db.ts               # Prisma client (aktualnie zakomentowany!)
│   ├── mock-data.ts        # 12 mock palarni — tymczasowe
│   └── utils.ts
├── types/
│   └── certifications.ts   # Enums: certyfikaty, style palenia, pochodzenia
└── middleware.ts           # Basic Auth (tymczasowy — zastąpić Supabase Auth)
```

## Dokumentacja

- **Architektura:** [`docs/architecture/`](../docs/architecture/)
- **Design:** [`docs/design/stitch-brief.md`](../docs/design/stitch-brief.md)
- **Roadmap:** [`/ROADMAP.md`](../ROADMAP.md)

## Agent Instructions

Patrz [`AGENTS.md`](AGENTS.md) w tym katalogu.

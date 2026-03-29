# Project Status

> **This is the ONLY file that describes CURRENT reality.**
> Architecture docs (`docs/architecture/`) describe INTENT — what the system should look like.
> When they conflict with this file, **this file wins.**

---

## Last Updated
2026-03-29 | Integrated agent work: email notifications, reviews, cafe accounts, partner API, PWA, newsletter

---

## Confirmed Stack

| Warstwa | Technologia | Status |
|---------|-------------|--------|
| Framework | Next.js 16.2.1 (App Router) | ✅ deployed |
| DB | **Vercel Postgres (Neon)** | ✅ provisioned, 4 migrations (init + reviews + cafe + api_keys), 9 models, 50 seed roasters |
| ORM | Prisma 7.5 + @prisma/adapter-neon | ✅ schema ready, singleton active (`db`), Neon adapter configured |
| Auth | **Clerk** (`@clerk/nextjs`) | ✅ ClerkProvider in layout, sign-in/sign-up routes, clerkMiddleware, auth helpers |
| Storage | **Uploadthing** (MVP) → Cloudflare R2 (growth) | ✅ configured, route handler + dashboard upload UI |
| Hosting | Vercel | ✅ deployed |
| Email | Resend | ✅ 3 transactional emails (registration, verified, rejected) + newsletter digest |
| Analytics | Plausible | ✅ script tag gated by env var |

---

## What Is Deployed and Working

- Homepage `/` — **ISR (1h)**, Prisma queries, fully styled
- Catalog `/roasters` — **ISR (1h)**, filters, search, pagination — Prisma queries
- Roaster profiles `/roasters/[slug]` — **ISR (1h)**, Prisma queries, related roasters
- Interactive map `/map` — **ISR (1h)**, Leaflet, Prisma queries for markers
- Registration form `/register` — 3-step wizard, **connected to Server Action** (creates PENDING roaster in DB)
- Admin panel UI `/admin/pending` — verify/reject UI, **connected to Server Actions**
- Profile event tracking — `trackEvent` Server Action records PAGE_VIEW, WEBSITE_CLICK, SHOP_CLICK, CONTACT_CLICK to `profile_events` table
- SEO country pages `/roasters/country/[country]` — **ISR (1h)**, `generateStaticParams`, Prisma queries
- Roaster dashboard `/dashboard/roaster` — profile editing, analytics stats, Clerk-protected
- Email notifications — Resend: registration notification, verify/reject emails (`lib/email.ts`)
- Reviews system — submit, approve/reject moderation, display on roaster profiles (`/admin/reviews`)
- Cafe accounts — CAFE role, save/unsave roasters (`/dashboard/cafe`)
- Partner API — `GET /api/v1/roasters`, `GET /api/v1/roasters/[slug]`, ApiKey auth (`lib/api-auth.ts`)
- Newsletter digest — `POST /api/newsletter/digest` (cron-triggered)
- PWA — manifest.json, apple-web-app meta, theme color
- **Versioning:** `package.json` version displayed in footer, npm scripts `version:patch/minor/major`
- **Deploy:** https://beanmap-web.vercel.app (protected by Clerk auth on /admin routes)

---

## What Is Built But NOT Connected to Backend

| Feature | File | What's Missing |
|---------|------|----------------|
| ~~Newsletter signup~~ | ~~`web/src/app/page.tsx`~~ | **DONE** — connected to `subscribeNewsletter` action |

---

## What Does NOT Exist Yet (despite being documented in architecture docs)

_(All planned files now exist)_

**Removed (no longer needed):**
```
web/src/lib/supabase.ts       — NOT NEEDED (replaced by Clerk)
```

**Note:** `web/src/lib/db.ts` — Prisma singleton with Neon adapter, eksportuje `db`.

---

## Active Work

**@MN:** —
**@KK:** —
**@AGENT:** —

_Przypisz zadania na weekly sync (poniedziałek). Format: `**@TAG:** opis — data`_

**Completed recently:**
- ✅ Agent work integrated: email, reviews, cafe, API, PWA, newsletter (2026-03-29)
- ✅ Image upload via Uploadthing — route handler, dashboard dropzone, delete action (2026-03-28)
- ✅ Phase 2 audit (12 issues) — all CRITICAL/HIGH/MEDIUM fixed (2026-03-28)

**Remaining before production seed:** run `prisma db seed` on prod to apply 50 roasters.

---

## Next Unblocked Task

**TERAZ:** Code Review (@MN) — przegląd nowego kodu z integracji agenta (actions, auth, components, security). Patrz ROADMAP sekcja "Code Review".

**HUMAN ONLY blockers:** re-seed prod DB (`prisma db seed`), run new migrations on prod, buy production domain.

See `ROADMAP.md` for full task list.

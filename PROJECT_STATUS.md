# Project Status

> **This is the ONLY file that describes CURRENT reality.**
> Architecture docs (`docs/architecture/`) describe INTENT — what the system should look like.
> When they conflict with this file, **this file wins.**

---

## Last Updated
2026-03-28 | Phase 1 Tydzień 2 COMPLETE — all Go/No-Go items ✅, 50 seed roasters, admin bootstrap ready

---

## Confirmed Stack

| Warstwa | Technologia | Status |
|---------|-------------|--------|
| Framework | Next.js 16.2.1 (App Router) | ✅ deployed |
| DB | **Vercel Postgres (Neon)** | ✅ provisioned, migration `init` applied (6 tabel), 50 seed roasters (global) |
| ORM | Prisma 7.5 + @prisma/adapter-neon | ✅ schema ready, singleton active (`db`), Neon adapter configured |
| Auth | **Clerk** (`@clerk/nextjs`) | ✅ ClerkProvider in layout, sign-in/sign-up routes, clerkMiddleware, auth helpers |
| Storage | **Uploadthing** (MVP) → Cloudflare R2 (growth) | ⏳ not configured |
| Hosting | Vercel | ✅ deployed |
| Email | Resend | ⏳ not configured |
| Analytics | Plausible | ⏳ not configured |

---

## What Is Deployed and Working

- Homepage `/` — **ISR (1h)**, Prisma queries, fully styled
- Catalog `/roasters` — **ISR (1h)**, filters, search, pagination — Prisma queries
- Roaster profiles `/roasters/[slug]` — **ISR (1h)**, Prisma queries, related roasters
- Interactive map `/map` — **ISR (1h)**, Leaflet, Prisma queries for markers
- Registration form `/register` — 3-step wizard, **connected to Server Action** (creates PENDING roaster in DB)
- Admin panel UI `/admin/pending` — verify/reject UI, **connected to Server Actions**
- Profile event tracking — `trackEvent` Server Action records PAGE_VIEW, WEBSITE_CLICK, SHOP_CLICK, CONTACT_CLICK to `profile_events` table
- **Versioning:** `package.json` version displayed in footer, npm scripts `version:patch/minor/major`
- **Deploy:** https://beanmap-web.vercel.app (protected by Clerk auth on /admin routes)

---

## What Is Built But NOT Connected to Backend

| Feature | File | What's Missing |
|---------|------|----------------|
| Newsletter signup | `web/src/app/page.tsx` | Form exists, no handler |

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

Phase 1 Tydzień 2 COMPLETE. All Go/No-Go items satisfied:
- Registration form → Vercel Postgres ✅
- Admin login (Clerk) + verify/reject ✅
- Verified roasters in catalog ✅
- Basic HTTP Auth removed ✅
- 50 seed roasters VERIFIED ✅ (expanded from 24 to 50: DK, SE, NL, FR, CZ, UK, US, CA, AU, JP, ET, KE, BR)
- Error monitoring (Vercel logs) ✅
- Admin user auto-bootstrap via `ensureUserProfile()` in `requireAdmin()` ✅

**Remaining before production seed:** run `prisma db seed` on prod to apply 50 roasters.

---

## Next Unblocked Task

**Phase 2 (Post-Launch):** Email notifications via Resend, or roaster dashboard.

**HUMAN ONLY blockers:** re-seed prod DB (`prisma db seed`), set Clerk Google OAuth, buy production domain.

See `ROADMAP.md` for full task list.

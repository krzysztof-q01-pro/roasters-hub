# Project Status

> **This is the ONLY file that describes CURRENT reality.**
> Architecture docs (`docs/architecture/`) describe INTENT — what the system should look like.
> When they conflict with this file, **this file wins.**

---

## Last Updated
2026-03-26 | Stack decision: Vercel Postgres + Clerk + Uploadthing

---

## Confirmed Stack

| Warstwa | Technologia | Status |
|---------|-------------|--------|
| Framework | Next.js 16.2.1 (App Router) | ✅ deployed |
| DB | **Vercel Postgres (Neon)** | ⏳ not provisioned |
| ORM | Prisma 7.5 | ✅ schema ready |
| Auth | **Clerk** (`@clerk/nextjs`) | ⏳ not installed |
| Storage | **Uploadthing** (MVP) → Cloudflare R2 (growth) | ⏳ not configured |
| Hosting | Vercel | ✅ deployed |
| Email | Resend | ⏳ not configured |
| Analytics | Plausible | ⏳ not configured |

---

## What Is Deployed and Working

- Homepage `/` — SSG, mock data, fully styled
- Catalog `/roasters` — filters, search, pagination — mock data
- Roaster profiles `/roasters/[slug]` — ISR, mock data
- Interactive map `/map` — Leaflet, client-side, mock data
- Registration form UI `/register` — 3-step wizard, **no submission handler**
- Admin panel UI `/admin/pending` — verify/reject UI, **no persistence**
- **Deploy:** https://beanmap-web.vercel.app (protected by Basic HTTP Auth)

---

## What Is Built But NOT Connected to Backend

| Feature | File | What's Missing |
|---------|------|---------------|
| Registration form | `web/src/app/register/page.tsx` | `handleSubmit` is a TODO stub — no Server Action |
| Admin verify/reject | `web/src/app/admin/pending/page.tsx` | Client-state only — no DB writes |
| Newsletter signup | `web/src/app/page.tsx` | Form exists, no handler |
| Map markers | `web/src/app/map/page.tsx` | Hard-coded mock coordinates |

---

## What Does NOT Exist Yet (despite being documented in architecture docs)

```
web/src/actions/              — DOES NOT EXIST
web/src/lib/auth.ts           — DOES NOT EXIST
web/src/lib/slug.ts           — DOES NOT EXIST
web/src/types/actions.ts      — DOES NOT EXIST
web/prisma/seed.ts            — DOES NOT EXIST
web/prisma/migrations/        — DOES NOT EXIST (no DB provisioned yet)
web/.env.local                — DOES NOT EXIST (credentials not provided)
```

**Removed (no longer needed):**
```
web/src/lib/supabase.ts       — NOT NEEDED (replaced by Clerk)
```

**Note:** `web/src/lib/db.ts` — Prisma singleton aktywny, eksportuje `db`.

---

## Active Work

Stack decision confirmed. Documentation update in progress.

---

## Next Unblocked Task

**Phase 1, Tydzień 1:** Stworzyć `web/src/types/actions.ts` — `ActionResult<T>` + `CreateRoasterSchema` (Zod)
```
DATABASE_URL=...
DIRECT_URL=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
```

See `ROADMAP.md` for full task list.

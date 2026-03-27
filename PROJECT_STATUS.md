# Project Status

> **This is the ONLY file that describes CURRENT reality.**
> Architecture docs (`docs/architecture/`) describe INTENT — what the system should look like.
> When they conflict with this file, **this file wins.**

---

## Last Updated
2026-03-27 | Phase 1 Tydzień 2 in progress — Clerk auth + admin actions wired

---

## Confirmed Stack

| Warstwa | Technologia | Status |
|---------|-------------|--------|
| Framework | Next.js 16.2.1 (App Router) | ✅ deployed |
| DB | **Vercel Postgres (Neon)** | ✅ provisioned, migration `init` applied (6 tabel), 22 seed roasters (PL+DE focus) |
| ORM | Prisma 7.5 + @prisma/adapter-neon | ✅ schema ready, singleton active (`db`), Neon adapter configured |
| Auth | **Clerk** (`@clerk/nextjs`) | ✅ ClerkProvider in layout, sign-in/sign-up routes, clerkMiddleware, auth helpers |
| Storage | **Uploadthing** (MVP) → Cloudflare R2 (growth) | ⏳ not configured |
| Hosting | Vercel | ✅ deployed |
| Email | Resend | ⏳ not configured |
| Analytics | Plausible | ⏳ not configured |

---

## What Is Deployed and Working

- Homepage `/` — SSR, **Prisma queries**, fully styled
- Catalog `/roasters` — filters, search, pagination — **Prisma queries**
- Roaster profiles `/roasters/[slug]` — **Prisma queries**, related roasters
- Interactive map `/map` — Leaflet, **Prisma queries** for markers
- Registration form `/register` — 3-step wizard, **connected to Server Action** (creates PENDING roaster in DB)
- Admin panel UI `/admin/pending` — verify/reject UI, **connected to Server Actions**
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

Phase 1 Tydzień 2 nearly complete. All agent tasks done. Remaining: bootstrap admin user (HUMAN ONLY — set role in Clerk Dashboard).

---

## Next Unblocked Task

**Phase 1, Tydzień 2:** Bootstrap admin user (HUMAN ONLY — Clerk Dashboard → `publicMetadata: { "role": "ADMIN" }`)

See `ROADMAP.md` for full task list.

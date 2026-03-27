# Project Status

> **This is the ONLY file that describes CURRENT reality.**
> Architecture docs (`docs/architecture/`) describe INTENT — what the system should look like.
> When they conflict with this file, **this file wins.**

---

## Last Updated
2026-03-27 | Phase 1 Tydzień 2 in progress — Clerk auth + admin actions wired, versioning + ISR added

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

- Homepage `/` — **ISR (1h)**, Prisma queries, fully styled
- Catalog `/roasters` — **ISR (1h)**, filters, search, pagination — Prisma queries
- Roaster profiles `/roasters/[slug]` — **ISR (1h)**, Prisma queries, related roasters
- Interactive map `/map` — **ISR (1h)**, Leaflet, Prisma queries for markers
- Registration form `/register` — 3-step wizard, **connected to Server Action** (creates PENDING roaster in DB)
- Admin panel UI `/admin/pending` — verify/reject UI, **connected to Server Actions**
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

Phase 1 Tydzień 2 nearly complete. All agent tasks done. Admin user bootstrapped (`marek.nadra@gmail.com` has `publicMetadata: { "role": "ADMIN" }` in Clerk). Remaining: re-seed production DB with 22 roasters (seed.ts updated, needs `prisma db seed` on prod).

Latest: App versioning system added (v0.1.0). ISR (revalidate=3600) applied to all DB-backed pages. All Server Actions revalidate affected paths including homepage.

---

## Next Unblocked Task

**Phase 1, Tydzień 2:** Bootstrap admin user — UserProfile w DB (Clerk role already set for `marek.nadra@gmail.com`)

See `ROADMAP.md` for full task list.

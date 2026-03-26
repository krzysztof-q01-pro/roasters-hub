# Project Status

> **This is the ONLY file that describes CURRENT reality.**
> Architecture docs (`docs/architecture/`) describe INTENT — what the system should look like.
> When they conflict with this file, **this file wins.**

---

## Last Updated
2026-03-26 | Phase 1 Tydzień 1 complete — backend connected, seed done

---

## Confirmed Stack

| Warstwa | Technologia | Status |
|---------|-------------|--------|
| Framework | Next.js 16.2.1 (App Router) | ✅ deployed |
| DB | **Vercel Postgres (Neon)** | ✅ provisioned, migration `init` applied (6 tabel), 12 seed roasters |
| ORM | Prisma 7.5 + @prisma/adapter-neon | ✅ schema ready, singleton active (`db`), Neon adapter configured |
| Auth | **Clerk** (`@clerk/nextjs`) | ✅ installed, ⏳ not configured (no ClerkProvider) |
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
- Admin panel UI `/admin/pending` — verify/reject UI, **no persistence** (Tydzień 2)
- **Deploy:** https://beanmap-web.vercel.app (protected by Basic HTTP Auth)

---

## What Is Built But NOT Connected to Backend

| Feature | File | What's Missing |
|---------|------|---------------|
| Admin verify/reject | `web/src/app/admin/pending/page.tsx` | Client-state only — no DB writes |
| Newsletter signup | `web/src/app/page.tsx` | Form exists, no handler |

---

## What Does NOT Exist Yet (despite being documented in architecture docs)

```
web/src/lib/auth.ts           — DOES NOT EXIST (Tydzień 2)
```

**Removed (no longer needed):**
```
web/src/lib/supabase.ts       — NOT NEEDED (replaced by Clerk)
```

**Note:** `web/src/lib/db.ts` — Prisma singleton with Neon adapter, eksportuje `db`.

---

## Active Work

Phase 1 Tydzień 1 complete. Starting Tydzień 2 — Auth (Clerk) + Admin.

---

## Next Unblocked Task

**Phase 1, Tydzień 2:** Konfiguracja `ClerkProvider` w layout.tsx + sign-in/sign-up routes

See `ROADMAP.md` for full task list.

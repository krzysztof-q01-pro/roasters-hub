# Project Status

> **This is the ONLY file that describes CURRENT reality.**
> Architecture docs (`docs/architecture/`) describe INTENT — what the system should look like.
> When they conflict with this file, **this file wins.**

---

## Last Updated
2026-03-23 | Initial setup (repo reorganization)

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
web/src/lib/supabase.ts       — DOES NOT EXIST
web/src/lib/auth.ts           — DOES NOT EXIST
web/src/lib/slug.ts           — DOES NOT EXIST
web/src/types/actions.ts      — DOES NOT EXIST
web/prisma/seed.ts            — DOES NOT EXIST
web/prisma/migrations/        — DOES NOT EXIST (no DB provisioned yet)
web/.env.local                — DOES NOT EXIST (Supabase not configured)
```

**Note:** `web/src/lib/db.ts` exists but the Prisma client is **commented out** — it exports `{}`.

---

## Active Work

None currently. Repository reorganization complete.

---

## Next Unblocked Task

**Phase 0, Step 1:** Create Supabase project (dev) → copy credentials to `web/.env.local`

See `ROADMAP.md` for full task list.

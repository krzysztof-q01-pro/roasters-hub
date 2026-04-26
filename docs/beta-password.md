# Beta Password Protection

> Site-wide password gate for Bean Map. Easy to add, easy to remove.

## How it works

1. `middleware.ts` checks for `BETA_PASSWORD` env var
2. If set, every request must have `beta_auth` cookie
3. Without cookie → redirect to `/${locale}/password`
4. User types password → API sets cookie for 24h

## Files involved

| File | Purpose |
|------|---------|
| `web/src/middleware.ts` | Checks cookie, redirects to password page |
| `web/src/app/[locale]/password/page.tsx` | Password form UI |
| `web/src/app/api/beta-auth/route.ts` | Verifies password, sets cookie |

## How to enable

```bash
# web/.env.local
BETA_PASSWORD="beantest"
```

Redeploy (Vercel picks up env vars automatically).

## How to disable

### Option A: Remove env var (fastest)

```bash
# Delete or comment out in Vercel Dashboard → Project → Settings → Environment Variables
# Then redeploy
```

### Option B: Remove code completely

```bash
# 1. Delete files
rm web/src/app/[locale]/password/page.tsx
rm web/src/app/api/beta-auth/route.ts

# 2. In middleware.ts — delete the beta block (marked with comments)
# Lines: BETA_PASSWORD const, isBetaExcluded, checkBetaPassword, and the call inside clerkMiddleware

# 3. Remove from .env.local and .env.example:
# BETA_PASSWORD="..."
```

### Option C: Temporary disable

Set `BETA_PASSWORD=""` or remove it — middleware skips protection when empty.

## Password

Current: `beantest`

Cookie: `beta_auth` (httpOnly, 24h, path: `/`)

## Excluded paths (no password required)

- `/api/*`
- `/_next/*`
- `/*.static` (files with extension)
- `/favicon*`, `/robots*`, `/sitemap*`
- `/password` and `/{en|pl|de}/password`

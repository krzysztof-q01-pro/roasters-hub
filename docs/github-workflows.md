# GitHub Workflows & CI/CD Guide

> Kompletna dokumentacja procesów CI/CD dla agentów i developerów.  
> **Ground truth:** Ten plik opisuje AKTUALNY stan workflowów w `.github/workflows/`.

---

## 📋 Spis treści

1. [Architektura Pipeline](#architektura-pipeline)
2. [Preview Database (PR)](#preview-database-pr)
3. [Production Deploy](#production-deploy)
4. [Wymagane Secrets](#wymagane-secrets)
5. [Komendy diagnostyczne](#komendy-diagnostyczne)
6. [Rollback](#rollback)
7. [Troubleshooting](#troubleshooting)

---

## Architektura Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PULL REQUEST                                    │
│                              (feat/* branch)                                 │
└──────────────────────┬──────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PREVIEW DATABASE WORKFLOW                            │
│                         (.github/workflows/preview-db.yml)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Create Neon branch (preview-<branch-name>)                              │
│  2. Run migrations (jeśli nowe)                                             │
│  3. Run seed (jeśli nowe)                                                   │
│  4. Set Vercel DATABASE_URL (scoped to branch)                              │
│  5. Vercel Preview Deployment                                               │
└──────────────────────┬──────────────────────────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Preview URL    │
              │  (testuj tutaj) │
              └─────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MERGE TO MAIN                                   │
└──────────────────────┬──────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PRODUCTION DEPLOY WORKFLOW                              │
│                      (.github/workflows/production-deploy.yml)               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Job 1: CI (Lint, TypeScript, Tests)                                        │
│       └─► Czy kod jest poprawny?                                            │
│                                                                             │
│  Job 2: Migrate & Seed Production DB                                        │
│       └─► Używa DATABASE_URL z GitHub Secrets                               │
│       └─► Migracje + Seed (tylko przy zmianie seed/migrations)              │
│                                                                             │
│  Job 3: Vercel Auto-Deploy (poza workflow)                                  │
│       └─► Vercel automatycznie deployuje na push do main                    │
└──────────────────────┬──────────────────────────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Production URL  │
│ https://beanmap-web.vercel.app │
              └─────────────────┘
```

---

## Preview Database (PR)

Każdy Pull Request automatycznie dostaje **własną, izolowaną bazę danych**.

### Jak to działa

**Trigger:** PR `opened`, `synchronize`, `reopened`

1. **Neon Branch Creation**
   - Nazwa: `preview-<branch-name>`
   - Parent: `main` (kopia produkcji)
   - Automatyczne czyszczenie przy zamknięciu PR

2. **Migrations & Seed** (tylko jeśli są nowe)
   - Sprawdza `git diff` na `web/prisma/migrations/`
   - Odpala `prisma migrate deploy`
   - Odpala `prisma/seed_cafes.ts` jeśli zmieniony

3. **Vercel Integration**
   - Tworzy branch-scoped `DATABASE_URL`
   - Vercel używa tej zmiennej dla preview deployments
   - URL: `https://<branch>-<project>.vercel.app`

### Komendy diagnostyczne

```bash
# Status workflow dla PR
cd /workspaces/roasters-hub
gh run list --branch <nazwa-brancha> --limit 5

# Logi błędów
cd /workspaces/roasters-hub
gh run view <run-id> --log-failed

# Lista Neon branchy
# (przez Neon Console: https://console.neon.tech)
```

### Cleanup (automatyczny)

Przy zamknięciu PR:
- Usuwa Neon branch `preview-<branch-name>`
- Usuwa Vercel env var `DATABASE_URL` (scoped)

---

## Production Deploy

Deploy na produkcję działa w **dwóch fazach**:

### Faza 1: Database (GitHub Actions)

**Trigger:** Push do `main` ze zmianami w:
- `web/prisma/seed*.ts`
- `web/prisma/migrations/**`
- `.github/workflows/production-deploy.yml`

**Jobs:**

| Job | Cel | Czas |
|-----|-----|------|
| `ci` | Lint, TypeScript, Unit Tests | ~40s |
| `migrate-and-seed` | Migracje + Seed na produkcji | ~30s-6min |

**Uwaga:** Seed relacji cafe-roaster (600+ INSERTów) może trwać 5-6 minut na Neon Free.

### Faza 2: Vercel Deployment (Auto)

Vercel automatycznie deployuje na każdy push do `main`:
- **Nie wymaga** workflow GitHub Actions
- Deployment pojawia się w GitHub jako status check
- Produkcja: `https://beanmap-web.vercel.app`

### Monitorowanie statusu

```bash
# Lista workflowów na main
cd /workspaces/roasters-hub
gh run list --branch main --limit 5

# Szczegóły konkretnego runu
gh run view <run-id>

# Tylko błędy
gh run view <run-id> --log-failed

# Status deploymentu Vercel
gh api repos/BeanMap/roasters-hub/deployments --jq '.[0] | {environment, state}'
```

---

## Wymagane Secrets

### GitHub Repository Secrets

Ustaw w: `https://github.com/BeanMap/roasters-hub/settings/secrets/actions`

| Secret | Skąd wziąć | Użycie |
|--------|-----------|--------|
| `DATABASE_URL` | Vercel Dashboard → Project → Settings → Environment Variables | Production DB connection (pooled) |
| `DIRECT_URL` | Vercel Dashboard → Project → Settings → Environment Variables | Production DB connection (direct, dla migracji) |
| `NEON_API_KEY` | Neon Console → Project → API Keys | Tworzenie/usuwanie preview branches |
| `NEON_PROJECT_ID` | Neon Console → Project Settings → General | ID projektu Neon |
| `VERCEL_TOKEN` | Vercel → Settings → Tokens | Integracja z Vercel API |
| `VERCEL_PROJECT_ID` | Vercel Dashboard → Project → Settings → General | ID projektu Vercel |

### Skąd wziąć DATABASE_URL i DIRECT_URL

1. Wejdź: https://vercel.com/dashboard
2. Wybierz projekt `beanmap-web`
3. Settings → Environment Variables
4. Skopiuj wartość `DATABASE_URL` (sekcja Production)
5. Dodaj do GitHub Secrets z tą samą nazwą
6. To samo dla `DIRECT_URL`

**Uwaga:** Te wartości są IDENTYCZNE jak w lokalnym `.env` (plik `web/.env`).

---

## Komendy diagnostyczne

### Podstawowe (każdy agent powinien znać)

```bash
# ─── Lista ostatnich runów ─────────────────────────────────────
cd /workspaces/roasters-hub
gh run list --limit 10

# ─── Ostatni nieudany run ──────────────────────────────────────
gh run list --status failure --limit 1

# ─── Szczegóły konkretnego runu ────────────────────────────────
# Najpierw weź ID z listy, potem:
gh run view <id>

# ─── Tylko błędy (najszybszy sposób) ───────────────────────────
gh run view <id> --log-failed

# ─── Pełne logi konkretnego joba ───────────────────────────────
gh run view <id> --log | grep -A 30 "Error"

# ─── Status deploymentu Vercel ─────────────────────────────────
gh api repos/BeanMap/roasters-hub/deployments --jq '.[0:3] | .[] | {id, environment, created_at, sha}'

# ─── Szczegóły konkretnego deploymentu ─────────────────────────
gh api repos/BeanMap/roasters-hub/deployments/<id>/statuses --jq '.[0]'
```

### Zaawansowane

```bash
# Trigger workflow ręcznie (wymaga uprawnień)
gh workflow run production-deploy.yml --ref main

# Lista wszystkich workflowów
gh workflow list

# Szczegóły workflowu
gh workflow view production-deploy.yml
```

---

## Rollback

### Scenariusz 1: Cofnięcie kodu (Git)

```bash
# Cofnij ostatni commit (zachowaj zmiany w working directory)
git revert HEAD

# Push do main (automatycznie triggeruje workflow)
git push origin main
```

### Scenariusz 2: Cofnięcie zmian w bazie (Neon)

Neon ma **7-dniową historię** (Time Travel):
1. Wejdź: https://console.neon.tech
2. Wybierz branch `main`
3. Time Travel → wybierz punkt w czasie przed zmianami
4. Create branch from this point / Reset to this point

### Scenariusz 3: Ręczny fix bazy

```bash
# Lokalnie z produkcyjną bazą
cd /workspaces/roasters-hub/web
export DATABASE_URL="<production-url>"
npx prisma migrate deploy
# lub napraw ręcznie przez Prisma Studio
npx prisma studio
```

---

## Troubleshooting

### Problem: `DATABASE_URL secret is not set`

**Objaw:**
```
❌ Error: DATABASE_URL secret is not set
```

**Rozwiązanie:**
1. Skopiuj wartość z Vercel Dashboard
2. Dodaj do GitHub Secrets: https://github.com/BeanMap/roasters-hub/settings/secrets/actions
3. Ustaw nazwę: `DATABASE_URL`
4. Ustaw nazwę: `DIRECT_URL` (taka sama lub direct connection)

### Problem: `Connection url is empty`

**Objaw:**
```
Error: Connection url is empty. See https://pris.ly/d/config-url
```

**Przyczyna:** Secret jest ustawiony, ale workflow go nie widzi.

**Rozwiązanie:**
- Sprawdź czy secret jest w Repository Secrets (nie Environment Secrets)
- Uruchom workflow ponownie

### Problem: `Error! You specified VERCEL_PROJECT_ID but forgot VERCEL_ORG_ID`

**Objaw:**
```
Error! You specified VERCEL_PROJECT_ID but forgot VERCEL_ORG_ID
```

**Rozwiązanie:**
- Nie używaj `amondnet/vercel-action` do deployu produkcji
- Vercel i tak deployuje automatycznie na push do main
- Workflow `production-deploy.yml` skupia się na bazie danych, nie na deployu

### Problem: Workflow trwa bardzo długo (>10 min)

**Objaw:**
- Migrate & Seed wisi przez 10+ minut

**Przyczyna:**
- Duży seed (600+ relacji cafe-roaster)
- Neon Free plan = wolniejsze połączenia
- Każdy `upsert` = SELECT + INSERT/UPDATE

**Rozwiązanie:**
- Czekaj, to normalne dla dużych seed
- Dla produkcji rozważ Neon Pro (szybsze połączenia)

### Problem: Preview DB nie działa

**Objaw:**
- Preview deployment pokazuje "Database error"
- Brak danych w preview

**Sprawdź:**
```bash
# Czy Neon branch istnieje?
gh run view <run-id> --log | grep "Neon branch"

# Czy Vercel ma DATABASE_URL?
# (Sprawdź w Vercel Dashboard → Project → Settings → Environment Variables)
```

**Rozwiązanie:**
- Zamknij i otwórz PR ponownie (triggeruje recreation)
- Lub: `git commit --allow-empty -m "trigger redeploy" && git push`

---

## Checklist dla Agentów

Przed rozpoczęciem pracy z CI/CD:

- [ ] Czytałem `PROJECT_STATUS.md` i `ROADMAP.md`
- [ ] Sprawdziłem `gh run list --limit 5`
- [ ] Wszystkie wymagane secrets są ustawione (jeśli nie → zgłoś)
- [ ] Pracuję na branchu feature (nigdy bezpośrednio na main)
- [ ] Znam komendę `gh run view <id> --log-failed` na wypadek błędów

---

## Zobacz też

- `CLAUDE.md` — ogólne instrukcje procesowe
- `AGENTS.md` — instrukcje specyficzne dla OpenCode
- `.github/workflows/` — kod źródłowy workflowów
- `web/prisma/` — migracje i seedy

---

**Last Updated:** 2026-04-03  
**Maintainer:** @MN (Marek Nadra)

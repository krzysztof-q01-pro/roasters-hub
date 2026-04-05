# Agent Instructions — BeenMap (OpenCode)

> Ten plik jest odpowiednikiem CLAUDE.md dla OpenCode i innych agentów.
> Pełne reguły procesu → CLAUDE.md (czytaj jako pierwsze).

---

## ⛔ FORBIDDEN — Never execute these commands

### Database — ABSOLUTELY FORBIDDEN on production
- `prisma db push` — bypasses migration tracking, can corrupt production data
- `prisma db seed` without explicit human instruction — risk of duplicate data
- `prisma migrate resolve --applied` — marks migrations as done without executing SQL
- `prisma migrate reset` — drops and recreates the database
- Any direct SQL on DATABASE_URL / DIRECT_URL without explicit human approval

### Git — FORBIDDEN
- `git push origin main` — direct push to main is blocked by branch-guard.sh
- `git commit --no-verify` — bypasses consistency checks
- `git push --force` on any branch with open PR

---

## Multi-Worker Coordination

Three workers operate on this repo:
- **@MN** (Marek Nadra) — manual sessions
- **@KK** (Krzysztof Kuczkowski) — manual sessions
- **@AGENT** — autonomous (scheduled, nocny/wieczorny)

**Task ownership (ROADMAP.md):**
- Work ONLY on tasks tagged (@AGENT), (@UNASSIGNED), or untagged
- NEVER modify tasks tagged (@MN) or (@KK)
- Before starting: change @UNASSIGNED → @AGENT

**Branch naming:**
| Worker | Pattern | Example |
|--------|---------|---------|
| Agent | `feat/agent-YYYY-WW` | `feat/agent-2026-14` |
| Marek | `feat/mn-<slug>` | `feat/mn-email-fix` |
| Krzysztof | `feat/kk-<slug>` | `feat/kk-admin-panel` |

**NEVER commit directly to main.**

---

## Session End — Required

Before ending any session, write/update `.tmp/SESSION.md`:

```markdown
## Session YYYY-MM-DD

### Started with
- <task description>

### Completed
- <list of completed items>

### Tested
- lint ✅/❌, tsc ✅/❌, build ✅/❌

### Blocked
- <list of blockers or "none">

### Next
- <recommended next task>

### Metadata
- Branch: feat/...
- PR: #<number> or "not yet created"
```

---

## Orientacja (KAŻDA sesja)

1. Czytaj `PROJECT_STATUS.md` → `ROADMAP.md`
2. Przestrzegaj reguł branch strategy i multi-worker coordination z `CLAUDE.md`

---

## Branch Strategy — ZŁOTA REGUŁA

**PO KAŻDEJ zmianie kodu lub bazy danych — wynik ZAWSZE na nowym branchu.**
**NIGDY nie commituj i nie pushuj bezpośrednio do `main`.**

Dotyczy WSZYSTKICH workerów: `@MN`, `@KK`, `@AGENT`.

**Procedura:**
1. Przed zmianami: ustal branch (`feat/agent-YYYY-WW` dla agenta, `feat/mn-*` / `feat/kk-*` dla ludzi)
2. Cała praca tylko na branchu
3. Push tylko na branch — nigdy na main
4. Merge przez PR po przejściu CI (auto-flow)

**Wyjątek:** `git checkout main && git pull` — tylko po to żeby zaktualizować lokalny main.

---

## Git Hooks (setup)

Repo używa `.githooks/` (nie husky — monorepo z `.git` w root).

**Setup (raz na środowisko):**
```bash
git config core.hooksPath .githooks
```

**Hooki:**
- `pre-commit` — consistency check (`tools/consistency_check.py`)
- `pre-push` — branch guard (`tools/branch-guard.sh`) — blokuje push kodu do main

**Kategorie plików:**
| Wymaga brancha | Dozwolone na main |
|----------------|-------------------|
| `web/src/**` | `CLAUDE.md`, `AGENTS.md` |
| `web/prisma/**` | `ROADMAP.md`, `PROJECT_STATUS.md` |
| `web/package.json`, `web/next.config.ts` | `docs/**` |
| `tools/**`, `.github/**` | `.tmp/`, `.claude/` |

---

## Sprawdzanie GitHub Actions / Deploymentów

OpenCode ma dostęp do `gh` CLI. Używaj go do diagnozowania błędów CI/CD.

### Podstawowe komendy

```bash
# Lista ostatnich runów
gh run list --limit 10

# Ostatni nieudany run
gh run list --status failure --limit 1

# Szczegóły runu (zastąp <id> numerem z listy)
gh run view <id>

# Tylko błędy (najszybszy sposób na diagnozę)
gh run view <id> --log-failed

# Pełne logi konkretnego joba
gh run view <id> --log | grep -A 30 "Error"

# Deploymenty Vercel (przez GitHub Deployments API)
gh api repos/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/deployments --jq '.[0:5] | .[] | {id, environment, created_at, sha}'

# Status ostatniego deploymentu
gh api repos/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/deployments/$(gh api repos/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/deployments --jq '.[0].id') /statuses --jq '.[0]'
```

### Workflow diagnozowania błędów

1. `gh run list --limit 5` — znajdź nieudany run
2. `gh run view <id> --log-failed` — odczytaj błędy
3. Zidentyfikuj krok który padł (np. `tsc`, `lint`, `build`, `test`)
4. Sprawdź odpowiedni plik w repo
5. Napraw, commituj, pushuj

### CI Jobs w tym repo

| Job | Co sprawdza |
|-----|-------------|
| `lint` | ESLint (`npm run lint`) |
| `tsc` | TypeScript (`npx tsc --noEmit`) |
| `test` | Testy (`npm run test`) |
| `build` | Next.js build z prawdziwym Neon DB |

---

## Zasady dotyczące obrazków (Next.js Image)

**REGUŁA:** Każdy nowy zewnętrzny hostname dla obrazków MUSI być dodany do `web/next.config.ts` → `images.remotePatterns`.

Bez tego Next.js rzuca runtime error i obrazki nie wyświetlają się w produkcji.

### Kiedy sprawdzać

Za każdym razem gdy:
- Dodajesz seed z `coverImageUrl` lub podobnym polem wskazującym na zewnętrzny URL
- Integrujesz nowe źródło danych (scraper, API, CMS)
- Dodajesz komponent używający `<Image src={externalUrl} />`

### Jak naprawić

1. Sprawdź skąd pochodzą URLe obrazków (np. domena scrapera, CDN)
2. Dodaj do `web/next.config.ts`:

```ts
{
  protocol: "https",
  hostname: "nazwa-domeny.com",
},
```

3. Aktualne dozwolone hosty w tym repo:
   - `images.unsplash.com`
   - `lh3.googleusercontent.com`
   - `utfs.io`
   - `*.ufs.sh`
   - `europeancoffeetrip.com`

---

## Konwencje commitów

`[SCOPE] action: description`

Scopes: `DB | AUTH | ACTION | UI | SEED | INFRA | DOCS | AGENT`

---

## CI/CD & Deployment

Szczegółowa dokumentacja: [`docs/github-workflows.md`](docs/github-workflows.md)

**Kluczowe zasady:**
- Każdy PR dostaje **własną bazę danych** (Neon branch) + Vercel Preview
- Produkcja: migracje i seed przez GitHub Actions (sekwencyjnie)
- Vercel deployuje automatycznie na push do main
- Wymagane secrets: `DATABASE_URL`, `DIRECT_URL`, `NEON_API_KEY`, `VERCEL_TOKEN`

**Monitorowanie:**
```bash
# Status workflow
gh run list --branch main --limit 5

# Logi błędów
gh run view <id> --log-failed

# Deploymenty
gh api repos/BeanMap/roasters-hub/deployments --jq '.[0:3]'
```

---

## Auto-Flow — "Zapisz zmiany"

Gdy użytkownik powie **"zapisz"**, **"commit"**, **"push"**, **"wdróż"** — agent wykonuje pełny flow w tle:

```
1. git checkout -b feat/<krótki-opis>
2. git add + git commit
3. git push origin <branch>
4. gh pr create
5. Polling: gh run list --branch <branch> (czeka na CI ✅)
6. Jeśli CI ✅ → gh pr merge --squash --delete-branch
7. Jeśli CI ❌ → napraw błędy + push na ten sam PR → powrót do kroku 5
```

**Użytkownik widzi tylko:** *"Zmiany zapisane, PR #X zmergowany."*

### Kiedy NIE auto-merge

- Zmiana struktury bazy (nowa migracja) — pokaż link do PR, poproś o potwierdzenie
- Duża zmiana (>5 plików, >200 linii) — pokaż link do PR, poproś o review
- Pierwszy deploy nowej funkcji — pokaż podsumowanie przed merge

### NIGDY

- `git push origin main` (zablokowane przez Branch Protection)
- `gh pr merge --admin` (omija politykę repozytorium)
- Commit bez uruchomienia consistency check

# Agent Instructions — BeenMap (OpenCode)

> Ten plik jest odpowiednikiem CLAUDE.md dla OpenCode i innych agentów.
> Pełne reguły procesu → CLAUDE.md (czytaj jako pierwsze).

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
4. Merge tylko przez PR po review

**Wyjątek:** `git checkout main && git pull` — tylko po to żeby zaktualizować lokalny main.

**Wyjątek od wyjątku:** Zmiany TYLKO w plikach dokumentacji/instrukcji (`CLAUDE.md`, `AGENTS.md`, `ROADMAP.md`, `PROJECT_STATUS.md`, `docs/`) mogą być pushowane bezpośrednio do main. Pre-push hook (`tools/branch-guard.sh`) automatycznie blokuje push kodu/DB do main, ale przepuszcza dokumentację.

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

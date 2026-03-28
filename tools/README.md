# Tools

Skrypty Python do deterministycznego wykonywania zadań (WAT Framework — Warstwa 3).

Credentiale: plik `.env` w root repozytorium.
Outputy: katalog `.tmp/` (gitignored, regenerowalny).

---

## Skrypty

### `research_reddit.py`

Scraping Reddit do badań użytkowników. Zbiera posty i komentarze z określonego subreddita.

```bash
python tools/research_reddit.py \
  --subreddit specialty_coffee \
  --persona roaster \
  --limit 100
```

**Output:** `.tmp/reddit_[subreddit]_[persona]_[timestamp].json`

**Wymaga w `.env`:**
```
REDDIT_CLIENT_ID=...
REDDIT_CLIENT_SECRET=...
REDDIT_USER_AGENT=...
```

**Workflow:** `workflows/persona_research.md`

---

### `generate_business_pdf.py`

Generuje PDF z przeglądem biznesowym na podstawie plików markdown.

```bash
python tools/generate_business_pdf.py
```

**Output:** `docs/roasters_hub_business_overview.pdf`

---

### `consistency_check.py`

Deterministyczna kontrola spójności plików stanu projektu. Sprawdza 8 punktów synchronizacji (ROADMAP ↔ STATUS, wersje, filesystem, schema).

```bash
# Read-only — JSON report na stdout
python tools/consistency_check.py

# Auto-fix wszystkich auto-fixable checks
python tools/consistency_check.py --fix all

# Fix wybranych checks
python tools/consistency_check.py --fix C2,C4
```

**Output:** JSON na stdout + `.tmp/consistency_check.log`

**Nie wymaga credentiali.** Zero dependencies poza stdlib.

**Workflow:** `workflows/consistency_check.md`

---

### `vercel_status.py`

Status deploymentów Vercel przez GitHub Deployments API. Nie wymaga VERCEL_TOKEN — używa `gh` CLI (już autoryzowane). `vercel[bot]` zapisuje preview URL w GitHub po każdym pushu.

```bash
# Aktualny branch
python tools/vercel_status.py

# Konkretny branch
python tools/vercel_status.py --branch feat/agent-2026-13

# Filtruj po środowisku
python tools/vercel_status.py --env Production

# JSON (do użycia w skryptach)
python tools/vercel_status.py --json

# Czekaj na deployment (max 120s)
python tools/vercel_status.py --wait
```

**Output:** Status (success/failure/in_progress), URL preview, czas deploymentu.

**Wymaga:** `gh` CLI z aktywną sesją (`gh auth status`).

---

### `smoke_test.py`

HTTP smoke test dla deployed URL. Sprawdza czy `/`, `/roasters`, `/map` zwracają HTTP 200.

```bash
# Test produkcji
python tools/smoke_test.py --url https://beanmap-web.vercel.app

# Test preview brancha
python tools/smoke_test.py --url https://beanmap-web-git-feat-xxx.vercel.app

# JSON output (exit code 1 jeśli FAIL)
python tools/smoke_test.py --url <url> --json
```

**Output:** PASS/FAIL z czasami odpowiedzi per route.

**Nie wymaga credentiali.** Zero dependencies poza stdlib.

---

### `create_agent_pr.sh`

Idempotentne tworzenie PR dla branchy agenta. Bezpieczny do wielokrotnego wywołania — jeśli PR już istnieje, zwraca jego URL.

```bash
# Na branchu feat/agent-*
bash tools/create_agent_pr.sh
```

Czyta `.tmp/SESSION.md` i wypełnia body PR. Działa tylko na branchach `feat/agent-*`.

**Wymaga:** `gh` CLI z aktywną sesją.

---

## Setup (instalacja jednorazowa w nowym środowisku)

Po sklonowaniu repo lub w nowym Codespace — zainstaluj pre-commit hook:

```bash
chmod +x .git/hooks/pre-commit
```

Hook uruchamia `consistency_check.py` przed każdym commitem i blokuje jeśli są niespójności. Bypass awaryjny: `git commit --no-verify`.

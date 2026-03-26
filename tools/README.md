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

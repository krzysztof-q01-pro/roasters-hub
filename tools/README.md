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

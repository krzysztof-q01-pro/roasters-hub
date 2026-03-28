#!/bin/bash
# Create or update a GitHub PR for the current agent branch.
# Idempotent — safe to run multiple times on the same branch.
# Only acts on branches matching feat/agent-*

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
SESSION_FILE="$REPO_ROOT/.tmp/SESSION.md"
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Only run on agent branches
if [[ "$BRANCH" != feat/agent-* ]]; then
  echo "[create_agent_pr] Nie dotyczy brancha: $BRANCH (oczekiwano feat/agent-*)"
  exit 0
fi

# Check if PR already exists for this branch
EXISTING_PR=$(gh pr list --head "$BRANCH" --state open --json number,url --jq '.[0]' 2>/dev/null || echo "")
if [ -n "$EXISTING_PR" ] && [ "$EXISTING_PR" != "null" ]; then
  PR_NUM=$(echo "$EXISTING_PR" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['number'])" 2>/dev/null || echo "?")
  PR_URL=$(echo "$EXISTING_PR" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['url'])" 2>/dev/null || echo "")
  echo "[create_agent_pr] PR #$PR_NUM już istnieje dla brancha $BRANCH"
  echo "$PR_URL"
  exit 0
fi

# Extract ISO week from branch name (feat/agent-2026-13 → "2026-13")
WEEK=$(echo "$BRANCH" | grep -oP '\d{4}-\d{2}$' 2>/dev/null || echo "current")
PR_TITLE="[Agent] Tydzień $WEEK — automatyczna praca agenta"

# Build PR body
SESSION_CONTENT=""
if [ -f "$SESSION_FILE" ]; then
  SESSION_CONTENT=$(cat "$SESSION_FILE")
fi

PR_BODY=$(cat <<EOF
## Sesja agenta — $BRANCH

**Gałąź:** \`$BRANCH\`
**Tydzień ISO:** $WEEK

---

### SESSION.md

\`\`\`
$SESSION_CONTENT
\`\`\`

---

## Checklist przed merge

- [ ] Przejrzyj diff: \`git diff main...$BRANCH\`
- [ ] Każde \`[x]\` w ROADMAP.md ma fizyczny dowód w kodzie (plik, import, wywołanie)
- [ ] TypeScript OK: \`cd web && npx tsc --noEmit\`
- [ ] Lint OK: \`npm run lint\`
- [ ] Preview URL działa (sprawdź w komentarzach od vercel[bot])
- [ ] Smoke test przeszedł: \`python tools/smoke_test.py --url <preview_url>\`

Pełny SOP review → \`workflows/review_agent_branch.md\`

---

🤖 Automatycznie utworzone przez agenta nocnego
EOF
)

gh pr create \
  --base main \
  --head "$BRANCH" \
  --title "$PR_TITLE" \
  --body "$PR_BODY"

echo "[create_agent_pr] PR utworzony dla brancha $BRANCH"

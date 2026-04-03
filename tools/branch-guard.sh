#!/bin/bash
# branch-guard.sh — Pre-push gate: blocks direct push to main for code/DB changes.
#
# Zasada:
#   - Zmiany w kodzie, DB, config, narzędziach → WYMAGAJĄ feature brancha
#   - Zmiany TYLKO w dokumentacji/instrukcjach → dozwolone na main
#
# Bypass: git push --no-verify (tylko w sytuacjach awaryjnych)

# ---------------------------------------------------------------------------
# Category definitions
# ---------------------------------------------------------------------------

# Patterns that require a feature branch (code, DB, config, tools)
CODE_PATTERNS=(
  "web/src/"
  "web/prisma/"
  "web/public/"
  "web/package.json"
  "web/package-lock.json"
  "web/next.config.ts"
  "web/tailwind.config."
  "web/postcss.config."
  "web/tsconfig.json"
  "web/vitest"
  "tools/"
  "workflows/"
  ".github/"
)

# Patterns that are safe to push directly to main (docs, instructions, status)
DOC_PATTERNS=(
  "CLAUDE.md"
  "AGENTS.md"
  "web/AGENTS.md"
  "ROADMAP.md"
  "PROJECT_STATUS.md"
  "docs/"
  ".tmp/"
  ".claude/"
  ".agents/"
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

is_code_change() {
  local file="$1"
  for pattern in "${CODE_PATTERNS[@]}"; do
    if [[ "$file" == *"$pattern"* ]]; then
      return 0
    fi
  done
  return 1
}

is_doc_change() {
  local file="$1"
  for pattern in "${DOC_PATTERNS[@]}"; do
    if [[ "$file" == *"$pattern"* ]]; then
      return 0
    fi
  done
  return 1
}

# ---------------------------------------------------------------------------
# Main check
# ---------------------------------------------------------------------------

# Get the branch we're pushing to
read -r local_ref local_sha remote_ref remote_sha <<< "$(cat)"

# Extract remote branch name
remote_branch="${remote_ref#refs/heads/}"

# Only enforce on main branch
if [ "$remote_branch" != "main" ]; then
  exit 0
fi

# Get list of commits that would be pushed (commits on local main not on remote main)
# This captures the actual changes being pushed
REPO_ROOT="$(git rev-parse --show-toplevel)"
CHANGED_FILES=$(git diff --name-only "${remote_sha}..${local_sha}" 2>/dev/null || echo "")

if [ -z "$CHANGED_FILES" ]; then
  # No changes — allow
  exit 0
fi

CODE_FILES=()
DOC_FILES=()
UNKNOWN_FILES=()

while IFS= read -r file; do
  [ -z "$file" ] && continue
  # Make path relative to repo root
  file="${file#./}"
  if is_code_change "$file"; then
    CODE_FILES+=("$file")
  elif is_doc_change "$file"; then
    DOC_FILES+=("$file")
  else
    UNKNOWN_FILES+=("$file")
  fi
done <<< "$CHANGED_FILES"

# If any code changes found — BLOCK
if [ ${#CODE_FILES[@]} -gt 0 ]; then
  echo ""
  echo "============================================"
  echo "  ZŁOTA REGUŁA — Branch Strategy"
  echo "============================================"
  echo ""
  echo "❌ BLOKADA: Nie możesz pushować zmian kodu/DB bezpośrednio do main."
  echo ""
  echo "Zmienione pliki wymagające brancha:"
  for f in "${CODE_FILES[@]}"; do
    echo "  • $f"
  done
  echo ""
  echo "Co zrobić:"
  echo "  1. git checkout -b feat/opis-zmiany"
  echo "  2. git push origin feat/opis-zmiany"
  echo "  3. Otwórz PR w GitHub"
  echo "  4. Merge przez PR po review"
  echo ""
  if [ ${#DOC_FILES[@]} -gt 0 ]; then
    echo "Pliki dokumentacji (dozwolone na main):"
    for f in "${DOC_FILES[@]}"; do
      echo "  ✓ $f"
    done
    echo ""
  fi
  echo "Awaryjny bypass (NIE ZALECANE): git push --no-verify"
  echo "============================================"
  echo ""
  exit 1
fi

# Unknown files — warn but allow
if [ ${#UNKNOWN_FILES[@]} -gt 0 ]; then
  echo ""
  echo "[branch-guard] ⚠️  Niesklasyfikowane pliki (push do main dozwolony):"
  for f in "${UNKNOWN_FILES[@]}"; do
    echo "  ? $f"
  done
  echo ""
fi

exit 0

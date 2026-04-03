#!/usr/bin/env python3
"""
Consistency Check — deterministyczny skrypt weryfikujący spójność plików projektu.

Część WAT Framework (Layer 3: Tools).
Workflow: workflows/consistency_check.md

Usage:
    python tools/consistency_check.py              # Read-only — JSON report na stdout
    python tools/consistency_check.py --fix C2,C4  # Auto-fix wybranych checks
    python tools/consistency_check.py --fix all    # Auto-fix wszystkich auto-fixable checks
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Repo root detection
# ---------------------------------------------------------------------------

def get_repo_root() -> Path:
    try:
        root = subprocess.check_output(
            ["git", "rev-parse", "--show-toplevel"],
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
        return Path(root)
    except (subprocess.CalledProcessError, FileNotFoundError):
        # Fallback: script is in tools/, repo root is parent
        return Path(__file__).resolve().parent.parent


ROOT = get_repo_root()

# ---------------------------------------------------------------------------
# File reading helpers
# ---------------------------------------------------------------------------

def read_file(rel_path: str) -> str | None:
    """Read a file relative to repo root. Returns None if not found."""
    p = ROOT / rel_path
    if p.is_file():
        return p.read_text(encoding="utf-8")
    return None


def read_json(rel_path: str) -> dict | None:
    content = read_file(rel_path)
    if content is None:
        return None
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return None


# ---------------------------------------------------------------------------
# Check result builder
# ---------------------------------------------------------------------------

class CheckResult:
    def __init__(self, check_id: str, name: str, severity: str):
        self.id = check_id
        self.name = name
        self.severity = severity
        self.status = "PASS"
        self.auto_fixable = False
        self.details = ""
        self.fix_action: str | None = None
        self._items: list[str] = []

    def fail(self, detail: str, auto_fixable: bool = False, fix_action: str | None = None):
        self.status = "FAIL"
        self.auto_fixable = auto_fixable
        self.fix_action = fix_action
        self._items.append(detail)

    def warn(self, detail: str):
        if self.status == "PASS":
            self.status = "WARN"
        self._items.append(detail)

    def skip(self, reason: str):
        self.status = "SKIP"
        self._items.append(reason)

    def to_dict(self) -> dict:
        self.details = "; ".join(self._items) if self._items else "OK"
        return {
            "id": self.id,
            "name": self.name,
            "status": self.status,
            "severity": self.severity,
            "auto_fixable": self.auto_fixable,
            "details": self.details,
            "fix_action": self.fix_action,
        }


# ---------------------------------------------------------------------------
# C1: ROADMAP first [ ] in NOW ↔ PROJECT_STATUS "Next Unblocked Task"
# ---------------------------------------------------------------------------

def check_c1() -> CheckResult:
    r = CheckResult("C1", "ROADMAP vs PROJECT_STATUS active task", "critical")

    roadmap = read_file("ROADMAP.md")
    status = read_file("PROJECT_STATUS.md")
    if not roadmap or not status:
        r.skip("ROADMAP.md or PROJECT_STATUS.md not found")
        return r

    # Find first unchecked task in NOW section
    in_now = False
    first_unchecked = None
    for line in roadmap.splitlines():
        if re.match(r"^##\s+NOW", line):
            in_now = True
            continue
        if in_now and re.match(r"^##\s+", line) and not re.match(r"^###", line):
            break  # left NOW section
        if in_now:
            m = re.match(r"^- \[ \]\s+(.+)", line)
            if m:
                first_unchecked = m.group(1).strip()
                break

    # Also check NEXT section if NOW has no unchecked
    if first_unchecked is None:
        in_next = False
        for line in roadmap.splitlines():
            if re.match(r"^##\s+NEXT", line):
                in_next = True
                continue
            if in_next and re.match(r"^##\s+", line) and not re.match(r"^###", line):
                break
            if in_next:
                m = re.match(r"^- \[ \]\s+(.+)", line)
                if m:
                    first_unchecked = m.group(1).strip()
                    break

    # Find "Next Unblocked Task" in STATUS
    next_task_status = None
    in_next_section = False
    for line in status.splitlines():
        if "Next Unblocked Task" in line:
            in_next_section = True
            continue
        if in_next_section:
            stripped = line.strip()
            if stripped and not stripped.startswith("---") and not stripped.startswith("```"):
                next_task_status = stripped
                break

    if first_unchecked is None:
        r.warn("No unchecked tasks found in ROADMAP NOW/NEXT sections")
        return r

    if next_task_status is None:
        r.fail("PROJECT_STATUS.md has no 'Next Unblocked Task' content")
        return r

    # Fuzzy comparison: extract key words from both
    def extract_keywords(text: str) -> set[str]:
        # Remove markdown formatting, brackets, etc.
        clean = re.sub(r"[`*\[\](){}#|>]", " ", text.lower())
        words = set(clean.split())
        # Remove very common words
        stop = {"the", "a", "an", "—", "-", "→", "w", "i", "z", "do", "na", "po", "dla", "ze", "od"}
        return words - stop

    kw_roadmap = extract_keywords(first_unchecked)
    kw_status = extract_keywords(next_task_status)

    overlap = kw_roadmap & kw_status
    if len(overlap) < 2:
        r.fail(
            f"ROADMAP next task: '{first_unchecked[:80]}' vs STATUS next task: '{next_task_status[:80]}' — low keyword overlap",
            auto_fixable=False,
        )

    return r


# ---------------------------------------------------------------------------
# C2: "Does NOT Exist Yet" vs filesystem
# ---------------------------------------------------------------------------

def check_c2() -> CheckResult:
    r = CheckResult("C2", "Does NOT Exist Yet vs filesystem", "critical")

    status = read_file("PROJECT_STATUS.md")
    if not status:
        r.skip("PROJECT_STATUS.md not found")
        return r

    # Parse fenced code block under "Does NOT Exist Yet"
    in_section = False
    in_code_block = False
    paths_listed: list[str] = []

    for line in status.splitlines():
        if "Does NOT Exist Yet" in line:
            in_section = True
            continue
        if in_section and line.strip().startswith("```"):
            if in_code_block:
                break  # end of code block
            in_code_block = True
            continue
        if in_section and in_code_block:
            stripped = line.strip()
            if not stripped:
                continue
            # Extract path before " — " comment
            path = stripped.split("—")[0].split("–")[0].strip()
            if path:
                paths_listed.append(path)

    existing_files = []
    for p in paths_listed:
        full = ROOT / p
        if full.exists():
            existing_files.append(p)

    if existing_files:
        r.fail(
            f"Files listed as non-existent but found: {', '.join(existing_files)}",
            auto_fixable=True,
            fix_action="Remove existing files from 'Does NOT Exist Yet' block",
        )

    return r


def fix_c2():
    """Remove lines for files that exist from 'Does NOT Exist Yet' block."""
    status_path = ROOT / "PROJECT_STATUS.md"
    content = status_path.read_text(encoding="utf-8")

    lines = content.splitlines(keepends=True)
    result = []
    in_section = False
    in_code_block = False

    for line in lines:
        if "Does NOT Exist Yet" in line:
            in_section = True
            result.append(line)
            continue

        if in_section and line.strip().startswith("```"):
            if in_code_block:
                in_section = False  # leaving section
            in_code_block = not in_code_block
            result.append(line)
            continue

        if in_section and in_code_block:
            path = line.strip().split("—")[0].split("–")[0].strip()
            if path and (ROOT / path).exists():
                continue  # skip this line — file exists
            result.append(line)
            continue

        result.append(line)

    status_path.write_text("".join(result), encoding="utf-8")


# ---------------------------------------------------------------------------
# C3: Confirmed Stack vs package.json
# ---------------------------------------------------------------------------

STACK_PACKAGE_MAP = {
    "Clerk": "@clerk/nextjs",
    "Prisma": "prisma",
    "Uploadthing": "uploadthing",
    "Resend": "resend",
    "Plausible": "@plausible/tracker",
}


def check_c3() -> CheckResult:
    r = CheckResult("C3", "Confirmed Stack vs package.json", "critical")

    status = read_file("PROJECT_STATUS.md")
    pkg = read_json("web/package.json")
    if not status or not pkg:
        r.skip("PROJECT_STATUS.md or web/package.json not found")
        return r

    all_deps = {}
    all_deps.update(pkg.get("dependencies", {}))
    all_deps.update(pkg.get("devDependencies", {}))

    for tech, npm_pkg in STACK_PACKAGE_MAP.items():
        is_installed = npm_pkg in all_deps

        # Find status line in table
        for line in status.splitlines():
            if tech in line and "|" in line:
                says_not_installed = "not installed" in line.lower()
                if is_installed and says_not_installed:
                    r.fail(
                        f"{tech} ({npm_pkg}) is in package.json but STATUS says 'not installed'",
                        auto_fixable=True,
                        fix_action=f"Update STATUS: {tech} → '✅ installed'",
                    )
                break

    return r


def fix_c3():
    """Update stack status from 'not installed' to 'installed' for packages found in package.json."""
    status_path = ROOT / "PROJECT_STATUS.md"
    content = status_path.read_text(encoding="utf-8")
    pkg = read_json("web/package.json")
    if not pkg:
        return

    all_deps = {}
    all_deps.update(pkg.get("dependencies", {}))
    all_deps.update(pkg.get("devDependencies", {}))

    for tech, npm_pkg in STACK_PACKAGE_MAP.items():
        if npm_pkg in all_deps:
            # Replace "⏳ not installed" with "✅ installed" on lines containing this tech
            new_lines = []
            for line in content.splitlines(keepends=True):
                if tech in line and "not installed" in line.lower() and "|" in line:
                    line = line.replace("⏳ not installed", "✅ installed")
                new_lines.append(line)
            content = "".join(new_lines)

    status_path.write_text(content, encoding="utf-8")


# ---------------------------------------------------------------------------
# C4: AGENTS.md version table vs package.json
# ---------------------------------------------------------------------------

AGENTS_VERSION_MAP = {
    "Next.js": "next",
    "React": "react",
    "Prisma": "prisma",
    "Tailwind CSS": "tailwindcss",
    "TypeScript": "typescript",
}


def check_c4() -> CheckResult:
    r = CheckResult("C4", "AGENTS.md version table vs package.json", "important")

    agents = read_file("web/AGENTS.md")
    pkg = read_json("web/package.json")
    if not agents or not pkg:
        r.skip("web/AGENTS.md or web/package.json not found")
        return r

    all_deps = {}
    all_deps.update(pkg.get("dependencies", {}))
    all_deps.update(pkg.get("devDependencies", {}))

    mismatches = []
    for display_name, npm_pkg in AGENTS_VERSION_MAP.items():
        pkg_version = all_deps.get(npm_pkg, "")
        # Strip ^ ~ >= etc.
        clean_version = re.sub(r"^[\^~>=<]+", "", pkg_version)

        # Find version in AGENTS.md table
        for line in agents.splitlines():
            if display_name in line and "|" in line:
                # Extract version like **16.2.1** or **4** or **5.x**
                m = re.search(r"\*\*([0-9][0-9a-zA-Z._-]*)\*\*", line)
                if m:
                    agents_version = m.group(1)
                    # Compare: if package version starts with agents version, OK
                    if clean_version and not clean_version.startswith(agents_version.replace(".x", "")):
                        mismatches.append(f"{display_name}: AGENTS.md says {agents_version}, package.json has {clean_version}")
                break

    if mismatches:
        r.fail(
            "; ".join(mismatches),
            auto_fixable=True,
            fix_action="Update version numbers in AGENTS.md to match package.json",
        )

    return r


def fix_c4():
    """Update AGENTS.md version table to match package.json."""
    agents_path = ROOT / "web" / "AGENTS.md"
    content = agents_path.read_text(encoding="utf-8")
    pkg = read_json("web/package.json")
    if not pkg:
        return

    all_deps = {}
    all_deps.update(pkg.get("dependencies", {}))
    all_deps.update(pkg.get("devDependencies", {}))

    for display_name, npm_pkg in AGENTS_VERSION_MAP.items():
        pkg_version = all_deps.get(npm_pkg, "")
        clean_version = re.sub(r"^[\^~>=<]+", "", pkg_version)
        if not clean_version:
            continue

        new_lines = []
        for line in content.splitlines(keepends=True):
            if display_name in line and "|" in line:
                # Replace **old_version** with **new_version**
                line = re.sub(
                    r"\*\*[0-9][0-9a-zA-Z._-]*\*\*",
                    f"**{clean_version}**",
                    line,
                    count=1,
                )
            new_lines.append(line)
        content = "".join(new_lines)

    agents_path.write_text(content, encoding="utf-8")


# ---------------------------------------------------------------------------
# C5: Stale technology references in architecture docs
# ---------------------------------------------------------------------------

STALE_TERMS = [
    "supabase",
    "createServerClient",
    "supabase.auth",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
]

EXCLUDE_PATTERNS = [
    "nie jest",
    "nie jest w stacku",
    "replaced",
    "zamiast",
    "odrzucon",
    "NOT NEEDED",
    "nie potrzeb",
    "free tier",
    "odrzucone",
    "powód odrzucenia",
]


def check_c5() -> CheckResult:
    r = CheckResult("C5", "Stale technology references in architecture docs", "important")

    arch_dir = ROOT / "docs" / "architecture"
    if not arch_dir.is_dir():
        r.skip("docs/architecture/ not found")
        return r

    # Section headers that indicate historical/rejected context
    exclusion_sections = ["co nie jest", "odrzucon", "not in stack", "nie jest w stacku"]

    hits = []
    for md_file in sorted(arch_dir.glob("*.md")):
        lines = md_file.read_text(encoding="utf-8").splitlines()
        in_exclusion_section = False
        for i, line in enumerate(lines, 1):
            line_lower = line.lower()

            # Track section context via headers
            if line.startswith("#"):
                in_exclusion_section = any(exc in line_lower for exc in exclusion_sections)
                continue

            # Skip lines in exclusion sections
            if in_exclusion_section:
                continue

            # Skip individual exclusion lines
            if any(exc in line_lower for exc in EXCLUDE_PATTERNS):
                continue

            for term in STALE_TERMS:
                if term.lower() in line_lower:
                    rel = md_file.relative_to(ROOT)
                    hits.append(f"{rel}:{i} contains '{term}'")
                    break  # one hit per line

    if hits:
        r.fail(
            "; ".join(hits[:10]) + (f" (+{len(hits)-10} more)" if len(hits) > 10 else ""),
            auto_fixable=False,
            fix_action=None,
        )

    return r


# ---------------------------------------------------------------------------
# C6: Prisma schema model count vs database-schema.md
# ---------------------------------------------------------------------------

def check_c6() -> CheckResult:
    r = CheckResult("C6", "Prisma schema vs database-schema.md model coverage", "low")

    schema = read_file("web/prisma/schema.prisma")
    db_doc = read_file("docs/architecture/database-schema.md")
    if not schema:
        r.skip("web/prisma/schema.prisma not found")
        return r
    if not db_doc:
        r.skip("docs/architecture/database-schema.md not found")
        return r

    schema_models = sorted(re.findall(r"^model\s+(\w+)", schema, re.MULTILINE))

    # Check that each schema model name appears somewhere in the doc
    doc_text = db_doc.lower()
    missing_in_doc = [m for m in schema_models if m.lower() not in doc_text]

    if missing_in_doc:
        r.fail(
            f"Models in schema but not mentioned in database-schema.md: {', '.join(missing_in_doc)}",
            auto_fixable=False,
        )

    return r


# ---------------------------------------------------------------------------
# C7: ROADMAP [x] items vs DONE section
# ---------------------------------------------------------------------------

def check_c7() -> CheckResult:
    r = CheckResult("C7", "ROADMAP completed items vs DONE section", "low")

    roadmap = read_file("ROADMAP.md")
    if not roadmap:
        r.skip("ROADMAP.md not found")
        return r

    # Collect [x] items from NOW and NEXT (not from DONE or HUMAN ONLY)
    checked_items: list[str] = []
    in_done = False
    in_human = False
    for line in roadmap.splitlines():
        if re.match(r"^##\s+DONE", line):
            in_done = True
            continue
        if "HUMAN ONLY" in line:
            in_human = True
            continue
        if re.match(r"^##\s+", line) and not re.match(r"^###", line):
            in_done = False
            in_human = False

        if not in_done and not in_human:
            m = re.match(r"^- \[x\]\s+(.+)", line)
            if m:
                checked_items.append(m.group(1).strip())

    # Find DONE section content
    done_text = ""
    in_done = False
    for line in roadmap.splitlines():
        if re.match(r"^##\s+DONE", line):
            in_done = True
            continue
        if in_done and re.match(r"^##\s+", line) and not re.match(r"^###", line):
            break
        if in_done:
            done_text += line + "\n"

    done_lower = done_text.lower()
    stop_words = {"the", "and", "for", "from", "with", "stworzyć", "zastąpić", "podpiąć", "dev", "npm", "install"}
    missing = []
    for item in checked_items:
        # Extract key words for fuzzy match
        words = re.findall(r"[a-zA-Z]{3,}", item.lower())
        key_words = [w for w in words if w not in stop_words][:5]
        if not key_words:
            continue
        # Match if at least half of key words found in DONE
        matches = sum(1 for w in key_words if w in done_lower)
        if matches < max(2, len(key_words) // 2):
            missing.append(item[:60])

    if missing:
        r.fail(
            f"{len(missing)} completed items not in DONE: {'; '.join(missing[:5])}",
            auto_fixable=True,
            fix_action="Add missing completed items to DONE section",
        )

    return r


def fix_c7():
    """Add missing completed items to DONE section in ROADMAP.md."""
    roadmap_path = ROOT / "ROADMAP.md"
    content = roadmap_path.read_text(encoding="utf-8")

    # Re-run detection to find which items are missing
    lines = content.splitlines()

    checked_items: list[str] = []
    in_done = False
    in_human = False
    for line in lines:
        if re.match(r"^##\s+DONE", line):
            in_done = True
            continue
        if "HUMAN ONLY" in line:
            in_human = True
            continue
        if re.match(r"^##\s+", line) and not re.match(r"^###", line):
            in_done = False
            in_human = False
        if not in_done and not in_human:
            m = re.match(r"^- \[x\]\s+(.+)", line)
            if m:
                checked_items.append(m.group(1).strip())

    done_text = ""
    in_done = False
    for line in lines:
        if re.match(r"^##\s+DONE", line):
            in_done = True
            continue
        if in_done and re.match(r"^##\s+", line) and not re.match(r"^###", line):
            break
        if in_done:
            done_text += line + "\n"

    done_lower = done_text.lower()
    stop_words = {"the", "and", "for", "from", "with", "stworzyć", "zastąpić", "podpiąć", "dev", "npm", "install"}
    to_add = []
    for item in checked_items:
        words = re.findall(r"[a-zA-Z]{3,}", item.lower())
        key_words = [w for w in words if w not in stop_words][:5]
        if not key_words:
            continue
        matches = sum(1 for w in key_words if w in done_lower)
        if matches < max(2, len(key_words) // 2):
            # Clean up the item for DONE section
            clean = re.sub(r"^\[P\d\]\s*", "", item)
            clean = re.sub(r"^✅\s*", "", clean)
            to_add.append(clean)

    if not to_add:
        return

    # Insert before the last line of DONE section
    result = []
    in_done = False
    inserted = False
    for line in lines:
        if re.match(r"^##\s+DONE", line):
            in_done = True
            result.append(line)
            continue

        if in_done and not inserted and (re.match(r"^##\s+", line) and not re.match(r"^###", line)):
            # Check if this is end of DONE or empty line before next section
            if re.match(r"^##\s+", line) and not re.match(r"^###", line):
                for item in to_add:
                    result.append(f"- [x] {item}")
                inserted = True

        result.append(line)

    if not inserted:
        # Append at end
        for item in to_add:
            result.append(f"- [x] {item}")

    roadmap_path.write_text("\n".join(result) + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# C11: ROADMAP [x] items vs filesystem — physical proof in code
# ---------------------------------------------------------------------------

# Terms that indicate a conceptual/process task, not a code deliverable
CONCEPTUAL_INDICATORS = [
    "review", "design", "plan", "research", "decide", "discuss",
    "purchase", "buy", "contact", "outreach", "setup account",
    "branch protection", "domain", "konto", "zakup",
]

# Patterns to extract from task descriptions for filesystem search
FILE_PATH_PATTERN = re.compile(r"[\w/]+\.(tsx?|jsx?|ts|js|css|md|json|prisma|sh|py|yml|yaml|svg)")
COMPONENT_PATTERN = re.compile(r"\b([A-Z][a-zA-Z]+(?:[A-Z][a-zA-Z]+)*(?:\.tsx?)?)\b")
FUNCTION_PATTERN = re.compile(r"\b([a-z][a-zA-Z]*(?:Action|Handler|Query|Mutation|Fetcher|Service|Util|Helper|Middleware|Provider|Context)\b)")
ROUTE_PATTERN = re.compile(r"`(/[^\s`]+)`")
FEATURE_KEYWORDS = [
    "Header", "Footer", "Hero", "Card", "Badge", "Filter", "Search",
    "Pagination", "Breadcrumb", "Sidebar", "Modal", "Dialog", "Form",
    "Dashboard", "Admin", "Catalog", "Profile", "Map", "Register",
    "Login", "Sign", "Auth", "Middleware", "Action", "API", "Route",
    "Seed", "Migration", "Schema", "Model", "Component", "Page",
    "ISR", "revalidate", "metadata", "SEO", "generateMetadata",
    "Clerk", "Prisma", "Upload", "Email", "Newsletter", "Stripe",
    "PWA", "Manifest", "Analytics", "Plausible", "Resend",
    "Cafe", "Roaster", "Review", "Saved", "Featured", "Verified",
    "Amenity", "Amenities", "serving", "openingHours",
]


def check_c11() -> CheckResult:
    r = CheckResult("C11", "ROADMAP [x] vs filesystem — physical proof", "critical")

    roadmap = read_file("ROADMAP.md")
    if not roadmap:
        r.skip("ROADMAP.md not found")
        return r

    # Collect [x] items from NOW and NEXT (not DONE or HUMAN ONLY)
    checked_items: list[tuple[str, str]] = []  # (section, item_text)
    current_section = ""
    in_done = False
    in_human = False

    for line in roadmap.splitlines():
        if re.match(r"^##\s+DONE", line):
            in_done = True
            continue
        if "HUMAN ONLY" in line:
            in_human = True
            continue
        if re.match(r"^##\s+", line) and not re.match(r"^###", line):
            in_done = False
            in_human = False
            continue
        if re.match(r"^###\s+(.+)", line):
            m = re.match(r"^###\s+(.+)", line)
            if m:
                current_section = m.group(1).strip()
            continue

        if not in_done and not in_human:
            m = re.match(r"^- \[x\]\s+(.+)", line)
            if m:
                checked_items.append((current_section, m.group(1).strip()))

    if not checked_items:
        r.warn("No [x] items found in NOW/NEXT sections to verify")
        return r

    # Build a searchable index of all file contents
    searchable_files: list[tuple[str, str]] = []  # (relative_path, content_lower)
    src_dir = ROOT / "web" / "src"
    prisma_dir = ROOT / "web" / "prisma"
    tools_dir = ROOT / "tools"
    docs_dir = ROOT / "docs"
    config_files = ["package.json", "next.config.ts", "tailwind.config.ts", "prisma.config.ts"]

    for directory in [src_dir, prisma_dir, tools_dir, docs_dir]:
        if directory.exists():
            for f in directory.rglob("*"):
                if f.is_file() and f.suffix in (".ts", ".tsx", ".js", ".jsx", ".md", ".json", ".prisma", ".py", ".sh", ".yml", ".yaml", ".css", ".svg"):
                    rel = str(f.relative_to(ROOT))
                    # Skip node_modules, .next, generated files
                    if "node_modules" in rel or "/.next/" in rel:
                        continue
                    try:
                        content = f.read_text(encoding="utf-8", errors="ignore").lower()
                        searchable_files.append((rel, content))
                    except (OSError, UnicodeDecodeError):
                        continue

    for cfg in config_files:
        f = ROOT / "web" / cfg
        if f.exists():
            try:
                content = f.read_text(encoding="utf-8", errors="ignore").lower()
                searchable_files.append((f"web/{cfg}", content))
            except (OSError, UnicodeDecodeError):
                continue

    # Also check root-level files
    for root_file in ["ROADMAP.md", "PROJECT_STATUS.md", "CLAUDE.md", "AGENTS.md"]:
        f = ROOT / root_file
        if f.exists():
            try:
                content = f.read_text(encoding="utf-8", errors="ignore").lower()
                searchable_files.append((root_file, content))
            except (OSError, UnicodeDecodeError):
                continue

    no_proof = []

    for section, item_text in checked_items:
        # Skip conceptual/process tasks
        item_lower = item_text.lower()
        if any(ind in item_lower for ind in CONCEPTUAL_INDICATORS):
            continue

        # Skip items that are clearly about future work (contain "TODO", "planned")
        if "todo" in item_lower or "planned" in item_lower:
            continue

        proof_found = False

        # Strategy 1: Look for explicit file paths in the task description
        file_paths = FILE_PATH_PATTERN.findall(item_text)
        for fp in file_paths:
            for file_path, _ in searchable_files:
                if fp in file_path:
                    proof_found = True
                    break
            if proof_found:
                break

        # Strategy 2: Look for route patterns like `/cafes`, `/register`
        if not proof_found:
            routes = ROUTE_PATTERN.findall(item_text)
            for route in routes:
                route_clean = route.strip("/")
                for file_path, content in searchable_files:
                    if route_clean in file_path or route in content:
                        proof_found = True
                        break
                if proof_found:
                    break

        # Strategy 3: Look for component/class names (PascalCase words)
        if not proof_found:
            components = COMPONENT_PATTERN.findall(item_text)
            for comp in components:
                if len(comp) < 3:
                    continue
                comp_lower = comp.lower()
                for file_path, content in searchable_files:
                    if comp_lower in file_path or comp_lower in content:
                        proof_found = True
                        break
                if proof_found:
                    break

        # Strategy 4: Look for feature keywords in file names or content
        if not proof_found:
            words = re.findall(r"[a-zA-Z]{3,}", item_lower)
            meaningful_words = [w for w in words if w.lower() in [f.lower() for f in FEATURE_KEYWORDS]]
            if meaningful_words:
                for file_path, content in searchable_files:
                    if all(kw in content for kw in meaningful_words):
                        proof_found = True
                        break

        # Strategy 5: Fuzzy — at least 3 unique words from task appear in same file
        if not proof_found:
            words = set(re.findall(r"[a-zA-Z]{4,}", item_lower))
            stop = {"the", "and", "for", "from", "with", "this", "that", "have", "been",
                     "add", "update", "fix", "new", "all", "each", "every", "more",
                     "like", "just", "also", "very", "much", "some", "than", "them",
                     "when", "then", "into", "only", "over", "such", "will", "would",
                     "other", "their", "there", "after", "before", "between", "about"}
            meaningful = words - stop
            if len(meaningful) >= 3:
                for file_path, content in searchable_files:
                    matches = sum(1 for w in meaningful if w in content)
                    if matches >= 3:
                        proof_found = True
                        break

        if not proof_found:
            no_proof.append(item_text[:80])

    if no_proof:
        r.fail(
            f"{len(no_proof)} completed task(s) lack physical proof in code: {'; '.join(no_proof[:5])}",
            auto_fixable=False,
        )

    return r


# ---------------------------------------------------------------------------
# C8: Prisma datasource url + directUrl
# ---------------------------------------------------------------------------

def check_c8() -> CheckResult:
    r = CheckResult("C8", "Prisma 7 datasource config (prisma.config.ts)", "low")

    schema = read_file("web/prisma/schema.prisma")
    if not schema:
        r.skip("web/prisma/schema.prisma not found")
        return r

    # Prisma 7.5+ can configure datasource via prisma.config.ts instead of schema.prisma
    prisma_config = read_file("web/prisma.config.ts")
    if prisma_config and "datasource" in prisma_config and "url" in prisma_config:
        # datasource is configured in prisma.config.ts — schema.prisma doesn't need url/directUrl
        return r

    # Extract datasource block
    ds_match = re.search(r"datasource\s+\w+\s*\{([^}]+)\}", schema)
    if not ds_match:
        r.fail("No datasource block found in schema.prisma", auto_fixable=False)
        return r

    ds_body = ds_match.group(1)
    has_url = bool(re.search(r"\burl\s*=", ds_body))
    has_direct = bool(re.search(r"\bdirectUrl\s*=", ds_body))

    missing = []
    if not has_url:
        missing.append("url")
    if not has_direct:
        missing.append("directUrl")

    if missing:
        r.fail(
            f"Datasource block missing: {', '.join(missing)}",
            auto_fixable=True,
            fix_action=f"Add {', '.join(missing)} to datasource block",
        )

    return r


def fix_c8():
    """Add missing url/directUrl to prisma datasource block (Prisma 6 fallback only)."""
    # Prisma 7+: datasource configured in prisma.config.ts — do NOT modify schema.prisma
    prisma_config = read_file("web/prisma.config.ts")
    if prisma_config and "datasource" in prisma_config and "url" in prisma_config:
        return

    schema_path = ROOT / "web" / "prisma" / "schema.prisma"
    content = schema_path.read_text(encoding="utf-8")

    ds_match = re.search(r"(datasource\s+\w+\s*\{)([^}]+)(\})", content)
    if not ds_match:
        return

    ds_body = ds_match.group(2)
    additions = []

    if not re.search(r"\burl\s*=", ds_body):
        additions.append('  url       = env("DATABASE_URL")')
    if not re.search(r"\bdirectUrl\s*=", ds_body):
        additions.append('  directUrl = env("DIRECT_URL")')

    if not additions:
        return

    new_body = ds_body.rstrip() + "\n" + "\n".join(additions) + "\n"
    content = content[:ds_match.start(2)] + new_body + content[ds_match.end(2):]
    schema_path.write_text(content, encoding="utf-8")


# ---------------------------------------------------------------------------
# Main runner
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# C9: ISR — revalidate = 3600 on pages using db.*  (Reguła 1 z AGENTS.md)
# ---------------------------------------------------------------------------

def check_c9() -> CheckResult:
    r = CheckResult("C9", "ISR revalidate on DB pages (Reguła 1)", "medium")

    app_dir = ROOT / "web" / "src" / "app"
    if not app_dir.exists():
        r.skip("web/src/app not found")
        return r

    violations = []
    for page in app_dir.rglob("page.tsx"):
        content = page.read_text(encoding="utf-8")
        uses_db = ('from "@/lib/db"' in content or "from '@/lib/db'" in content)
        if uses_db and "export const revalidate" not in content:
            violations.append(str(page.relative_to(ROOT)))

    if violations:
        r.warn(f"DB pages missing revalidate: {', '.join(violations)}")

    return r


# ---------------------------------------------------------------------------
# C10: Audit screenshots cleanup — orphan screenshots + stale audit reports
# ---------------------------------------------------------------------------

def check_c10() -> CheckResult:
    r = CheckResult("C10", "Audit screenshots cleanup", "low")

    tmp_dir = ROOT / ".tmp"
    if not tmp_dir.exists():
        r.skip(".tmp directory not found")
        return r

    audit_files = sorted(tmp_dir.glob("audit-*.md"))
    issues = []

    # Stale audit reports (not the most recent)
    if len(audit_files) > 1:
        for old_report in audit_files[:-1]:
            issues.append(f"Stale audit report: {old_report.name}")

    # Screenshots for fully resolved audits
    for audit_file in audit_files:
        content = audit_file.read_text(encoding="utf-8")
        open_issues = re.findall(r"- \[ \]", content)
        if len(open_issues) == 0:
            date_match = re.search(r"audit-(\d{4}-\d{2}-\d{2})", audit_file.name)
            if date_match:
                screenshots_dir = tmp_dir / "screenshots" / f"audit-{date_match.group(1)}"
                if screenshots_dir.exists():
                    issues.append(f"Orphan screenshots (all issues resolved): {screenshots_dir.relative_to(ROOT)}")

    if issues:
        r.fail(
            f"Cleanup needed ({len(issues)} item(s)): {'; '.join(issues)}",
            auto_fixable=True,
            fix_action="Delete orphan screenshots and stale audit reports",
        )

    return r


def fix_c10():
    """Delete orphan screenshot dirs and stale audit reports."""
    import shutil

    tmp_dir = ROOT / ".tmp"
    if not tmp_dir.exists():
        return

    audit_files = sorted(tmp_dir.glob("audit-*.md"))

    # Delete stale audit reports (keep only the most recent)
    if len(audit_files) > 1:
        for old_report in audit_files[:-1]:
            # Only delete if there are no open issues (safety check)
            content = old_report.read_text(encoding="utf-8")
            open_issues = re.findall(r"- \[ \]", content)
            if len(open_issues) == 0:
                old_report.unlink()

    # Delete screenshots for fully resolved audits
    for audit_file in audit_files:
        content = audit_file.read_text(encoding="utf-8")
        open_issues = re.findall(r"- \[ \]", content)
        if len(open_issues) == 0:
            date_match = re.search(r"audit-(\d{4}-\d{2}-\d{2})", audit_file.name)
            if date_match:
                screenshots_dir = tmp_dir / "screenshots" / f"audit-{date_match.group(1)}"
                if screenshots_dir.exists():
                    shutil.rmtree(screenshots_dir)


ALL_CHECKS = [check_c1, check_c2, check_c3, check_c4, check_c5, check_c6, check_c7, check_c8, check_c9, check_c10, check_c11]

FIX_MAP = {
    "C2": fix_c2,
    "C3": fix_c3,
    "C4": fix_c4,
    "C7": fix_c7,
    "C8": fix_c8,
    "C10": fix_c10,
}

AUTO_FIXABLE_IDS = set(FIX_MAP.keys())


def run_checks() -> dict:
    start = datetime.now(timezone.utc)
    results = []
    for check_fn in ALL_CHECKS:
        result = check_fn()
        results.append(result.to_dict())
    duration_ms = int((datetime.now(timezone.utc) - start).total_seconds() * 1000)

    summary = {"total": len(results)}
    for status in ("PASS", "FAIL", "WARN", "SKIP"):
        summary[status.lower()] = sum(1 for r in results if r["status"] == status)

    return {
        "timestamp": start.isoformat(),
        "duration_ms": duration_ms,
        "checks": results,
        "summary": summary,
    }


def run_fixes(fix_ids: list[str]) -> list[str]:
    """Apply fixes for given check IDs. Returns list of applied fix descriptions."""
    applied = []
    for fid in fix_ids:
        fid_upper = fid.upper()
        if fid_upper in FIX_MAP:
            FIX_MAP[fid_upper]()
            applied.append(f"Fixed {fid_upper}")
    return applied


def main():
    if "--fix" in sys.argv:
        idx = sys.argv.index("--fix")
        if idx + 1 < len(sys.argv):
            fix_arg = sys.argv[idx + 1]
            if fix_arg.lower() == "all":
                ids_to_fix = list(AUTO_FIXABLE_IDS)
            else:
                ids_to_fix = [x.strip() for x in fix_arg.split(",")]
        else:
            ids_to_fix = list(AUTO_FIXABLE_IDS)

        applied = run_fixes(ids_to_fix)
        # Re-run checks after fixes
        report = run_checks()
        report["fixes_applied"] = applied
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        report = run_checks()
        print(json.dumps(report, indent=2, ensure_ascii=False))

    # Exit code: 1 if any FAIL, 0 otherwise
    has_fail = any(c["status"] == "FAIL" for c in report["checks"])
    sys.exit(1 if has_fail else 0)


if __name__ == "__main__":
    main()

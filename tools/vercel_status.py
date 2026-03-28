#!/usr/bin/env python3
"""
Vercel deployment status via GitHub Deployments API.
Uses 'gh api' — no VERCEL_TOKEN required. Works as long as 'gh' CLI is authenticated.

vercel[bot] writes deployment statuses (including environment_url) to GitHub
after every push. This script reads those statuses.

Usage:
    python tools/vercel_status.py                      # current branch
    python tools/vercel_status.py --branch feat/foo   # specific branch
    python tools/vercel_status.py --env Production    # filter by environment
    python tools/vercel_status.py --json              # machine-readable output
    python tools/vercel_status.py --wait              # wait up to 120s for deployment
"""

import json
import subprocess
import sys
import time
from datetime import datetime


def run(cmd: list[str]) -> str:
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(cmd)}\n{result.stderr.strip()}")
    return result.stdout.strip()


def get_current_branch() -> str:
    return run(["git", "rev-parse", "--abbrev-ref", "HEAD"])


def get_head_sha() -> str:
    return run(["git", "rev-parse", "HEAD"])


def get_repo() -> str:
    return run(["gh", "repo", "view", "--json", "nameWithOwner", "--jq", ".nameWithOwner"])


def fetch_deployments(repo: str, ref: str = None, env: str = None) -> list:
    url = f"repos/{repo}/deployments?per_page=20"
    if ref:
        url += f"&ref={ref}"
    if env:
        url += f"&environment={env}"
    raw = run(["gh", "api", url])
    return json.loads(raw)


def fetch_statuses(repo: str, deployment_id: int) -> list:
    raw = run(["gh", "api", f"repos/{repo}/deployments/{deployment_id}/statuses"])
    return json.loads(raw)


def get_deployments_for_branch(repo: str, branch: str, env: str = None) -> list:
    """Try by branch name first, fall back to HEAD SHA."""
    deps = fetch_deployments(repo, ref=branch, env=env)
    if not deps:
        sha = get_head_sha()
        deps = fetch_deployments(repo, ref=sha, env=env)
    return deps


def enrich(repo: str, dep: dict) -> dict:
    statuses = fetch_statuses(repo, dep["id"])
    latest = statuses[0] if statuses else None
    return {
        "id": dep["id"],
        "environment": dep["environment"],
        "ref": dep["ref"],
        "sha": dep.get("sha", "")[:10],
        "created_at": dep["created_at"],
        "state": latest["state"] if latest else "unknown",
        "url": latest.get("environment_url", "") if latest else "",
        "description": latest.get("description", "") if latest else "",
        "log_url": latest.get("log_url", "") if latest else "",
    }


STATE_ICON = {
    "success": "✅",
    "failure": "❌",
    "error": "❌",
    "in_progress": "🔄",
    "pending": "⏳",
    "queued": "⏳",
    "unknown": "❓",
}


def print_result(results: list, branch: str, repo: str) -> None:
    print(f"\nDeploymenty dla: {branch}")
    print(f"Repo: {repo}")
    print("─" * 60)
    if not results:
        print("  Brak deploymentów. Vercel może jeszcze nie zarejestrować tego brancha.")
        print("  Spróbuj za chwilę lub sprawdź czy Vercel jest podłączony do repo.")
        return
    for r in results:
        icon = STATE_ICON.get(r["state"], "❓")
        print(f"{icon} [{r['environment']}] {r['state']}")
        if r["url"]:
            print(f"   URL: {r['url']}")
        if r["log_url"] and r["state"] in ("failure", "error"):
            print(f"   Logi: {r['log_url']}")
        if r["description"] and r["state"] in ("failure", "error"):
            print(f"   Info: {r['description'][:100]}")
        print(f"   Ref: {r['ref'][:40]}  SHA: {r['sha']}")
        print(f"   Czas: {r['created_at']}")
        print()


def main() -> None:
    args = sys.argv[1:]
    branch = None
    env_filter = None
    output_json = "--json" in args
    wait_mode = "--wait" in args

    if "--branch" in args:
        idx = args.index("--branch")
        branch = args[idx + 1]
    if "--env" in args:
        idx = args.index("--env")
        env_filter = args[idx + 1]

    if branch is None:
        branch = get_current_branch()

    try:
        repo = get_repo()
    except RuntimeError as e:
        print(f"Błąd: nie udało się ustalić repo GitHub.\n{e}", file=sys.stderr)
        sys.exit(1)

    # Wait mode: poll until success/failure or timeout
    if wait_mode:
        deadline = time.time() + 120
        print(f"Czekam na deployment brancha {branch} (max 120s)...")
        while time.time() < deadline:
            deps = get_deployments_for_branch(repo, branch, env_filter)
            if deps:
                enriched = [enrich(repo, d) for d in deps[:3]]
                terminal = [r for r in enriched if r["state"] in ("success", "failure", "error")]
                if terminal:
                    break
            time.sleep(8)
        # Fall through to normal output

    deps = get_deployments_for_branch(repo, branch, env_filter)
    enriched = [enrich(repo, d) for d in deps[:5]]

    if output_json:
        print(json.dumps(enriched, indent=2))
        return

    print_result(enriched, branch, repo)


if __name__ == "__main__":
    main()

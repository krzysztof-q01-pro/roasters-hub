#!/usr/bin/env python3
"""
HTTP smoke test for deployed Vercel preview or production URL.
Uses only stdlib (urllib) — no extra dependencies.

Usage:
    python tools/smoke_test.py --url https://beanmap-web.vercel.app
    python tools/smoke_test.py --url https://beanmap-web-git-feat-xxx.vercel.app
    python tools/smoke_test.py --url <base> --json

Exit codes:
    0 — all checks PASS
    1 — one or more checks FAIL
"""

import json
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

ROUTES = ["/", "/roasters", "/map"]
TIMEOUT = 15  # seconds per request
HEADERS = {"User-Agent": "roasters-hub-smoke-test/1.0"}


def check_route(base_url: str, path: str) -> dict:
    url = base_url.rstrip("/") + path
    start = time.time()
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            elapsed_ms = int((time.time() - start) * 1000)
            return {
                "path": path,
                "url": url,
                "status": resp.status,
                "ok": resp.status == 200,
                "elapsed_ms": elapsed_ms,
                "error": None,
            }
    except urllib.error.HTTPError as e:
        elapsed_ms = int((time.time() - start) * 1000)
        return {
            "path": path,
            "url": url,
            "status": e.code,
            "ok": False,
            "elapsed_ms": elapsed_ms,
            "error": str(e),
        }
    except urllib.error.URLError as e:
        elapsed_ms = int((time.time() - start) * 1000)
        return {
            "path": path,
            "url": url,
            "status": None,
            "ok": False,
            "elapsed_ms": elapsed_ms,
            "error": f"URLError: {e.reason}",
        }
    except Exception as e:
        elapsed_ms = int((time.time() - start) * 1000)
        return {
            "path": path,
            "url": url,
            "status": None,
            "ok": False,
            "elapsed_ms": elapsed_ms,
            "error": str(e),
        }


def main() -> None:
    args = sys.argv[1:]

    if "--url" not in args:
        print("Użycie: python tools/smoke_test.py --url <base_url> [--json]")
        print("Przykład: python tools/smoke_test.py --url https://beanmap-web.vercel.app")
        sys.exit(1)

    base_url = args[args.index("--url") + 1]
    output_json = "--json" in args

    results = [check_route(base_url, path) for path in ROUTES]
    all_pass = all(r["ok"] for r in results)

    report = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "base_url": base_url,
        "overall": "PASS" if all_pass else "FAIL",
        "checks": results,
    }

    if output_json:
        print(json.dumps(report, indent=2))
        sys.exit(0 if all_pass else 1)

    print(f"\nSmoke Test: {base_url}")
    print(f"Wynik: {'✅ PASS' if all_pass else '❌ FAIL'}")
    print("─" * 55)
    for r in results:
        icon = "✅" if r["ok"] else "❌"
        status_str = str(r["status"]) if r["status"] else "ERR"
        print(f"  {icon} {r['path']:<20} {status_str:<6} {r['elapsed_ms']}ms")
        if r["error"]:
            print(f"       Błąd: {r['error']}")
    print()

    sys.exit(0 if all_pass else 1)


if __name__ == "__main__":
    main()

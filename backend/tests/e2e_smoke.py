"""
End-to-end smoke test — ingest a small repo and verify all endpoints.
Run with: .venv\Scripts\python tests/e2e_smoke.py
"""
import urllib.request
import urllib.parse
import urllib.error
import json
import time
import sys

BASE = "http://127.0.0.1:8000"
REPO = "https://github.com/pallets/click"


def _get(path, params=None, timeout=60):
    url = f"{BASE}{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, {}
    except Exception as e:
        return 0, {"error": str(e)}


def _post(path, body, timeout=60):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{BASE}{path}", data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = {}
        try:
            body = json.loads(e.read())
        except Exception:
            pass
        return e.code, body
    except Exception as e:
        return 0, {"error": str(e)}


def check(label, status, data, expected=200):
    ok = status == expected
    mark = "✓" if ok else "✗"
    print(f"  {mark} {label}: HTTP {status}")
    if not ok:
        print(f"    → {data}")
    return ok


def main():
    print("\n╔══════════════════════════════════════════╗")
    print("║   CodeSleuth AI — E2E Smoke Test         ║")
    print("╚══════════════════════════════════════════╝\n")

    # ── Health ────────────────────────────────────────────────────────────────
    print("▶ Health checks")
    check("/health", *_get("/health"))
    check("/",       *_get("/"))

    # ── Ingest ────────────────────────────────────────────────────────────────
    print("\n▶ POST /api/ingest")
    status, data = _post("/api/ingest", {"repo_url": REPO, "branch": "main"})
    check("ingest accepted", status, data, expected=202)
    sid = data.get("session_id", "")
    print(f"  session_id: {sid}")
    if not sid:
        print("  ✗ No session_id returned — aborting.")
        sys.exit(1)

    # ── Status poll ───────────────────────────────────────────────────────────
    print("\n▶ Polling /api/ingest/{sid}/status (max 5 min) …")
    final_status = None
    for i in range(60):           # 60 × 5s = 5 min max
        time.sleep(5)
        _, s = _get(f"/api/ingest/{sid}/status")
        prog   = s.get("progress", 0)
        state  = s.get("status", "?")
        filled = "█" * (prog // 5)
        empty  = "░" * (20 - prog // 5)
        print(f"  [{(i+1)*5:3d}s] [{filled}{empty}] {prog:3d}%  {state}")
        if state in ("ready", "error"):
            final_status = state
            if state == "error":
                print(f"  ✗ Pipeline error: {s.get('error')}")
                sys.exit(1)
            print(f"  ✓ Repo: {s.get('repo_name')}  |  Files: {s.get('total_files')}"
                  f"  |  Lines: {s.get('total_lines')}")
            break
    else:
        print("  ✗ Timed out after 5 minutes")
        sys.exit(1)

    # ── Feature endpoints ─────────────────────────────────────────────────────
    print("\n▶ Feature endpoints")

    st, data = _get("/api/overview", {"session_id": sid})
    if check("GET /api/overview", st, data) and st == 200:
        print(f"     files={data['total_files']} lines={data['total_lines']} "
              f"complexity={data['complexity_score']} risk={data['risk_score']}")

    st, data = _get("/api/graph", {"session_id": sid, "graph_type": "dependency"})
    if check("GET /api/graph (dependency)", st, data) and st == 200:
        print(f"     nodes={len(data['nodes'])} edges={len(data['edges'])}")

    st, data = _get("/api/graph", {"session_id": sid, "graph_type": "call"})
    if check("GET /api/graph (call)", st, data) and st == 200:
        print(f"     nodes={len(data['nodes'])} edges={len(data['edges'])}")

    st, data = _get("/api/flow", {"session_id": sid, "entry_point": "main"})
    if check("GET /api/flow", st, data) and st == 200:
        print(f"     steps={data['total_steps']} max_depth={data['max_depth']} "
              f"cycles={data['has_cycles']}")

    st, data = _get("/api/risk", {"session_id": sid})
    if check("GET /api/risk", st, data) and st == 200:
        sm = data.get("summary", {})
        print(f"     total={data['total_risks']} score={data['risk_score']} "
              f"critical={sm.get('critical',0)} high={sm.get('high',0)}")

    st, data = _post("/api/query", {
        "session_id": sid,
        "question": "What is the main entry point of this codebase?",
        "mode": "engineer",
    }, timeout=90)
    if check("POST /api/query", st, data) and st == 200:
        print(f"     confidence={data['confidence']} "
              f"highlights={len(data['highlighted_nodes'])}")
        print(f"     answer: {data['answer'][:120]}…")

    st, files = _get("/api/explain/files", {"session_id": sid})
    if check("GET /api/explain/files", st, files) and st == 200 and files:
        first = files[0]["path"]
        st2, ex = _get("/api/explain", {
            "session_id": sid, "target": first, "mode": "intern"
        }, timeout=90)
        if check(f"GET /api/explain ({first})", st2, ex) and st2 == 200:
            print(f"     summary: {ex.get('summary','')[:120]}")

    print("\n╔══════════════════════════════════════════╗")
    print("║   All checks complete ✓                  ║")
    print("╚══════════════════════════════════════════╝\n")


if __name__ == "__main__":
    main()

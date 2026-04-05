# CodeSleuth AI — Backend

> Multi-agent code intelligence platform. Ingest any GitHub repository and understand it through dependency visualization, execution flow tracing, risk detection, and natural language Q&A — powered by Grok 3 Mini.

---

## Architecture Overview

```
backend/
├── main.py                  # FastAPI entry point
├── config.py                # Pydantic settings (all env vars)
├── api/                     # Route handlers (one per feature page)
│   ├── ingest.py            # POST /api/ingest + status polling
│   ├── overview.py          # GET  /api/overview
│   ├── graph.py             # GET  /api/graph
│   ├── flow.py              # GET  /api/flow
│   ├── risk.py              # GET  /api/risk
│   ├── query.py             # POST /api/query
│   └── explain.py           # GET  /api/explain
├── agents/                  # AI orchestration layer
│   ├── supervisor.py        # Pipeline orchestrator
│   ├── ingestion_agent.py   # Clone + parse + index
│   ├── graph_agent.py       # Build dependency/call graphs
│   ├── flow_agent.py        # BFS execution flow tracer
│   ├── risk_agent.py        # Rule-based risk detection
│   ├── query_agent.py       # Grounded NLP Q&A
│   └── explain_agent.py     # Multi-level code explanations
├── services/                # Pure logic (no AI)
│   ├── grok_service.py      # xAI Grok API wrapper
│   ├── repo_service.py      # Git clone + file tree walker
│   ├── parser_service.py    # AST parsing (Python/JS/TS/Go/Java)
│   ├── graph_service.py     # NetworkX graph builder
│   ├── index_service.py     # sentence-transformers + ChromaDB
│   └── cache_service.py     # Disk-persistent diskcache
├── models/                  # Pydantic schemas
├── utils/                   # Logger, language detector, pattern matcher
└── tests/                   # pytest test suite
```

---

## Quick Start

### 1. Clone & enter the backend directory
```bash
cd backend
```

### 2. Create a virtual environment
```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment
```bash
cp .env.example .env
# Edit .env and add your GROK_API_KEY
```

### 5. Run the server
```bash
uvicorn main:app --reload --port 8000
```

The API is available at **http://localhost:8000**
Interactive docs at **http://localhost:8000/docs**

---

## API Reference

| Method | Endpoint | Page | Description |
|--------|----------|------|-------------|
| `POST` | `/api/ingest` | Landing | Start repo ingestion, returns `session_id` |
| `GET`  | `/api/ingest/{id}/status` | Landing | Poll ingestion progress (0–100%) |
| `DELETE` | `/api/ingest/{id}` | — | Delete session and cached data |
| `GET`  | `/api/overview?session_id=` | Overview Dashboard | Repo stats, language breakdown, complexity |
| `GET`  | `/api/graph?session_id=&type=dependency\|call` | Graph Explorer | Nodes + edges with optional highlight |
| `GET`  | `/api/flow?session_id=&entry_point=` | Execution Flow | BFS call-chain from entry point |
| `GET`  | `/api/flow/entry-points?session_id=` | Execution Flow | List detected entry points |
| `GET`  | `/api/risk?session_id=` | Risk Intelligence | All risk items with severity |
| `POST` | `/api/query` | Ask Repo Anything | NLP answer + highlighted node IDs |
| `GET`  | `/api/explain?session_id=&target=&mode=` | Detail Page | Multi-level explanation |
| `GET`  | `/api/explain/files?session_id=` | Detail Page | List all files with functions |

---

## Agent Pipeline

```
POST /api/ingest
    │
    ▼
SupervisorAgent
    │
    ├─ IngestionAgent ──► clone → parse ASTs → vector index (ChromaDB)
    │
    ├─ GraphAgent ──────► NetworkX dep + call graphs → cache
    │  (parallel)
    └─ RiskAgent ────────► 5 detectors → risk score → cache
                                │
                                ▼
                           status: "ready"

[On demand]
POST /api/query  ──► QueryAgent ──► ChromaDB retrieval → Grok → answer + highlights
GET  /api/explain ──► ExplainAgent ──► retrieval → Grok (mode-aware) → structured explanation
GET  /api/flow ──────► FlowAgent ──► BFS on call graph → ordered execution path
```

---

## Graph Highlighting Integration

When `/api/query` returns `highlighted_nodes`, pass them to `/api/graph`:

```
GET /api/graph?session_id=abc&type=dependency&highlighted_nodes=src/auth.py,src/jwt.py
```

The response will set `highlighted: true` on those node objects, which the frontend Graph Explorer can render with a distinct visual style.

---

## Multi-Level Explanations

`mode` parameter accepted by `/api/query` and `/api/explain`:

| Mode | Audience | Style |
|------|----------|-------|
| `intern` | Junior developer / new hire | Analogies, plain language, encourage exploration |
| `engineer` | Senior developer | Precise technical terms, patterns, tradeoffs |
| `architect` | Principal / Staff engineer | System design, SOLID, scalability, strategic risks |

---

## Risk Detection Categories

| Category | Method | Severity |
|----------|--------|----------|
| `circular_dependency` | `nx.simple_cycles()` | high |
| `hardcoded_secret` | 14 regex patterns | critical → medium |
| `oversized_file` | Line count threshold | high / medium |
| `tight_coupling` | In/out-degree centrality | medium |
| `single_point_of_failure` | Betweenness centrality | high |

---

## Running Tests

```bash
# From backend/
pytest tests/ -v
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROK_API_KEY` | ✅ | — | xAI Grok API key |
| `GROK_MODEL` | | `grok-3-mini` | Model name |
| `GROK_BASE_URL` | | `https://api.x.ai/v1` | Grok API base URL |
| `GITHUB_TOKEN` | optional | — | For private repos |
| `CORS_ORIGINS` | | `http://localhost:3000,...` | Comma-separated allowed origins |
| `EMBEDDING_MODEL` | | `all-MiniLM-L6-v2` | sentence-transformers model |
| `STORAGE_PATH` | | `./storage` | Cloned repos + cache |
| `OVERSIZED_FILE_THRESHOLD` | | `500` | Lines threshold for oversized risk |
| `COUPLING_THRESHOLD` | | `10` | Max in/out degree for coupling risk |

---

## Connecting to the Stitch Frontend

1. Set `BACKEND_URL=http://localhost:8000` in the Stitch frontend's environment
2. On form submit (Landing Page) → `POST /api/ingest` → save `session_id` to app state
3. Poll `GET /api/ingest/{session_id}/status` every 2 seconds, display progress bar
4. When `status === "ready"` → navigate to Overview Dashboard with `?session_id=...`
5. All subsequent pages append `?session_id=...` to their respective API calls
6. After `POST /api/query`, take `highlighted_nodes[]` → refetch graph with those IDs

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI + uvicorn |
| AI / LLM | Grok 3 Mini (xAI) via OpenAI-compatible SDK |
| Embeddings | `sentence-transformers` (`all-MiniLM-L6-v2`) — local, free |
| Vector Store | ChromaDB (local persistent) |
| Graph Analysis | NetworkX |
| Git Cloning | GitPython (shallow clone) |
| Code Parsing | Python AST + regex (JS/TS/Go/Java) |
| Caching | diskcache (disk-persistent, survives restarts) |
| Logging | Loguru |
| Validation | Pydantic v2 |
| Testing | pytest + httpx |

# CodeSleuth AI — Frontend

Premium React + TypeScript frontend for the CodeSleuth AI multi-agent code intelligence platform.

## Stack

| Technology | Purpose |
|---|---|
| Vite + React 19 + TypeScript | Core framework |
| Tailwind CSS v4 | Utility-first styling |
| React Router v7 | Client-side routing |
| Zustand | Global state + localStorage persistence |
| React Flow (@xyflow/react) | Dependency & call graph visualisation |
| Axios | HTTP client with typed error handling |
| Lucide React | Icon system |

## Setup

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env if your backend runs on a different port
# VITE_BACKEND_URL=http://localhost:8000

# 3. Install dependencies
npm install

# 4. Start dev server
npm run dev
```

Open http://localhost:5173

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_BACKEND_URL` | `http://localhost:8000` | Backend FastAPI base URL |

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | LandingPage | Hero + repo URL form |
| `/ingest/:sessionId` | IngestProgressPage | Polling progress with phase stepper |
| `/overview/:sessionId` | OverviewPage | Stats, languages, modules, nav cards |
| `/graph/:sessionId` | GraphExplorerPage | React Flow dependency/call graph |
| `/flow/:sessionId` | FlowVisualizerPage | Execution flow timeline |
| `/risk/:sessionId` | RiskIntelligencePage | Risk cards with severity filter |
| `/query/:sessionId` | AskRepoPage | AI chat with source citations |
| `/explain/:sessionId` | ExplainDetailPage | File/module explanations |

## Project Structure

```
src/
  app/           # Router + providers
  components/
    layout/      # AppLayout (sidebar), PageHeader
    shared/      # StatCard, Badges, UI primitives
  hooks/         # useIngestPolling, useSessionGuard
  lib/           # constants.ts, utils.ts
  pages/         # One file per route
  services/      # apiClient + one service per backend area + adapters
  store/         # Zustand stores (session, query, graph)
  styles/        # globals.css
  types/         # api.ts (raw), domain.ts (frontend)
```

## Demo Flow

1. Open `/` → paste a GitHub repo URL → click **Analyze Repository**
2. Watch the ingest progress page poll every 2 seconds through all phases
3. Auto-redirect to `/overview/:id` when ready
4. Navigate to **Graph Explorer** to see the dependency graph
5. Go to **Risk Intelligence** to see detected issues
6. Use **Ask Repo** to ask natural language questions
7. Node highlights from Q&A are reflected in the graph page
8. Use **Explain** to get intern/engineer/architect explanations for any file

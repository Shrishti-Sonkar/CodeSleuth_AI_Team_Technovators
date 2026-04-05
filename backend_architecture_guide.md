# CodeSleuth AI: Backend Architecture & Logic Deep Dive

The CodeSleuth AI backend is a complex, multi-agent Python application built on **FastAPI**. It is designed to act as an asynchronous orchestrator that analyzes code repositories through static analysis (AST parsing), graph algorithms (NetworkX), and semantic reasoning (Large Language Models via RAG).

This document explains every layer of the backend, the core logic, and the APIs.

---

## 1. High-Level Architecture Pattern

The backend follows a strict **Controller-Service-Agent** pattern. 

1. **API Routers (`/api/*`)**: The presentation layer. These receive HTTP requests from the frontend React app, validate data models, and pass requests to the Agents.
2. **Agents (`/agents/*`)**: The orchestration layer. Inspired by multi-agent reasoning systems, each agent has a specific domain (e.g., `RiskAgent`, `QueryAgent`). Agents utilize specialized services to build their responses. 
3. **Services (`/services/*`)**: The heavy-lifting layer. This includes pure business logic such as cloning Repositories (`repo_service`), parsing Abstract Syntax Trees (`parser_service`), executing Graph algorithms (`graph_service`), communicating with LLMs (`llm_service`), and interacting with ChromaDB for semantic search (`index_service`).
4. **Storage (`/storage`)**: Local disk persistence. Stores cloned code, ChromaDB vector limits, and cached JSON data to make subsequent runs instantaneous.

---

## 2. API Endpoints & Core Logic

All endpoints are registered in `main.py` under the `/api` prefix.

### A. Core Ingestion & Extraction (The "Engine")

**1. `POST /api/ingest`**
- **Logic**: Receives a GitHub repository URL. The backend immediately queues an asynchronous background task managed by the `Supervisor`. It returns a unique `session_id` to the frontend.

**2. `GET /api/ingest/{session_id}`**
- **Logic**: Long-polling endpoint for the frontend. Checks the `CacheService` to report real-time status (e.g., "cloning", "parsing", "building_graph", "detecting_risks").
- **Agent Handling**: The `IngestionAgent` drives this phase. 
  1. It uses `RepoService` to clone the Git branch.
  2. It uses `ParserService` to traverse every file, building an AST (parsing imports, functions, classes, and logic blocks).
  3. It calls `GraphAgent` to build relationship graphs.
  4. It calls `RiskAgent` to detect code smells and security issues.
  5. It calls `IndexService` to chunk the code and embed it into ChromaDB.

### B. High-Level Insight APIs

**3. `GET /api/overview/{session_id}`**
- **Logic**: Fetches high-level metrics. Returns total files, lines of code, cyclomatic complexity scores, a language breakdown, and identifies top-level entry points. Data is pulled instantly from local cache once ingested.

**4. `GET /api/onboarding/{session_id}`**
- **Logic**: Provides the "Developer Onboarding Mode". 
- **Agent Action**: The `OnboardingAgent` queries the graph to find high-centrality nodes (critical files) and asks the LLM to generate a personalized "Learning Path", "Glossary", and a list of "Key Modules" so new devs know exactly where to start reading.

### C. Visual & Structural APIs

**5. `GET /api/graph/{session_id}?type={dependency|call}`**
- **Logic**: Returns JSON representations (Nodes & Edges) adapted for `ReactFlow` in the frontend.
- **Agent Action**: The `GraphAgent` utilizes `NetworkX` under the hood. 
  - *Dependency Graph*: Links files based on `import` statements. 
  - *Call Graph*: Links actual function/class invocations inside the code.
  - *Heatmap Enrichment*: The `GraphAgent` cross-references NetworkX's "Betweenness Centrality" score with vulnerabilities found by the `RiskAgent` to assign a "Heat Score" (criticality) to each node.

**6. `GET /api/flow/{session_id}?entry_point={file_path}`**
- **Logic**: Generates a directed acyclic trace (or detects loops) of execution paths.
- **Agent Action**: The `FlowAgent` operates as a tracer. Starting at the entry point, it traverses the AST definitions recursively, tracking depth, conditionally branching, and mapping exactly how data flows from function A to function B.

### D. Security & Risk Analysis APIs

**7. `GET /api/risk/{session_id}`**
- **Logic**: Returns a prioritized list of architectural and security vulnerabilities.
- **Agent Action**: The `RiskAgent` applies two phases of logic:
  1. *Structural Checks*: Looks at the graph to find circular dependencies or single points of failure (nodes with extremely high indegrees). Looks at ASTs for oversized files or monolithic functions.
  2. *LLM Checks*: Uses regex and the LLM to find missing error handlers, hardcoded secrets, or poor coupling. It then auto-generates suggestions for fixing them.

**8. `GET /api/critical-files/{session_id}?limit={10}`**
- **Logic**: Ranks the top most "dangerous" files in the repository.
- **Agent Action**: The `CriticalFilesAgent` merges graph centrality data with the risk matrix to highlight which files pose the highest cascading threat if broken.

**9. `POST /api/impact`** (Change Impact Analyzer)
- **Logic**: Blast radius calculation for a proposed file edit.
- **Agent Action**: The `ImpactAgent` performs a downstream graph traversal. If you change file X, what imports file X? What depends on those importers? It computes an "Impact Score" and identifies affected execution flows.

**10. `POST /api/where-used`**
- **Logic**: A hyper-fast index lookup telling the user every single place a specific file, class, or function is invoked across the codebase.

### E. Natural Language (RAG) APIs

**11. `POST /api/query`** ("Ask Repo")
- **Logic**: Answers natural language questions about the codebase (e.g. "Where is the Stripe payment gateway initialized?").
- **Agent Action**: The `QueryAgent` uses **Retrieval Augmented Generation**. It embeds the user's question, searches ChromaDB (`IndexService`) for the top semantically similar source code chunks, passes these chunks into the Grok/Qwen LLM prompt as context, and generates a grounded, hallucination-free answer with source citations. 

**12. `GET /api/explain/{session_id}?target={file_path}&mode={intern|architect}`**
- **Logic**: Generates module-level explanations of a specific file.
- **Agent Action**: The `ExplainAgent` reads the raw file text, grabs local subgraph contexts (what imports it, what it imports), and prompts the LLM to explain the file according to the requested persona (Intern gets simple summaries; Architect gets structural design patterns).

---

## 3. Deep Dive into the Service Layer

### `parser_service.py` (The Core Engine)
This is arguably the most critical service. Instead of treating code as dumb text, it treats it as structure. By reading source files line-by-line using regex heuristics (and python-native `ast` module parsing where applicable), it extracts `imports`, `FunctionDef`s (and their inner calls), and `ClassDef`s. This structured object (`FileAST`) is the foundation for all downstream graph and flow algorithms. 

### `graph_service.py`
Imports the `FileAST` objects and feeds them into Python's `NetworkX` library. NetworkX algorithms are used to detect cycles (A relies on B, B relies on A), calculate central hubs (Betweenness Centrality), and calculate incoming/outgoing edge weights.

### `index_service.py`
Handles building the Vector Database. It splits code files into "chunks", requests vector embeddings from an Embeddings model, and persists them into a local `ChromaDB` collection. 

### `cache_service.py`
A high-performance disk-backed JSON caching layer. The initial ingestion of a repo can take 1-2 minutes. The `CacheService` ensures that the calculated `ASTs`, `Graph JSONs`, and `Risk Assessments` are perfectly cached to disk so subsequent queries by the user (or reloading the page) take milliseconds.

---

## 4. Multi-Agent Orchestration

The `Supervisor` agent acts as the main thread pool executor.
When a repository is ingested, the Supervisor spawns the `IngestionAgent`. The Ingestion Agent acts as a conductor, asynchronously yielding to the `Parser`, then the `GraphAgent`, then spinning up the `RiskAgent` and `IndexService` in parallel to maximize CPU and IO throughput. 

Because we cache results heavily across agents, the `QueryAgent` or `ImpactAgent` do not need to recompute the graph. They instantly pull the pre-computed graph out of the memory-mapped cache, execute localized traversals, inject the metadata into an LLM prompt via `LLMService`, and return the result asynchronously to FastAPI.

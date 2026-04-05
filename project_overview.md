# CodeSleuth AI: Comprehensive Project Overview

## 1. Problem Statement
Modern software repositories are incredibly complex. As codebases grow, they accumulate architectural debt, undocumented dependencies, and obscured execution flows. For developers—especially new hires and junior engineers—building a mental model of an unfamiliar repository takes weeks or months. 

Traditional static analysis tools often output overwhelming warnings without context, while standard IDE code exploration relies heavily on manual tracing. There is a lack of an interactive, intelligent system that combines structural code analysis (ASTs) with semantic understanding (Large Language Models) to answer the fundamental question: *"How does all of this work together, and where are the risks?"*

## 2. Solution Overview
**CodeSleuth AI** is a multi-agent code intelligence platform that bridges the gap between static code analysis and dynamic, human-like reasoning. It ingests GitHub repositories, structurally parses the code into Abstract Syntax Trees (ASTs), and builds rich dependency and call graphs.

By leveraging a fleet of specialized AI agents, CodeSleuth translates this structural data into interactive visualizations, Automated Risk Intelligence, and grounded Natural Language Q&A. It acts as an omnipresent senior engineer that can instantly explain modules, trace execution paths, predict change impact, and guide developers through the codebase.

---

## 3. Core Features

### 🔍 Architectural Visualization & Tracing
- **Graph Explorer:** Visualizes both **Dependency Graphs** (how files relate) and **Call Graphs** (how functions call each other). Includes a **Risk Heatmap** overlay to instantly spot central, complex, or vulnerable nodes.
- **Flow Visualizer:** Traces step-by-step execution flows starting from any entry point, allowing developers to see the exact path data takes through the system without running a debugger.
- **Find Where Used:** Instantly identifies all incoming references, imports, and calls to a specific file or function across the entire graph.

### 🛡️ Risk & Quality Management
- **Risk Intelligence:** Automatically scans the AST and semantic embeddings to detect architectural flaws (circular dependencies, tight coupling, oversized files) and security risks (hardcoded secrets, missing error handling).
- **Critical Files Dashboard:** Ranks files by a combined "Criticality Score"—a metric calculated from a file's centrality in the dependency graph, its cyclomatic complexity, and its identified risk severity.
- **Change Impact Analyzer:** Calculates the "blast radius" of a proposed change. If a developer edits a target file, this feature predicts exactly which downstream files, modules, and execution flows will be affected.

### 🤖 AI-Powered Mentorship & Exploration
- **Natural Language "Ask Repo":** Developers can ask questions in plain English (e.g., *"How is authentication handled?"*). The system uses Retrieval-Augmented Generation (RAG) against the codebase to provide grounded, highly accurate answers.
- **Explain Code:** Provides module-level explanations of specific files, adjustable by persona (Intern vs. Senior Engineer vs. Architect).
- **Developer Onboarding Mode:** Generates a personalized onboarding guide for new developers, outlining a recommended learning path, key starting points, core modules, and a domain-specific glossary.

---

## 4. Technology Stack

CodeSleuth AI is built on a modern, robust, and scalable full-stack architecture.

**Frontend (Client Layer)**
- **Framework:** React 18 with TypeScript, powered by Vite.
- **Routing & State:** React Router for client-side navigation; Zustand for lightweight global state management.
- **Styling:** Tailwind CSS combined with a custom dark-mode, glassmorphic design system (Stitch).
- **Visualization:** ReactFlow (`@xyflow/react`) for highly performant, interactive node-based graph rendering.
- **Icons:** Lucide React.

**Backend (Service Layer)**
- **Framework:** FastAPI (Python 3.12) utilizing asynchronous endpoints for high throughput.
- **Orchestration:** A custom Multi-Agent supervisor architecture.
- **Code Parsing:** Python native AST parsing (abstracted to allow future language plugins).
- **Graph Processing:** NetworkX for computing complex graph algorithms (e.g., Betweenness Centrality, Cycle Detection).
- **AI / LLM Layer:** Integration with advanced LLMs (such as Qwen 2.5 via Groq or similar high-speed inference APIs) for generating explanations, answering queries, and analyzing risk rules.
- **Vector Search / RAG:** ChromaDB (local persistence) for embedding code chunks and running semantic similarity searches.

---

## 5. Feasibility and Viability

- **Technical Feasibility:** Highly feasible. The combination of AST parsing (which is deterministic and fast) with RAG-based LLM queries is a proven pattern. By utilizing extremely fast inference providers (like Groq) and caching the heavy graph building stages locally, the application remains highly responsive.
- **Business Viability:** Extremely viable. The primary cost in software engineering is developer time—specifically the time spent *reading* and *understanding* code. Tools that reduce onboarding times or catch architectural regressions before CI/CD are highly valued by engineering teams and enterprises.
- **Market Fit:** Sits perfectly in the rapidly expanding Developer Tools and "AI for Code" market, differentiating itself by focusing on macroscopic architecture and visual workflows rather than just standard "code autocomplete".

---

## 6. Impacts, Benefits, and Scalability

### 🌟 Impacts & Benefits
1. **Accelerated Onboarding:** Reduces the time it takes a new developer to make their first meaningful commit by providing curated "Where to start" paths and interactive graphs.
2. **Reduced Blast Radius:** By checking the Impact Analyzer before modifying core files, teams can prevent cascading bugs and unintended side effects.
3. **Proactive Tech Debt Management:** The Critical Files Dashboard and Risk Intelligence suite flag architectural rot (like circular dependencies) before they become deeply entrenched.
4. **Democratized Knowledge:** Senior engineers spend less time answering basic architectural questions, as the RAG query agent can accurately answer *"Where is X implemented?"*

### 📈 Scalability
1. **Stateless Agents:** The backend agents are designed to be stateless, pulling from a centralized caching layer and vector database, allowing the FastAPI workers to scale horizontally.
2. **Local Persistence Strategy:** The system uses disk-persistent storage for generated graphs, parsed ASTs, and ChromaDB vector embeddings. Once a repository is ingested, subsequent analyses for all developers are near-instantaneous.
3. **Performant Visuals:** The frontend utilizes `ReactFlow`, which natively supports virtualization and performant rendering of hundreds/thousands of nodes.
4. **Extensible Architecture:** Adding support for new programming languages simply requires plugging entirely new AST parsers into the backend `parser_service.py` without modifying the overarching multi-agent orchestration or frontend logic.

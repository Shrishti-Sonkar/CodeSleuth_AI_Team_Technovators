# CodeSleuth AI: Presentation & Demo Script

---

## Part 1: Presentation Script (Slide-by-Slide Outline)

**Slide 1: Title Slide**
* **Title:** CodeSleuth AI
* **Subtitle:** Intelligent Multi-Agent Codebase Exploration & Risk Management
* **Speaker Script:** "Hello everyone. Today we are excited to present **CodeSleuth AI**, a platform designed to tackle one of the most expensive problems in software engineering: understanding complex, undocumented codebases."

**Slide 2: The Problem**
* **Points:** Slow developer onboarding, hidden architectural debt, dangerous "blast radius" side effects.
* **Speaker Script:** "As codebases grow, they accumulate technical debt. When a new developer joins, or when you are auditing an unfamiliar repository, building a mental model takes weeks. Traditional static analysis tools throw walls of text at you without semantic context, and standard IDEs force you to manually trace files one by one. The result? Slower time-to-market and high risk of regressions."

**Slide 3: The Solution**
* **Points:** AST-driven graph visualization + LLM-powered semantic understanding.
* **Speaker Script:** "Enter CodeSleuth AI. We bridge the gap between rigid static analysis and dynamic human reasoning. By parsing repositories into Abstract Syntax Trees and feeding them through a fleet of specialized AI agents, we translate raw code into interactive, visual intelligence."

**Slide 4: Key Capabilities**
* **Points:** Risk Heatmaps, Blast Radius Analysis, Automated Onboarding, Graph Exploration, Natural Language Q&A.
* **Speaker Script:** "CodeSleuth acts as your omnipresent senior engineer. It visualizes exactly how files interact, highlights critical security risks on a heatmap, traces execution flows step-by-step, calculates the exact impact of changing a specific file, and curates personalized onboarding guides for new hires."

**Slide 5: Architecture & Tech Stack**
* **Points:** React + Vite (Frontend), FastAPI (Backend), NetworkX (Graph processing), ChromaDB (Vector Search), Multi-Agent Orchestrator.
* **Speaker Script:** "Under the hood, we use a React and Vite frontend powered by ReactFlow for high-performance visual graphs. Our backend is entirely decoupled, running FastAPI with NetworkX for heavy graph algorithms and ChromaDB for semantic search. Everything is orchestrated by stateless Python agents, making the platform fast and highly scalable."

**Slide 6: Transition to Demo**
* **Speaker Script:** "But showing is better than telling. Let’s jump into a live demonstration of CodeSleuth AI."

---

## Part 2: Live Demo Script (Step-by-Step)

### Setup
*Ensure both your backend (`uvicorn main:app --reload`) and frontend (`npm run dev`) are running cleanly without errors before starting.*

### Step 1: The Landing Page & Ingestion
1. **Action:** Open the web app. Enter the URL of a GitHub repository to analyze.
2. **Script:** "We start at the ingestion engine. You simply paste a GitHub repo URL, and CodeSleuth clones it, parses the ASTs, generates semantic embeddings, and identifies dependencies. Everything is processed asynchronously."
*(Wait for the ingestion progress bar to hit 100% and transition)*

### Step 2: Overview Dashboard
1. **Action:** Arrive at the Overview page. Hover over a few stats.
2. **Script:** "Once ingested, we are greeted with the macroscopic Overview dashboard. We instantly get the repository's vital signs: total lines of code, languages used, top modules, alongside automatically calculated Complexity and Risk scores."

### Step 3: Developer Onboarding Mode
1. **Action:** Click "Explore" -> **Onboarding Mode**.
2. **Script:** "Imagine I'm a new hire. I click on 'OnboardingMode'. The AI has already generated a personalized guide for me. It tells me exactly which files to read first, provides an overview of the core architecture, lays out a step-by-step learning path, and even generates a custom glossary of internal terms used in the code."

### Step 4: The Graph Explorer & Risk Heatmap
1. **Action:** Navigate to **Graph Explorer**. Zoom in and move a few nodes around.
2. **Script:** "Let's dive into the architecture. This is a fully interactive dependency graph. If I want to see this from a security perspective, I just toggle the **Risk Heatmap**."
3. **Action:** Click the "Risk Heatmap" toggle.
4. **Script:** "Nodes instantly change color based on their calculated Criticality—a combination of how central they are to the architecture and what vulnerabilities our agents detected. Finding the most dangerous part of your codebase is now visual and instantaneous."

### Step 5: The Critical Files Dashboard
1. **Action:** Navigate to **Critical Files** from the sidebar.
2. **Script:** "If we want a prioritized list of these risky nodes, we go to the Critical Files dashboard. Here, files are stack-ranked. The platform explains *why* a file is critical—perhaps it has tight coupling, a massive cyclomatic complexity, or hardcoded secrets."

### Step 6: Change Impact Analyzer & Where Used
1. **Action:** In Critical Files, click **"Analyze Impact"** on the top file.
2. **Script:** "Let's say I want to refactor this critical file. Before writing a single line of code, I can run the Change Impact Analyzer. CodeSleuth calculates the exact 'Blast Radius'. It tells me every downstream file, module, and execution flow that will break if I modify this target. This prevents cascading bugs."
3. **Action:** Click **"Find Where Used"** (or trigger the modal).
4. **Script:** "It also shows me exactly where this file is referenced, imported, or called throughout the entire repo."

### Step 7: Flow Visualizer & Code Explanation
1. **Action:** Click "Explain this File" on one of the impacted files. 
2. **Script:** "What if I don't understand the file I'm about to edit? I click 'Explain'. The AI agent breaks down the module's purpose. I can even toggle the explanation mode from 'Intern' for a simple summary, up to 'Architect' for deep architectural context."
3. **Action:** Navigate to **Flow Visualizer** from the sidebar.
4. **Script:** "For runtime understanding, the Flow Visualizer traces execution paths step-by-step from any entry point, so I don't need to manually step through a debugger."

### Step 8: Natural Language Q&A (Ask Repo)
1. **Action:** Go to **Ask Repo** in the sidebar. Type a question like: *"How does the authentication flow work in this project?"*
2. **Script:** "Finally, CodeSleuth features a grounded Q&A agent. I can ask natural language questions about the repository. The agent utilizes RAG—Retrieval Augmented Generation—to scan the vector database, returning a highly accurate answer complete with direct source code citations. When I get my answer, it actually highlights the relevant nodes back in the central Graph."

### Conclusion
* **Script:** "In summary, CodeSleuth AI transforms dead text into an interactive, intelligent workspace, saving countless hours answering the question 'What does this code do?'. Thank you, and we'd love to take any questions."

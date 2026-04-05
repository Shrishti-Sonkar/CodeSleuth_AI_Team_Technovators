/**
 * adapters.ts
 * Normalises slight backend shape variations so UI code stays stable
 * even if the backend evolves field names.
 */
import type {
  IngestStatusResponse,
  OverviewResponse,
  GraphResponse,
  FlowResponse,
  RiskResponse,
  QueryResponse,
  ExplainResponse,
} from '../types/api';
import type { Session } from '../types/domain';

// ── Ingest Status → Session ────────────────────────────────────────────────────
export function adaptIngestStatus(
  raw: IngestStatusResponse,
  repoUrl: string,
  branch: string
): Session {
  return {
    sessionId: raw.session_id,
    repoName: raw.repo_name ?? null,
    repoUrl,
    branch,
    status: raw.status,
    progress: raw.progress ?? 0,
    error: raw.error ?? null,
    languages: raw.language_breakdown ?? null,
    totalFiles: raw.total_files ?? null,
    totalLines: raw.total_lines ?? null,
  };
}

// ── Pass-through adapters (map any backend alias differences) ─────────────────
export function adaptOverview(raw: OverviewResponse): OverviewResponse {
  return {
    ...raw,
    // ensure numeric defaults
    total_files: raw.total_files ?? 0,
    total_lines: raw.total_lines ?? 0,
    total_functions: raw.total_functions ?? 0,
    total_classes: raw.total_classes ?? 0,
    complexity_score: raw.complexity_score ?? 0,
    risk_score: raw.risk_score ?? 0,
    contributors: raw.contributors ?? 0,
    languages: raw.languages ?? {},
    top_modules: raw.top_modules ?? [],
    entry_points: raw.entry_points ?? [],
  };
}

export function adaptGraph(raw: GraphResponse): GraphResponse {
  return {
    ...raw,
    nodes: raw.nodes.map((n) => ({
      ...n,
      lines: n.lines ?? 0,
      complexity: n.complexity ?? 0,
      highlighted: n.highlighted ?? false,
    })),
    edges: raw.edges.map((e) => ({
      ...e,
      weight: e.weight ?? 1,
    })),
  };
}

export function adaptFlow(raw: FlowResponse): FlowResponse {
  return {
    ...raw,
    nodes: raw.nodes ?? [],
    edges: raw.edges ?? [],
    total_steps: raw.total_steps ?? 0,
    max_depth: raw.max_depth ?? 0,
    has_cycles: raw.has_cycles ?? false,
    cycle_nodes: raw.cycle_nodes ?? [],
  };
}

export function adaptRisk(raw: RiskResponse): RiskResponse {
  return {
    ...raw,
    total_risks: raw.total_risks ?? 0,
    risk_score: raw.risk_score ?? 0,
    items: raw.items ?? [],
    summary: raw.summary ?? { critical: 0, high: 0, medium: 0, low: 0 },
    scanned_files: raw.scanned_files ?? 0,
    secret_pattern_matches: raw.secret_pattern_matches ?? 0,
  };
}

export function adaptQuery(raw: QueryResponse): QueryResponse {
  return {
    ...raw,
    sources: raw.sources ?? [],
    highlighted_nodes: raw.highlighted_nodes ?? [],
    confidence: raw.confidence ?? 0,
  };
}

export function adaptExplain(raw: ExplainResponse): ExplainResponse {
  return {
    ...raw,
    key_concepts: raw.key_concepts ?? [],
    dependencies: raw.dependencies ?? [],
    dependents: raw.dependents ?? [],
    complexity_score: raw.complexity_score ?? 0,
    line_count: raw.line_count ?? 0,
  };
}

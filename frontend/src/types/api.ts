// ─────────────────────────────────────────────────────────────────────────────
// API Types — mirror the FastAPI backend models exactly
// ─────────────────────────────────────────────────────────────────────────────

// ── Ingest ───────────────────────────────────────────────────────────────────
export interface IngestRequest {
  repo_url: string;
  branch?: string;
  token?: string;
}

export interface IngestResponse {
  session_id: string;
  message: string;
}

export type IngestStatus =
  | 'queued'
  | 'cloning'
  | 'parsing'
  | 'indexing'
  | 'building_graph'
  | 'detecting_risks'
  | 'ready'
  | 'error';

export interface IngestStatusResponse {
  session_id: string;
  status: IngestStatus;
  progress: number;
  error: string | null;
  repo_name: string | null;
  language_breakdown: Record<string, number> | null;
  total_files: number | null;
  total_lines: number | null;
}

// ── Overview ──────────────────────────────────────────────────────────────────
export interface OverviewResponse {
  session_id: string;
  repo_name: string;
  repo_url: string;
  branch: string;
  total_files: number;
  total_lines: number;
  total_functions: number;
  total_classes: number;
  languages: Record<string, number>;
  top_modules: string[];
  complexity_score: number;
  risk_score: number;
  contributors: number;
  last_commit: string | null;
  entry_points: string[];
  readme_summary: string | null;
}

// ── Graph ─────────────────────────────────────────────────────────────────────
export type GraphNodeType = 'file' | 'function' | 'class' | 'module' | 'external';
export type GraphEdgeType = 'imports' | 'calls' | 'extends' | 'implements' | 'uses' | 'exports';
export type GraphType = 'dependency' | 'call';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  language: string;
  lines: number;
  complexity: number;
  highlighted: boolean;
  x: number | null;
  y: number | null;
  // Heatmap fields (Feature 3 — added by backend graph_agent)
  risk_level?: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  criticality_score?: number;
  heat_score?: number;
  risk_categories?: string[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
  weight: number;
  label: string | null;
}

export interface GraphResponse {
  session_id: string;
  graph_type: GraphType;
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: Record<string, number>;
}

// ── Flow ──────────────────────────────────────────────────────────────────────
export interface FlowNode {
  id: string;
  label: string;
  file_path: string;
  function_name: string | null;
  line_start: number | null;
  line_end: number | null;
  depth: number;
  node_type: string;
  description: string | null;
}

export interface FlowEdge {
  source: string;
  target: string;
  call_type: string;
  condition: string | null;
}

export interface FlowResponse {
  session_id: string;
  entry_point: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  total_steps: number;
  max_depth: number;
  has_cycles: boolean;
  cycle_nodes: string[];
}

// ── Risk ──────────────────────────────────────────────────────────────────────
export type RiskCategory =
  | 'circular_dependency'
  | 'hardcoded_secret'
  | 'oversized_file'
  | 'tight_coupling'
  | 'single_point_of_failure'
  | 'dead_code'
  | 'missing_error_handling'
  | 'high_complexity';

export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface RiskItem {
  id: string;
  category: RiskCategory;
  severity: RiskSeverity;
  title: string;
  description: string;
  affected_files: string[];
  suggestion: string;
  line_numbers: number[] | null;
  metric_value: number | null;
}

export interface RiskSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface RiskResponse {
  session_id: string;
  total_risks: number;
  risk_score: number;
  summary: RiskSummary;
  items: RiskItem[];
  scanned_files: number;
  secret_pattern_matches: number;
}

// ── Query ─────────────────────────────────────────────────────────────────────
export type ExplanationMode = 'intern' | 'engineer' | 'architect';

export interface QueryRequest {
  session_id: string;
  question: string;
  mode: ExplanationMode;
  max_context_chunks?: number;
}

export interface SourceChunk {
  file_path: string;
  content_snippet: string;
  relevance_score: number;
}

export interface QueryResponse {
  answer: string;
  sources: SourceChunk[];
  highlighted_nodes: string[];
  confidence: number;
  mode: string;
  tokens_used: number | null;
}

export interface ExplainResponse {
  session_id: string;
  target: string;
  mode: ExplanationMode;
  title: string;
  summary: string;
  explanation: string;
  key_concepts: string[];
  dependencies: string[];
  dependents: string[];
  complexity_score: number;
  line_count: number;
  language: string;
}

// ── Graph Node (extended with heatmap fields) ─────────────────────────────────
// GraphNode already declared above; the backend now returns these extra fields:
// risk_level, criticality_score, heat_score, risk_categories
// We extend it here for consumer code:
declare module './api' {
  interface GraphNode {
    risk_level?: 'safe' | 'low' | 'medium' | 'high' | 'critical';
    criticality_score?: number;
    heat_score?: number;
    risk_categories?: string[];
  }
}

// ── Impact Analyzer ───────────────────────────────────────────────────────────
export interface AffectedFile {
  id: string;
  label: string;
  reason: string;
}

export interface ImpactRequest {
  session_id: string;
  target: string;
  target_type: 'file' | 'module' | 'node';
}

export interface ImpactResponse {
  target: string;
  target_type: string;
  impact_score: number;
  summary: string;
  affected_files: AffectedFile[];
  affected_modules: string[];
  affected_flows: string[];
  graph_highlights: string[];
  confidence: number;
}

// ── Onboarding Mode ───────────────────────────────────────────────────────────
export interface StartPoint {
  title: string;
  file: string;
  reason: string;
}

export interface KeyModule {
  name: string;
  summary: string;
}

export interface GlossaryItem {
  term: string;
  meaning: string;
}

export interface OnboardingResponse {
  session_id: string;
  repo_name: string;
  overview: string;
  recommended_start_points: StartPoint[];
  key_modules: KeyModule[];
  learning_path: string[];
  glossary: GlossaryItem[];
  suggested_questions: string[];
}

// ── Critical Files Dashboard ──────────────────────────────────────────────────
export interface CriticalFileItem {
  file_path: string;
  file_name: string;
  criticality_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  risk_categories: string[];
  impact_score: number;
}

export interface CriticalFilesResponse {
  session_id: string;
  items: CriticalFileItem[];
}

// ── Where Used ────────────────────────────────────────────────────────────────
export interface UsedByItem {
  id: string;
  label: string;
  relation: string;
}

export interface WhereUsedRequest {
  session_id: string;
  target: string;
  target_type: 'file' | 'module' | 'function';
}

export interface WhereUsedResponse {
  target: string;
  target_type: string;
  used_by: UsedByItem[];
  related_flows: string[];
  graph_highlights: string[];
  summary: string;
}


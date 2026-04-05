// ─────────────────────────────────────────────────────────────────────────────
// Central constants & configuration
// ─────────────────────────────────────────────────────────────────────────────

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';
export const API_BASE = `${BACKEND_URL}/api`;

export const POLL_INTERVAL_MS = 2000;

export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'] as const;

export const RISK_CATEGORY_LABELS: Record<string, string> = {
  circular_dependency: 'Circular Dependency',
  hardcoded_secret: 'Hardcoded Secret',
  oversized_file: 'Oversized File',
  tight_coupling: 'Tight Coupling',
  single_point_of_failure: 'Single Point of Failure',
  dead_code: 'Dead Code',
  missing_error_handling: 'Missing Error Handling',
  high_complexity: 'High Complexity',
};

export const STATUS_LABELS: Record<string, string> = {
  queued: 'Queued',
  cloning: 'Cloning Repository',
  parsing: 'Parsing Files',
  indexing: 'Indexing & Embedding',
  building_graph: 'Building Graph',
  detecting_risks: 'Detecting Risks',
  ready: 'Ready',
  error: 'Error',
};

export const GRAPH_COLORS: Record<string, string> = {
  file: '#6366f1',
  function: '#22d3ee',
  class: '#a78bfa',
  module: '#34d399',
  external: '#94a3b8',
};

export const EXPLANATION_MODE_DESCRIPTIONS = {
  intern: 'Simple, beginner-friendly explanations with analogies',
  engineer: 'Technical depth with code patterns and architecture',
  architect: 'High-level design decisions, tradeoffs, and scalability',
} as const;

// ── Heatmap colors (Feature 3) ────────────────────────────────────────────────
export const HEAT_COLORS: Record<string, string> = {
  safe:     '#22d3ee',   // cyan
  low:      '#34d399',   // emerald
  medium:   '#f59e0b',   // amber
  high:     '#f97316',   // orange
  critical: '#ef4444',   // red
};


// Domain types — frontend-friendly normalized shapes
import type {
  IngestStatus,
  OverviewResponse,
  GraphNode,
  GraphEdge,
  FlowNode,
  FlowEdge,
  RiskItem,
  RiskSummary,
  QueryResponse,
  ExplainResponse,
  ExplanationMode,
  GraphType,
} from './api';

export type { IngestStatus, ExplanationMode, GraphType };

export interface Session {
  sessionId: string;
  repoName: string | null;
  repoUrl: string;
  branch: string;
  status: IngestStatus;
  progress: number;
  error: string | null;
  languages: Record<string, number> | null;
  totalFiles: number | null;
  totalLines: number | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ file_path: string; content_snippet: string; relevance_score: number }>;
  confidence?: number;
  highlightedNodes?: string[];
  mode?: ExplanationMode;
  timestamp: number;
}

// Re-export raw types for convenience
export type {
  OverviewResponse,
  GraphNode,
  GraphEdge,
  FlowNode,
  FlowEdge,
  RiskItem,
  RiskSummary,
  QueryResponse,
  ExplainResponse,
};

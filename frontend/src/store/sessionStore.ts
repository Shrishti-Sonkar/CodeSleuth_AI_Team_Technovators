import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IngestStatus, OverviewResponse, ExplanationMode } from '../types/api';

interface SessionState {
  sessionId: string | null;
  repoName: string | null;
  repoUrl: string;
  branch: string;
  status: IngestStatus | null;
  progress: number;
  error: string | null;
  latestOverview: OverviewResponse | null;
  highlightedNodes: string[];
  explanationMode: ExplanationMode;

  // actions
  setSession: (id: string, repoUrl: string, branch: string) => void;
  updateStatus: (status: IngestStatus, progress: number, repoName?: string | null, error?: string | null) => void;
  setOverview: (overview: OverviewResponse) => void;
  setHighlightedNodes: (nodes: string[]) => void;
  setExplanationMode: (mode: ExplanationMode) => void;
  resetSession: () => void;
}

const INITIAL: Pick<SessionState,
  'sessionId'|'repoName'|'repoUrl'|'branch'|'status'|'progress'|'error'|'latestOverview'|'highlightedNodes'|'explanationMode'
> = {
  sessionId: null,
  repoName: null,
  repoUrl: '',
  branch: 'main',
  status: null,
  progress: 0,
  error: null,
  latestOverview: null,
  highlightedNodes: [],
  explanationMode: 'engineer',
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...INITIAL,

      setSession: (id, repoUrl, branch) =>
        set({ sessionId: id, repoUrl, branch, status: 'queued', progress: 0, error: null }),

      updateStatus: (status, progress, repoName, error) =>
        set((s) => ({
          status,
          progress,
          repoName: repoName ?? s.repoName,
          error: error ?? null,
        })),

      setOverview: (overview) => set({ latestOverview: overview }),

      setHighlightedNodes: (nodes) => set({ highlightedNodes: nodes }),

      setExplanationMode: (mode) => set({ explanationMode: mode }),

      resetSession: () => set(INITIAL),
    }),
    {
      name: 'codesleuth-session',
      partialize: (s) => ({
        sessionId: s.sessionId,
        repoName: s.repoName,
        repoUrl: s.repoUrl,
        branch: s.branch,
        status: s.status,
        progress: s.progress,
        explanationMode: s.explanationMode,
      }),
    }
  )
);

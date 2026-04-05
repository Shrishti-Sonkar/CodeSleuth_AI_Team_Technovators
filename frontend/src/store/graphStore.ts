import { create } from 'zustand';
import type { GraphResponse, GraphType } from '../types/api';

interface GraphState {
  data: GraphResponse | null;
  graphType: GraphType;
  selectedNodeId: string | null;
  isLoading: boolean;
  error: string | null;

  setData: (data: GraphResponse) => void;
  setGraphType: (t: GraphType) => void;
  setSelectedNode: (id: string | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

export const useGraphStore = create<GraphState>()((set) => ({
  data: null,
  graphType: 'dependency',
  selectedNodeId: null,
  isLoading: false,
  error: null,

  setData: (data) => set({ data, error: null }),
  setGraphType: (graphType) => set({ graphType }),
  setSelectedNode: (selectedNodeId) => set({ selectedNodeId }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ data: null, selectedNodeId: null, error: null }),
}));

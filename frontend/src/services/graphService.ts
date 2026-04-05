import { apiClient } from './apiClient';
import type { GraphResponse, GraphType } from '../types/api';

export const graphService = {
  get: (sessionId: string, type: GraphType = 'dependency') =>
    apiClient.get<GraphResponse>('/graph', { params: { session_id: sessionId, type } }),
};

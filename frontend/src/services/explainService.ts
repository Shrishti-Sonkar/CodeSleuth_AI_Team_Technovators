import { apiClient } from './apiClient';
import type { ExplainResponse, ExplanationMode } from '../types/api';

export const explainService = {
  get: (sessionId: string, target: string, mode: ExplanationMode = 'engineer') =>
    apiClient.get<ExplainResponse>('/explain', {
      params: { session_id: sessionId, target, mode },
    }),
};

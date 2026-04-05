import { apiClient } from './apiClient';
import type { CriticalFilesResponse } from '../types/api';

export const criticalFilesService = {
  get: (sessionId: string, topN = 10) =>
    apiClient.get<CriticalFilesResponse>('/critical-files', {
      params: { session_id: sessionId, top_n: topN },
    }),
};

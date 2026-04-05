import { apiClient } from './apiClient';
import type { WhereUsedResponse } from '../types/api';

export const whereUsedService = {
  find: (sessionId: string, target: string, targetType: 'file' | 'module' | 'function' = 'file') =>
    apiClient.post<WhereUsedResponse>('/where-used', {
      session_id: sessionId,
      target,
      target_type: targetType,
    }),
};

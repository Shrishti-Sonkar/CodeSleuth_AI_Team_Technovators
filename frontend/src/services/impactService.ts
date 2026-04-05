import { apiClient } from './apiClient';
import type { ImpactResponse } from '../types/api';

export const impactService = {
  analyze: (sessionId: string, target: string, targetType: 'file' | 'module' | 'node' = 'file') =>
    apiClient.post<ImpactResponse>('/impact', { session_id: sessionId, target, target_type: targetType }),
};

import { apiClient } from './apiClient';
import type { RiskResponse } from '../types/api';

export const riskService = {
  get: (sessionId: string) =>
    apiClient.get<RiskResponse>('/risk', { params: { session_id: sessionId } }),
};

import { apiClient } from './apiClient';
import type { OverviewResponse } from '../types/api';

export const overviewService = {
  get: (sessionId: string) =>
    apiClient.get<OverviewResponse>('/overview', { params: { session_id: sessionId } }),
};

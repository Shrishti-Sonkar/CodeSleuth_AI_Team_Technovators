import { apiClient } from './apiClient';
import type { FlowResponse } from '../types/api';

export const flowService = {
  get: (sessionId: string, entryPoint: string) =>
    apiClient.get<FlowResponse>('/flow', {
      params: { session_id: sessionId, entry_point: entryPoint },
    }),
};

import { apiClient } from './apiClient';
import type { IngestRequest, IngestResponse, IngestStatusResponse } from '../types/api';

export const ingestService = {
  start: (body: IngestRequest) =>
    apiClient.post<IngestResponse>('/ingest', body),

  getStatus: (sessionId: string) =>
    apiClient.get<IngestStatusResponse>(`/ingest/${sessionId}/status`),

  deleteSession: (sessionId: string) =>
    apiClient.delete(`/ingest/${sessionId}`),
};

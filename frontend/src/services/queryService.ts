import { apiClient } from './apiClient';
import type { QueryRequest, QueryResponse } from '../types/api';

export const queryService = {
  ask: (body: QueryRequest) =>
    apiClient.post<QueryResponse>('/query', body),
};

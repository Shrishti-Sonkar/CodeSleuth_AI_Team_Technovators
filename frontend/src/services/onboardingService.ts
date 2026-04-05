import { apiClient } from './apiClient';
import type { OnboardingResponse } from '../types/api';

export const onboardingService = {
  get: (sessionId: string) =>
    apiClient.get<OnboardingResponse>('/onboarding', { params: { session_id: sessionId } }),
};

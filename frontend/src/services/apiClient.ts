import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { API_BASE } from '../lib/constants';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 120_000, // Increased to 120s to allow thinking model parsing
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.response.use(
      (res) => res,
      (err) => {
        const message =
          err.response?.data?.detail ??
          err.response?.data?.message ??
          err.message ??
          'Unknown error';
        return Promise.reject(new Error(String(message)));
      }
    );
  }

  async get<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.get<T>(path, config);
    return res.data;
  }

  async post<T>(path: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const res = await this.client.post<T>(path, body, config);
    return res.data;
  }

  async delete<T = void>(path: string): Promise<T> {
    const res = await this.client.delete<T>(path);
    return res.data;
  }
}

export const apiClient = new ApiClient();

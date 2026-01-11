import { DataSource } from '@prisma/client';

export interface GhostfolioConfig {
  url: string;
  production: boolean;
  rootUrl?: string;
  requestTimeout: number;
}

export interface RequestHeaders {
  [HEADER_KEY_TOKEN]: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    status: number;
    message: string;
  };
}
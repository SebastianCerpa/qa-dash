import { NextRequest } from 'next/server';

declare module 'next/dist/server/web/exports/next-request' {
  interface NextRequest {
    params?: Record<string, string>;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}
import type http from 'http';
import type { Context } from '@hwy-fm/kernel';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

declare module '@hwy-fm/kernel' {
  interface MatchPatternObject {
    method?: HttpMethod;
  }
}

export interface HttpInput {
  req: http.IncomingMessage;
  res: http.ServerResponse;

  headers: Record<string, string | string[] | undefined>;
  body: Record<string, unknown>;
  credentials: { apiKey: string };
}

export type HttpContext = Context<HttpInput>;

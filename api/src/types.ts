import type http from 'http';
import type { WebSocket } from 'ws';
import type { Context } from '@hwy-fm/kernel';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';

declare module '@hwy-fm/kernel' {
  interface MatchPatternObject {
    method?: HttpMethod;
  }
}

// -- Shared (protocol-agnostic) --

export interface CommonInput {
  headers: Record<string, string | string[] | undefined>;
  body: Record<string, unknown>;
  credentials: { apiKey: string };
}

export interface RequestMetadata {
  path: string;
  method: string;
  query?: Record<string, unknown>;
  params?: Record<string, string>;
  error?: { status: number; message: string };
}

export type SharedContext = Context<CommonInput, any, RequestMetadata>;

// -- HTTP --

export interface HttpInput extends CommonInput {
  req: http.IncomingMessage;
  res: http.ServerResponse;
}

export type HttpContext = Context<HttpInput, any, RequestMetadata>;

// -- WebSocket --

export interface WsMessage {
  path: string;
  method?: string;
  body?: Record<string, unknown>;
  apiKey?: string;
}

export interface WsInput extends CommonInput {
  ws: WebSocket;
  message: WsMessage;
}

export type WsContext = Context<WsInput, any, RequestMetadata>;

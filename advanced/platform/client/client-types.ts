import type { Context } from '@hwy-fm/kernel';

export interface ClientInput {
  credentials?: { apiKey: string };
}

export interface ClientMetadata {
  path: string;
  method: string;
  query?: Record<string, string>;
}

export type ClientContext = Context<ClientInput, any, ClientMetadata>;

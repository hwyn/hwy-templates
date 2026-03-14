/**
 * Context type definitions for the business Kernel layer.
 *
 * Provides typed alternatives to raw `Context<any, any, any>`
 * so that seed/guard/deliver code doesn't need optional chaining everywhere.
 */
import type { Context } from '@hwy-fm/kernel';

/** Standardized input shape produced by platform dispatch seeds. */
export interface KernelInput {
  headers: Record<string, string>;
  body: Record<string, any>;
  credentials: { apiKey: string };
  /** CLI-only: parsed CLI options (e.g. --title). Undefined in HTTP context. */
  options?: Record<string, any>;
}

/** Standardized metadata shape after context-parser. */
export interface KernelMetadata {
  path: string;
  method: string;
  query: Record<string, string>;
  params?: Record<string, string>;
}

/** Typed Context for business Kernel instructions and seeds. */
export type KernelContext<TResult = any> = Context<KernelInput, TResult, KernelMetadata>;

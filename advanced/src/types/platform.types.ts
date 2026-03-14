/**
 * Context type definitions for the PlatformKernel layer (as seen from src/).
 * Only the properties that src code can rely on (platform-agnostic).
 */
import type { Context } from '@hwy-fm/kernel';

/** Platform metadata: the common shape both client and server provide. */
export interface PlatformMetadata {
  path: string;
  accept: string;
  method?: string;
  query?: Record<string, string>;
}

/** Typed Context for PlatformKernel.Deliver instructions in src/. */
export type PlatformContext = Context<any, any, PlatformMetadata>;

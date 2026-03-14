/**
 * Context type definitions for the ViewKernel layer.
 */
import type { Context } from '@hwy-fm/kernel';

/** Input shape for ViewKernel dispatch. */
export interface ViewInput {
  data: any;
  trace?: any[];
}

/** Metadata shape for ViewKernel dispatch. */
export interface ViewMetadata {
  path: string;
  query: Record<string, string>;
}

/** Result shape: seed produces component+props, deliver may transform to HTML string. */
export interface ViewResult<TComponent = unknown> {
  meta?: Record<string, any>;
  props?: Record<string, any>;
  component: TComponent;
  layout?: TComponent | null;
}

/** Typed Context for ViewKernel seeds and deliver. */
export type ViewContext = Context<ViewInput, ViewResult | string, ViewMetadata>;

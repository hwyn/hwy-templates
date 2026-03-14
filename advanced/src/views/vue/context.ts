import { inject, reactive } from 'vue';

import { TraceTransformService, type TreeNode } from '../shared/trace-transform.service';

export interface DispatchOptions {
  method?: string;
  query?: Record<string, string>;
  body?: Record<string, any>;
}

export interface ViewCtx {
  data: any;
  path: string;
  query: Record<string, string>;
  meta: Record<string, any>;
  trace: any[];
  traceTree: TreeNode[];
  traceSummary: string;
  link: (path: string, extra?: Record<string, string>) => string;
  dispatch: <T = any>(path: string, options?: DispatchOptions) => Promise<T>;
}

export const VIEW_CTX_KEY = 'viewCtx';

const noop = () => Promise.resolve(undefined as any);
const DEFAULT_CTX: ViewCtx = { data: null, path: '', query: {}, meta: {}, trace: [], traceTree: [], traceSummary: '', link: (p) => p, dispatch: noop };

export function useViewCtx(): ViewCtx {
  return inject<ViewCtx>(VIEW_CTX_KEY) || DEFAULT_CTX;
}

export function createViewCtx(): ViewCtx {
  return reactive<ViewCtx>({ data: null, path: '', query: {}, meta: {}, trace: [], traceTree: [], traceSummary: '', link: (p) => p, dispatch: noop });
}

export function updateViewCtx(ctx: ViewCtx, values: Partial<ViewCtx>) {
  Object.assign(ctx, values);
  const query = ctx.query;
  ctx.link = (path: string, extra?: Record<string, string>) => {
    const entries: string[] = [];
    if (query.api_key) entries.push(`api_key=${encodeURIComponent(query.api_key)}`);
    if (extra) for (const [k, v] of Object.entries(extra)) entries.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    const qs = entries.join('&');
    return qs ? `${path}?${qs}` : path;
  };
}

export function setDispatch(ctx: ViewCtx, fn: ViewCtx['dispatch']) {
  ctx.dispatch = fn;
}

export function buildViewCtxUpdate(
  traceService: TraceTransformService,
  ctx: { input: { data: any; trace?: any[] }; metadata: { path: string; query?: Record<string, string> }; result?: any },
): Partial<ViewCtx> {
  const trace = ctx.input.trace || [];
  const traceTree = trace.length ? traceService.buildTree(trace) : [];
  const traceSummary = trace.length ? traceService.computeSummary(trace) : '';
  return {
    data: ctx.input.data,
    path: ctx.metadata.path,
    query: ctx.metadata.query || {},
    meta: ctx.result?.meta || {},
    trace,
    traceTree,
    traceSummary,
  };
}

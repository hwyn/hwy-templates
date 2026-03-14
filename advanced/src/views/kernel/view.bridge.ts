/**
 * ViewBridge — bridge from PlatformKernel to ViewKernel.
 *
 * Registered as PlatformKernel egress instruction.
 * Uses Gateway(ViewKernel) to dispatch to ViewKernel for view rendering.
 * - Client: ViewKernel.Deliver does DOM mount (side effect), result stays undefined.
 * - Server: ViewKernel.Deliver does renderToString, result = HTML string.
 */
import { Gateway } from '@hwy-fm/std';
import { PlatformKernel, HTML_PROTOCOL } from '@hwy-fm/platform';

import type { KernelContext } from '../../types/kernel.types';
import { ViewKernel } from './view.model';

const IGNORE_PATHS = ['.well-known/', 'favicon.ico', 'robots.txt', 'sw.js', 'manifest.json'];

const View = PlatformKernel.egress('view', { anchors: { before: ['deliver'] } });

@View.instruction({ match: { pattern: '**', method: 'GET' }, protocol: HTML_PROTOCOL })
export class ViewBridge extends Gateway<KernelContext>(ViewKernel) {
  prepare(ctx: KernelContext) {
    const path = ctx.metadata.path.replace(/^\/+/, '') || '/';

    if (IGNORE_PATHS.some(p => path.includes(p))) {
      return null;
    }

    const data = ctx.result;
    const trace = (ctx as any).pipelineState?.trace;
    if (data && (data._isError || (data.status && data.status >= 400))) {
      return {
        metadata: { path: '_error', query: ctx.metadata.query },
        input: { data: { ...data, _requestPath: path }, trace }
      };
    }

    return {
      metadata: { path, query: ctx.metadata.query },
      input: { data, trace }
    };
  }

  resolve(result: any, ctx: KernelContext) {
    if (result !== undefined && result !== null) {
      ctx.result = result;
    }
  }
}

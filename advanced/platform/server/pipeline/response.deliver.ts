import { Kernel } from '@hwy-fm/kernel';

import type { HttpContext } from '../http-types';

declare const __BUILD_ASSETS__: { indexHtml?: string } | undefined;

const HTML_TEMPLATE: string = typeof __BUILD_ASSETS__ !== 'undefined' && __BUILD_ASSETS__?.indexHtml || '<div id="app"></div>';
const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Kernel.Deliver.instruction()
export class ResponseDeliver {
  execute(ctx: HttpContext) {
    const res = ctx.input.res;
    if (res.headersSent) return;

    const req = ctx.input.req;
    const result = ctx.result;
    const accept = (req.headers.accept as string) || '';
    const method = req.method || 'GET';

    if (!result) {
      const body = JSON.stringify({ error: 'Not Found' });
      res.writeHead(404, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
      res.end(body);
      return;
    }

    const isError = typeof result === 'object' && result !== null && result._isError === true;
    if (MUTATION_METHODS.has(method) && !isError && accept.includes('text/html')) {
      res.writeHead(302, { Location: '/' + (ctx.metadata.path || '') });
      res.end();
      return;
    }

    if (typeof result === 'string') {
      const html = HTML_TEMPLATE.replace('<div id="app"></div>', `<div id="app">${result}</div>`);
      const buf = Buffer.from(html, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': buf.byteLength });
      res.end(buf);
      return;
    }

    const status = isError ? result.status : 200;
    let payload = result;
    if (isError) {
      const { _isError, status, ...rest } = result;
      payload = Object.keys(rest).length ? rest : { error: 'Unknown error' };
    }
    const buf = Buffer.from(JSON.stringify(payload));
    res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': buf.length });
    res.end(buf);
  }
}

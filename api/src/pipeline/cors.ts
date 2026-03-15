import { Injectable } from '@hwy-fm/di';
import { Kernel, type PipelineNext } from '@hwy-fm/kernel';
import { HTTP_PROTOCOL } from '../protocol';
import type { HttpContext } from '../types';

const Cors = Kernel.ingress('cors', {
  composer: 'onion',
  anchors: { after: ['catch'], before: ['receive'] },
});

@Injectable()
export class CorsInstruction {
  @Cors.instruction({ protocol: HTTP_PROTOCOL })
  execute(ctx: HttpContext, next: PipelineNext) {
    ctx.input.res.setHeader('Access-Control-Allow-Origin', '*');
    return next();
  }

  @Cors.instruction({ match: { pattern: '**', method: 'OPTIONS' }, protocol: HTTP_PROTOCOL })
  preflight(ctx: HttpContext) {
    const { req, res } = ctx.input;
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type, X-API-Key');
    res.writeHead(204, { 'Content-Length': '0' });
    res.end();
  }
}

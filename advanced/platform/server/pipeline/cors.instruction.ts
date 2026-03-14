import { Injectable } from '@hwy-fm/di';
import { Kernel, type PipelineNext } from '@hwy-fm/kernel';
import type { HttpContext } from '../http-types';

export const Cors = Kernel.ingress('cors', {
  composer: 'onion',
  anchors: { after: ['catch'], before: ['receive'] },
});

@Injectable()
export class CorsInstruction {
  @Cors.instruction()
  execute(ctx: HttpContext, next: PipelineNext) {
    ctx.input.res.setHeader('Access-Control-Allow-Origin', '*');
    return next();
  }

  @Cors.instruction({ match: { pattern: '**', method: 'OPTIONS' } })
  preflight(ctx: HttpContext) {
    const { req, res } = ctx.input;
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*');
    res.writeHead(204, { 'Content-Length': '0' });
    res.end();
  }
}

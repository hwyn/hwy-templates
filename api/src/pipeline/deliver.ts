import { Injectable } from '@hwy-fm/di';
import { Kernel, type Context } from '@hwy-fm/kernel';
import { HTTP_PROTOCOL, WS_PROTOCOL } from '../protocol';
import type { HttpContext, WsContext } from '../types';

@Injectable()
export class ResponseDeliver {
  @Kernel.Deliver.instruction({ protocol: HTTP_PROTOCOL })
  http(ctx: HttpContext) {
    const { res } = ctx.input;
    if (res.headersSent) return;

    const { status, payload } = this.resolve(ctx);
    const body = JSON.stringify(payload);
    res.writeHead(status, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
    res.end(body);
  }

  @Kernel.Deliver.instruction({ protocol: WS_PROTOCOL })
  ws(ctx: WsContext) {
    const { ws } = ctx.input;
    if (ws.readyState !== 1) return;

    const { status, payload } = this.resolve(ctx);
    ws.send(JSON.stringify(status >= 400 ? { ...payload, status } : payload));
  }

  private resolve(ctx: Context) {
    if (!ctx.result) return { status: 404, payload: { error: 'Not Found' } };
    const error = ctx.metadata.error;
    return error
      ? { status: error.status, payload: ctx.result }
      : { status: 200, payload: ctx.result };
  }
}

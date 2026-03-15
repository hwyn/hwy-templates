import { Injectable } from '@hwy-fm/di';
import { Kernel } from '@hwy-fm/kernel';
import { HTTP_PROTOCOL, WS_PROTOCOL } from '../protocol';
import type { HttpContext, WsContext } from '../types';

@Injectable()
export class RequestReceive {
  @Kernel.Receive.instruction({ protocol: HTTP_PROTOCOL })
  http(ctx: HttpContext) {
    const { headers } = ctx.input.req;
    ctx.input.headers = headers as Record<string, string | string[] | undefined>;
    ctx.input.credentials = {
      apiKey: (headers['x-api-key'] as string) || String(ctx.metadata.query?.api_key || ''),
    };
  }

  @Kernel.Receive.instruction({ protocol: WS_PROTOCOL })
  ws(ctx: WsContext) {
    const { message } = ctx.input;
    ctx.input.headers = {};
    ctx.input.body = message.body || {};
    ctx.input.credentials = { apiKey: message.apiKey || '' };
  }
}

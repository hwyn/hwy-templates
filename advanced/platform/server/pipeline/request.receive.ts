import { Kernel } from '@hwy-fm/kernel';
import type { HttpContext } from '../http-types';

@Kernel.Receive.instruction()
export class RequestReceive {
  execute(ctx: HttpContext) {
    const { headers } = ctx.input.req;
    ctx.input.headers = headers;
    ctx.input.credentials = {
      apiKey: (headers['x-api-key'] as string) || ctx.metadata.query?.api_key || '',
    };
  }
}

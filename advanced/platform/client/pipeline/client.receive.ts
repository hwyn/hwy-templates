import { Kernel } from '@hwy-fm/kernel';

import type { ClientContext } from '../client-types';

@Kernel.Receive.instruction()
export class ClientReceive {
  execute(ctx: ClientContext) {
    const query = ctx.metadata.query || {};
    ctx.input.credentials = {
      apiKey: query.api_key || '',
    };
  }
}

/**
 * BusinessProxy — client-side remote proxy for server BusinessKernel.
 *
 * No business seeds run on the client. This catch-all seed delegates to
 * ClientProxyService (from platform) for SSR hydration and HTTP fetch.
 */
import './business.bridge';

import { Inject } from '@hwy-fm/di';
import { BusinessKernel } from './business.model';
import { ClientProxyService } from '@hwy-fm/platform/client';
import type { KernelContext } from '../types/kernel.types';

@BusinessKernel.bootstrap()
export class BusinessProxy {
  constructor(@Inject(ClientProxyService) private proxy: ClientProxyService) { }

  @BusinessKernel.Process.seed('**')
  async execute(ctx: KernelContext) {
    const ssrData = this.proxy.consumeSSR();
    if (ssrData !== undefined) {
      ctx.result = ssrData;
      return;
    }
    ctx.result = await this.proxy.fetch(
      ctx.metadata.path, ctx.metadata.method,
      ctx.metadata.query, ctx.input.credentials, ctx.input.body,
    );
  }
}

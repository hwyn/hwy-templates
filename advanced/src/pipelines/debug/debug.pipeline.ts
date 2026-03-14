import { Inject } from '@hwy-fm/di';

import { BusinessKernel } from '../../kernel/business.model';
import { DebugService } from './debug.service';
import type { KernelContext } from '../../types/kernel.types';

@BusinessKernel.Process.seed('_debug')
export class DebugPipeline {
  constructor(@Inject(DebugService) private readonly debug: DebugService) { }

  execute(ctx: KernelContext) {
    const routeQuery = ctx.metadata.query?.route;
    ctx.result = { _debug: true, ...this.debug.inspect(routeQuery) };
  }
}

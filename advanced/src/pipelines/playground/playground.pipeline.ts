import { Inject, Injectable } from '@hwy-fm/di';

import { BusinessKernel } from '../../kernel/business.model';
import { PlaygroundService } from './playground.service';
import type { KernelContext } from '../../types/kernel.types';

@Injectable()
export class PlaygroundPipeline {
  constructor(@Inject(PlaygroundService) private playground: PlaygroundService) { }

  @BusinessKernel.Process.seed('_playground')
  page(ctx: KernelContext) {
    ctx.result = { _page: 'playground', routes: this.playground.getRouteCards() };
  }

  @BusinessKernel.Process.seed({ match: { pattern: '_playground', method: 'POST' } })
  async toggle(ctx: KernelContext) {
    const { action, method = 'GET', path, kind, enabled } = ctx.input.body;
    if (action === 'reset') {
      await this.playground.reset();
    } else {
      const isEnabled = enabled === true || enabled === 'true';
      await this.playground.toggle(method, path, kind, isEnabled);
    }
    ctx.result = { success: true };
  }

  @BusinessKernel.Process.seed('_playground/trace')
  trace(ctx: KernelContext) {
    const method = ctx.metadata.query?.method || 'GET';
    const path = ctx.metadata.query?.path || '/';
    ctx.result = this.playground.getLastTrace(method, path);
  }

  @BusinessKernel.Trace.instruction()
  captureTrace(ctx: KernelContext) {
    const trace = (ctx as any).pipelineState?.trace;
    if (!trace?.length) return;
    if (ctx.metadata.path.startsWith('_playground')) return;
    this.playground.storeTrace(trace, ctx.metadata);
  }
}

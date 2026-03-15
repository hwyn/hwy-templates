import { Kernel, type PipelineNext } from '@hwy-fm/kernel';
import type { SharedContext } from '../types';

@Kernel.Catch.instruction()
export class ErrorCatch {
  execute(ctx: SharedContext, next: PipelineNext) {
    try {
      const result = next();
      if (result?.then && typeof result.then === 'function') {
        return result.catch((e: any) => this.toError(ctx, e));
      }
      return result;
    } catch (e: any) {
      this.toError(ctx, e);
    }
  }

  private toError(ctx: SharedContext, e: any) {
    const status = e.status ?? 500;
    const message = e.message ?? 'Internal Server Error';
    ctx.metadata.error = { status, message };
    ctx.result = { error: message };
  }
}

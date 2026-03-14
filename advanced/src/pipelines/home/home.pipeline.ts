import { BusinessKernel } from '../../kernel/business.model';
import type { KernelContext } from '../../types/kernel.types';

@BusinessKernel.Process.seed('/')
export class HomePipeline {
  execute(ctx: KernelContext) {
    ctx.result = { _page: 'home' };
  }
}

import type { ViewContext } from '../../types/view.types';
import { ViewKernel } from '../kernel/view.model';
import { PageRegistry } from '../shared/page-registry';

@ViewKernel.Process.seed('_playground')
export class PlaygroundViewSeed {
  constructor(private pages: PageRegistry) { }

  execute(ctx: ViewContext) {
    ctx.result = this.pages.page('_playground');
  }
}

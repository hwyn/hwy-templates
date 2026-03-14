import type { ViewContext } from '../../types/view.types';
import { ViewKernel } from '../kernel/view.model';
import { PageRegistry } from '../shared/page-registry';

@ViewKernel.Process.seed('_error')
export class ErrorViewSeed {
  constructor(private pages: PageRegistry) { }

  execute(ctx: ViewContext) {
    ctx.result = this.pages.errorPage();
  }
}

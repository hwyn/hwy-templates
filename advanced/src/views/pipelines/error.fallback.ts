import type { ViewContext } from '../../types/view.types';
import { ViewKernel } from '../kernel/view.model';
import { PageRegistry } from '../shared/page-registry';

@ViewKernel.Deliver.instruction()
export class ErrorFallback {
  constructor(private pages: PageRegistry) { }

  execute(ctx: ViewContext) {
    if (!ctx.result) {
      ctx.result = this.pages.errorPage();
    }
  }
}

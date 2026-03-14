import type { ViewContext } from '../../types/view.types';
import { ViewKernel } from '../kernel/view.model';
import { PageRegistry } from '../shared/page-registry';

@ViewKernel.Process.seed('notes/:id')
export class NoteDetailViewSeed {
  constructor(private pages: PageRegistry) { }

  execute(ctx: ViewContext) {
    const result = this.pages.page('notes/:id');
    const title = ctx.input.data?.title;
    if (title) result.meta = { ...result.meta, title };
    ctx.result = result;
  }
}

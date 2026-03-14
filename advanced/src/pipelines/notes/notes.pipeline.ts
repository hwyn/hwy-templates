import { Inject, Injectable } from '@hwy-fm/di';

import { BusinessKernel } from '../../kernel/business.model';
import type { KernelContext } from '../../types/kernel.types';
import { NoteService } from './notes.service';

@Injectable()
export class NotesPipeline {
  constructor(@Inject(NoteService) private noteService: NoteService) { }

  @BusinessKernel.Process.seed('notes')
  list(ctx: KernelContext) {
    ctx.result = this.noteService.findAll();
  }

  @BusinessKernel.Process.seed({ match: { pattern: 'notes', method: 'POST' } })
  create(ctx: KernelContext) {
    const { title = '', content } = ctx.input.body as { title?: string; content?: string };
    ctx.result = this.noteService.create({ title, content });
  }

  @BusinessKernel.Process.seed('notes/:id')
  detail(ctx: KernelContext) {
    const id = ctx.metadata.params?.['id'];
    ctx.result = this.noteService.findById(id!);
  }
}

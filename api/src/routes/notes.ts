import { Inject, Injectable } from '@hwy-fm/di';
import { Kernel } from '@hwy-fm/kernel';
import type { SharedContext } from '../types';
import { NoteService } from './notes.service';

@Injectable()
export class NotesPipeline {
  constructor(@Inject(NoteService) private noteService: NoteService) {}

  @Kernel.Process.seed('/notes')
  list(ctx: SharedContext) {
    ctx.result = this.noteService.findAll();
  }

  @Kernel.Process.seed({ match: { pattern: '/notes', method: 'POST' } })
  create(ctx: SharedContext) {
    const { title = '', content } = ctx.input.body as { title?: string; content?: string };
    ctx.result = this.noteService.create({ title, content });
  }

  @Kernel.Process.seed('/notes/:id')
  detail(ctx: SharedContext) {
    const id = ctx.metadata.params?.['id'];
    ctx.result = this.noteService.findById(id!);
  }
}

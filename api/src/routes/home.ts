import { Kernel } from '@hwy-fm/kernel';
import type { SharedContext } from '../types';

@Kernel.Process.seed('/')
export class HomeRoute {
  execute(ctx: SharedContext) {
    ctx.result = {
      name: 'My API',
      version: '0.1.0',
      endpoints: [
        'GET  /           → API info',
        'GET  /notes      → List notes',
        'POST /notes      → Create note',
        'GET  /notes/:id  → Get note by id',
      ],
    };
  }
}

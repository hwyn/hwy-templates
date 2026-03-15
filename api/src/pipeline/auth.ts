import { Kernel, Input } from '@hwy-fm/kernel';
import type { SharedContext } from '../types';

@Kernel.Guard.instruction('/notes/**')
export class AuthGuard {
  @Input('apiKey') private expectedKey!: string;

  execute(ctx: SharedContext) {
    const { credentials } = ctx.input;

    if (!credentials?.apiKey || credentials.apiKey !== this.expectedKey) {
      throw { status: 401, message: 'Unauthorized: invalid or missing API key' };
    }
  }
}

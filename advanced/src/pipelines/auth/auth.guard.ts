import { Inject } from '@hwy-fm/di';
import { BusinessKernel } from '../../kernel/business.model';
import type { KernelContext } from '../../types/kernel.types';
import { AuthService } from './auth.service';

@BusinessKernel.Guard.instruction('notes/**')
export class AuthGuard {
  constructor(@Inject(AuthService) private auth: AuthService) { }

  execute(ctx: KernelContext) {
    this.auth.validate(ctx.input.credentials.apiKey);
  }
}

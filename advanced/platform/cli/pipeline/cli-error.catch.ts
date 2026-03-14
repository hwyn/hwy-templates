import { Inject } from '@hwy-fm/di';
import { Kernel, type Context } from '@hwy-fm/kernel';
import { ErrorCatchService } from '../../shared/error-catch';

@Kernel.Catch.instruction()
export class CliErrorCatch {
  constructor(@Inject(ErrorCatchService) private errorCatch: ErrorCatchService) { }

  execute(ctx: Context, next: () => any) {
    return this.errorCatch.handle(ctx, next, 'CLI Error');
  }
}

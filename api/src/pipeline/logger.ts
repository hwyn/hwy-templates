import { Kernel } from '@hwy-fm/kernel';
import type { SharedContext } from '../types';

@Kernel.Trace.instruction()
export class RequestLogger {
  execute(ctx: SharedContext) {
    const { method, path, error } = ctx.metadata;
    const status = error?.status ?? 200;
    console.log(`${method} ${path} → ${status}`);
  }
}

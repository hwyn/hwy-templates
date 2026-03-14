import { Gateway } from '@hwy-fm/std';
import { Kernel } from '@hwy-fm/kernel';

import type { KernelContext } from '../types/kernel.types';
import { BusinessKernel } from './business.model';

@Kernel.Process.seed('**')
export class BusinessBridge extends Gateway<KernelContext>(BusinessKernel) {
  prepare(ctx: KernelContext) {
    return { metadata: ctx.metadata, input: ctx.input };
  }
}

/**
 * Guard Instruction — runs before every Seed in the pipeline.
 *
 * This demonstrates INGRESS stage cross-cutting concerns.
 * The Guard slot runs after Catch → Receive → Identify, before Check → Process.
 */
import { Kernel } from '@hwy-fm/kernel';

@Kernel.Guard.instruction('**')
class LogGuard {
  execute(ctx: any) {
    console.log(`[guard] path=${ctx.metadata.path}`);
  }
}

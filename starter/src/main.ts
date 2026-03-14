/**
 * Starter template for @hwy-fm
 *
 * This file bootstraps a minimal Kernel application with:
 *   - One Seed (business logic entry point)
 *   - One Guard Instruction (cross-cutting concern)
 *
 * Run: hwy start
 */
import { Kernel } from '@hwy-fm/kernel';
import '@hwy-fm/std';

import './guard';

// --- Seed: business logic entry point ---
@Kernel.Process.seed('hello')
class HelloSeed {
  execute(ctx: any) {
    ctx.result = { message: 'Hello from @hwy-fm!' };
  }
}

@Kernel.Process.seed('greet')
class GreetSeed {
  execute(ctx: any) {
    const name = ctx.input.args?.[0] || 'World';
    ctx.result = { message: `Hi, ${name}!` };
  }
}

// --- Bootstrap ---
@Kernel.bootstrap()
class App {
  constructor(private kernel: Kernel) {}

  async main() {
    console.log('App started. Use REPL to dispatch commands:');
    console.log('  hello          → { message: "Hello from @hwy-fm!" }');
    console.log('  greet Alice    → { message: "Hi, Alice!" }');
  }
}

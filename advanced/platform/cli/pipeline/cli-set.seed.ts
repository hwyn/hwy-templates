import { Inject } from '@hwy-fm/di';
import { Kernel, type Context } from '@hwy-fm/kernel';
import { CliEnvService } from '../cli-env.service';

@Kernel.Process.seed('set')
export class CliSetSeed {
  constructor(@Inject(CliEnvService) private env: CliEnvService) { }

  execute(ctx: Context) {
    const args: string[] = ctx.input.args || [];
    const key = args[0] || ctx.input.options?.key;
    const value = args[1] || ctx.input.options?.value;
    if (!key) {
      ctx.result = this.env.isEmpty ? { message: 'No settings' } : this.env.all();
      return;
    }
    if (value) {
      this.env.set(key, value);
      ctx.result = { message: `✅ ${key} = ${value}` };
    } else {
      this.env.delete(key);
      ctx.result = { message: `✅ ${key} cleared` };
    }
  }
}

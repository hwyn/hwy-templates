import { Inject } from '@hwy-fm/di';
import { Kernel, type Context } from '@hwy-fm/kernel';
import { CliEnvService } from '../cli-env.service';

@Kernel.Receive.instruction()
export class CliReceive {
  constructor(@Inject(CliEnvService) private env: CliEnvService) { }

  execute(ctx: Context) {
    ctx.input.headers ??= {};
    ctx.input.credentials = { apiKey: ctx.input.options?.api_key || this.env.get('api_key') };
    ctx.input.body = { ...ctx.input.options, ...ctx.input.body };
    if (ctx.input.options?.method) {
      ctx.metadata.method = ctx.input.options.method;
      delete ctx.metadata._parsed;
    }
  }
}

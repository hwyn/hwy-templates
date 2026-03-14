import { Kernel, type Context } from '@hwy-fm/kernel';

@Kernel.Deliver.instruction('**')
export class CliDeliver {
  execute(ctx: Context) {
    const result = ctx.result;
    if (result?._isError) {
      console.error(`❌ ${result.error || `Error ${result.status}`}`);
      return;
    }
    if (result !== undefined) {
      const strings = Object.values(result).filter((v): v is string => typeof v === 'string');
      if (strings.some(v => v.includes('\n'))) {
        for (const v of strings) console.log(v + '\n');
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    }
  }
}

import type http from 'http';
import { Context, Kernel } from '@hwy-fm/kernel';
import type { StdDecorator, StdInstructionEntry } from '@hwy-fm/std';

type ExpressMiddleware = (req: http.IncomingMessage, res: http.ServerResponse, next: (err?: any) => void) => void;

declare module '@hwy-fm/std' {
  interface StdSlotMethodRegistry {
    middleware(middlewares: ExpressMiddleware[], entry?: StdInstructionEntry): StdDecorator;
  }
}

function buildChain(original: Function, middlewares: ExpressMiddleware[]): Function {
  if (middlewares.length === 0) return original;

  let chain: Function = function (this: any, ctx: Context, next: () => any) {
    return original.call(this, ctx, next);
  };

  for (let i = middlewares.length - 1; i >= 0; i--) {
    const mw = middlewares[i];
    const inner = chain;
    chain = function (this: any, ctx: Context, next: () => any) {
      const self = this;
      let syncResult: any;
      let syncCalled = false;
      let resolve: ((v: any) => void) | undefined;
      let reject: ((e: any) => void) | undefined;

      mw(ctx.input.req, ctx.input.res, (err) => {
        if (err) {
          if (reject) { reject(err); } else { throw err; }
          return;
        }
        try {
          const r = inner.call(self, ctx, next);
          if (resolve) { resolve(r); } else { syncResult = r; syncCalled = true; }
        } catch (e) {
          if (reject) { reject(e); } else { throw e; }
        }
      });

      if (syncCalled) return syncResult;
      return new Promise<any>((res, rej) => { resolve = res; reject = rej; });
    };
  }

  return chain;
}

Kernel.defineSlotMethod('middleware', (middlewares: ExpressMiddleware[], entry?: StdInstructionEntry) => ({
  entry,
  decorate(target, propertyKey, descriptor) {
    if (propertyKey !== undefined && descriptor) {
      descriptor.value = buildChain(descriptor.value, middlewares);
    } else {
      (target as Function).prototype.execute = buildChain((target as Function).prototype.execute, middlewares);
    }
  },
}));

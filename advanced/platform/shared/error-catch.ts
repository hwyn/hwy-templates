import { Injectable } from '@hwy-fm/di';
import { ResourceNotFoundException, type Context } from '@hwy-fm/kernel';

export interface ErrorResult {
  _isError: true;
  status: number;
  error: string;
}

@Injectable()
export class ErrorCatchService {
  handle(ctx: Context, next: () => any, defaultMessage = 'Unknown error') {
    try {
      const r = next();
      if (r && typeof r.then === 'function') {
        return r.catch((e: any) => {
          ctx.result = this.toErrorResult(e, defaultMessage);
        });
      }
      return r;
    } catch (e: any) {
      ctx.result = this.toErrorResult(e, defaultMessage);
    }
  }

  private toErrorResult(e: any, defaultMessage: string): ErrorResult {
    if (e instanceof ResourceNotFoundException) return { _isError: true, status: 404, error: e.message };
    return { _isError: true, status: e?.status || 500, error: e?.message || defaultMessage };
  }
}

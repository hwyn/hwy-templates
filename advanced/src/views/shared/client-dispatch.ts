import { Injectable } from '@hwy-fm/di';
import { STD_PROTOCOL } from '@hwy-fm/std';
import { BusinessKernel } from '../../kernel/business.model';

@Injectable()
export class ClientDispatchService {
  async dispatch<T = any>(
    path: string,
    options?: { method?: string; query?: Record<string, string>; body?: Record<string, any>; apiKey?: string }
  ): Promise<T> {
    const { method = 'GET', query = {}, body = {}, apiKey = '' } = options || {};
    const protocol = BusinessKernel.kernel.inject(STD_PROTOCOL);
    const ctx = BusinessKernel.kernel.createContext({
      protocol,
      metadata: { path, method, query },
      input: { headers: {}, body, credentials: { apiKey } },
    });
    await BusinessKernel.kernel.dispatch(ctx);
    return ctx.result;
  }
}

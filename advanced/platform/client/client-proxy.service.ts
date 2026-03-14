/**
 * ClientProxyService — generic client-side HTTP proxy + SSR hydration.
 *
 * Platform capability: fetch JSON from server, consume SSR-hydrated data.
 * Application code injects this to implement remote data access patterns.
 */
import { Injectable } from '@hwy-fm/di';

@Injectable()
export class ClientProxyService {
  private ssrConsumed = false;

  consumeSSR(): any {
    if (this.ssrConsumed) return undefined;
    this.ssrConsumed = true;
    const el = document.getElementById('__SSR_DATA__');
    if (!el) return undefined;
    const payload = JSON.parse(el.textContent!);
    el.remove();
    return payload.data;
  }

  async fetch(path: string, method: string, query?: Record<string, string>, credentials?: Record<string, string>, body?: any): Promise<any> {
    const url = this.buildUrl(path, query);
    const init = this.buildInit(method, credentials, body);
    return this.request(url, init);
  }

  private buildUrl(path: string, query?: Record<string, string>): string {
    const search = query ? new URLSearchParams(query).toString() : '';
    return `/${path.replace(/^\/+/, '')}${search ? '?' + search : ''}`;
  }

  private buildInit(method: string, credentials?: Record<string, string>, body?: any): RequestInit {
    const headers: Record<string, string> = { 'accept': 'application/json' };

    if (credentials) {
      for (const [key, value] of Object.entries(credentials)) {
        if (value) headers[`x-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
      }
    }

    const init: RequestInit = { method, headers };

    if (method !== 'GET' && method !== 'HEAD' && body) {
      headers['content-type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    return init;
  }

  private async request(url: string, init: RequestInit) {
    const res = await fetch(url, init);
    const data = await res.json().catch(() => null);

    if (res.ok) return data;

    return (data && typeof data === 'object')
      ? { ...data, _isError: true, status: res.status }
      : { _isError: true, status: res.status, error: res.statusText };
  }
}

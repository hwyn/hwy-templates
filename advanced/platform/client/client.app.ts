import { Injectable, Injector, Provider } from '@hwy-fm/di';
import { APPLICATION_TOKEN, Kernel, type ProtocolIdentifier } from '@hwy-fm/kernel';
import { STD_PROTOCOL } from '@hwy-fm/std';

@Injectable()
export class ClientService {
  private kernel: Kernel;
  private protocol: ProtocolIdentifier;
  constructor(private platformInjector: Injector) { }

  async bootstrapStart(providers: Provider[]) {
    const injector = Injector.create(providers, this.platformInjector);

    this.kernel = injector.get(Kernel);
    this.protocol = injector.get(STD_PROTOCOL);
    await injector.getAsync(APPLICATION_TOKEN);

    this.start();
  }

  start() {
    this.navigate();

    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const link = (e.target as Element)?.closest?.('a') as HTMLAnchorElement;
      if (!link || link.hasAttribute('download') || link.target === '_blank') return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      try {
        const url = new URL(link.href, location.origin);
        if (url.origin !== location.origin) return;
      } catch { return; }
      e.preventDefault();
      history.pushState(null, '', link.href);
      this.navigate();
    });

    window.addEventListener('popstate', () => this.navigate());
  }

  private async navigate() {
    const url = new URL(window.location.href);
    const path = url.pathname.replace(/^\/+/, '') || '/';
    const query = Object.fromEntries(url.searchParams);
    const ctx = this.kernel.createContext({
      protocol: this.protocol,
      metadata: { path, method: 'GET', query },
      input: {},
    });
    await this.kernel.dispatch(ctx);
  }
}

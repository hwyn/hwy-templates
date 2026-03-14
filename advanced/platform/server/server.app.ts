import http from 'http';
import { Injectable, Injector, Provider } from '@hwy-fm/di';
import { STD_PROTOCOL } from '@hwy-fm/std';
import { APPLICATION_TOKEN, Kernel, type ProtocolIdentifier } from '@hwy-fm/kernel';

import { HTML_PROTOCOL } from './html-protocol';

const port = 3005;
declare const hotReload: any;

@Injectable()
export class ServerService {
  private server: http.Server;
  private protocol: ProtocolIdentifier;
  private kernel: Kernel;

  constructor(private platformInjector: Injector) { }

  async bootstrapStart(providers: Provider[]) {
    const injector = Injector.create(providers, this.platformInjector);

    this.kernel = injector.get(Kernel);
    this.protocol = injector.get(STD_PROTOCOL);
    await injector.getAsync(APPLICATION_TOKEN);

    this.start();
  }

  async start() {
    const ctxArg: Parameters<Kernel['createContext']>[0] = { protocol: this.protocol, metadata: null!, input: null! };

    this.server = http.createServer((req, res) => {
      const accept = req.headers.accept || '';
      ctxArg.protocol = accept.includes('text/html') ? HTML_PROTOCOL : STD_PROTOCOL;
      ctxArg.metadata = { path: req.url?.substring(1) || '/', method: req.method, accept };
      ctxArg.input = { req, res };
      const context = this.kernel.createContext(ctxArg);
      try {
        const r = this.kernel.dispatch(context);
        if (r instanceof Promise) r.catch((e) => this.handleDispatchError(e, res));
      } catch (e) {
        this.handleDispatchError(e, res);
      }
    });

    this.server.keepAliveTimeout = 5000;
    this.server.headersTimeout = 6000;
    this.listen();
  }

  private handleDispatchError(e: unknown, res: http.ServerResponse) {
    if (res.headersSent) return;
    const err = e as { status?: number; code?: string; message?: string };
    const status = err.status || (err.code === 'NOT_FOUND' ? 404 : 500);
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
  }

  private listen() {
    const hotHost = `http://localhost:${port}`;
    this.server.listen(port, () => console.log(`Server listening at ${hotHost}`));

    if (typeof hotReload === 'function') {
      hotReload({
        hotHost, hotReload: () => {
          this.server.close();
          this.kernel.inject(Injector).destroy();
          this.platformInjector.destroy();
        }
      });
    }
  }
}

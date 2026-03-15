import http from 'http';
import { WebSocketServer, type WebSocket } from 'ws';
import { Inject, Injectable, Injector } from '@hwy-fm/di';
import { APPLICATION_METADATA, Kernel } from '@hwy-fm/kernel';
import { HTTP_PROTOCOL, WS_PROTOCOL } from './protocol';
import type { WsMessage } from './types';

type ContextArg = Parameters<Kernel['createContext']>[0];

declare const hotReload: any;
declare const __DEMO_HTML__: string | undefined;

@Injectable()
export class ServerApp {
  @Inject(APPLICATION_METADATA) private metadata!: Record<string, unknown>;

  private server!: http.Server;
  private wss!: WebSocketServer;
  private httpArg: ContextArg = { protocol: HTTP_PROTOCOL, metadata: null!, input: null! };
  private wsArg: ContextArg = { protocol: WS_PROTOCOL, metadata: null!, input: null! };

  constructor(private kernel: Kernel) { }

  start() {
    this.server = http.createServer((req, res) => this.handleHttp(req, res));
    this.wss = new WebSocketServer({ server: this.server });
    this.wss.on('connection', (ws) => this.handleWsConnection(ws));

    this.server.keepAliveTimeout = 5000;
    this.server.headersTimeout = 6000;
    this.listen();
  }

  private listen() {
    const port = this.metadata.port as number;
    const hotHost = `http://localhost:${port}`;
    this.server.listen(port, () => {
      console.log(`Server listening at ${hotHost}`);
      console.log(`WebSocket available at ws://localhost:${port}`);
    });

    if (typeof hotReload === 'function') {
      hotReload({
        hotHost,
        hotReload: () => {
          this.wss.clients.forEach((c) => c.close());
          this.wss.close();
          this.server.close();
          this.kernel.inject(Injector).destroy();
        },
      });
    }
  }

  private handleHttp(req: http.IncomingMessage, res: http.ServerResponse) {
    if (typeof __DEMO_HTML__ !== 'undefined' && (req.url === '/' || req.url === '/demo')) {
      const accept = req.headers.accept || '';
      if (accept.includes('text/html')) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(__DEMO_HTML__);
        return;
      }
    }

    this.httpArg.metadata = { path: req.url || '/', method: req.method };
    this.httpArg.input = { req, res };
    this.dispatch(
      this.httpArg,
      (e) => this.sendHttpError(res, e),
      (ctx) => { if (this.isMutation(req.method)) this.broadcast('created', ctx.result); },
    );
  }

  private sendHttpError(res: http.ServerResponse, e: unknown) {
    if (res.headersSent) return;
    const { status, message } = this.toError(e);
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
  }

  private handleWsConnection(ws: WebSocket) {
    ws.on('message', (raw) => {
      let msg: WsMessage;
      try { msg = JSON.parse(raw.toString()); } catch {
        ws.send(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }
      this.wsArg.metadata = { path: msg.path || '/', method: msg.method || 'GET' };
      this.wsArg.input = { ws, message: msg };
      this.dispatch(
        this.wsArg,
        (e) => this.sendWsError(ws, e),
        (ctx) => { if (this.isMutation(msg.method)) this.broadcast('created', ctx.result, ws); },
      );
    });
  }

  private sendWsError(ws: WebSocket, e: unknown) {
    if (ws.readyState !== 1) return;
    const { status, message } = this.toError(e);
    ws.send(JSON.stringify({ error: message, status }));
  }

  private broadcast(event: string, data: unknown, exclude?: WebSocket) {
    const msg = JSON.stringify({ event, data });
    for (const c of this.wss.clients) {
      if (c !== exclude && c.readyState === 1) c.send(msg);
    }
  }

  private dispatch(arg: ContextArg, onError: (e: unknown) => void, onDone?: (ctx: any) => void) {
    try {
      const ctx = this.kernel.createContext(arg);
      const r = this.kernel.dispatch(ctx);
      if (r instanceof Promise) r.then(() => onDone?.(ctx)).catch(onError);
      else onDone?.(ctx);
    } catch (e) {
      onError(e);
    }
  }

  private toError(e: unknown) {
    const err = e as { status?: number; message?: string };
    return { status: err.status || 500, message: err.message || 'Internal Server Error' };
  }

  private isMutation(m?: string) {
    return m === 'POST' || m === 'PUT' || m === 'DELETE';
  }
}

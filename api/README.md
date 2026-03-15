# My API

Dual-protocol (HTTP + WebSocket) API server built with [@hwy-fm/kernel](https://www.npmjs.com/package/@hwy-fm/kernel) + [@hwy-fm/std](https://www.npmjs.com/package/@hwy-fm/std).

Demonstrates Kernel's core paradigm: **protocol-agnostic pipeline** — business logic, auth, error handling, and logging are written once and shared across HTTP and WebSocket without any protocol awareness.

## Quick Start

```bash
npm install
hwy start
```

Server runs at `http://localhost:4000` (HTTP) and `ws://localhost:4000` (WebSocket).

Open **http://localhost:4000** in browser — the demo page loads automatically (content negotiation via `Accept` header). API clients like `curl` still get JSON. Create a note on one side, it pushes to the other in real time.

## API Endpoints

Both HTTP and WebSocket share the same routes and business logic:

```
GET  /              → API info
GET  /notes         → List all notes (requires API key)
POST /notes         → Create a note (requires API key)
GET  /notes/:id     → Get note by id (requires API key)
```

### HTTP

```bash
curl http://localhost:4000/
curl -H "X-API-Key: my-secret-key" http://localhost:4000/notes

curl -X POST -H "X-API-Key: my-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Note","content":"Hello"}' \
  http://localhost:4000/notes
```

### WebSocket

Send JSON messages — same routes, same auth, same response:

```javascript
const ws = new WebSocket('ws://localhost:4000');

ws.onopen = () => {
  ws.send(JSON.stringify({ path: '/notes', apiKey: 'my-secret-key' }));

  ws.send(JSON.stringify({
    path: '/notes',
    method: 'POST',
    apiKey: 'my-secret-key',
    body: { title: 'My Note', content: 'Created via WebSocket' }
  }));
};

ws.onmessage = (e) => {
  const data = JSON.parse(e.data);
  if (data.event === 'created') {
    console.log('Push:', data.data);   // real-time push from other protocol
  } else {
    console.log('Response:', data);
  }
};
```

When a note is created (via either HTTP or WS), all other WS clients receive a push with the created data — no polling needed.

## Protocol Architecture

Kernel is a **protocol-agnostic pipeline engine**. The same compiled pipeline runs for both HTTP and WebSocket — only the transport layer differs:

```
                   ┌─ HTTP Receive (req → ctx)          HTTP Deliver (ctx → res) ─┐
Catch → CORS(*) → ├                            Guard → Process →                 ├→ Trace
                   └─ WS Receive   (msg → ctx)          WS Deliver  (ctx → ws)  ─┘
                         ↑                                    ↑
                   protocol-specific               protocol-specific
                   (knows req/res or ws)           (knows res or ws)

                   Everything else is SHARED — only sees ctx data, not the protocol
```

Three protocol identifiers control dispatch:

| Protocol | Purpose | Instructions |
|---|---|---|
| `STD_PROTOCOL` | Shared base | catch, auth, logger, all seeds |
| `HTTP_PROTOCOL` | HTTP transport | receive, body-parser, cors, deliver |
| `WS_PROTOCOL` | WebSocket transport | receive (ws), deliver (ws) |

The `ProtocolAdmission` officer clones all `STD_PROTOCOL` instructions to `[STD, HTTP, WS]`, so shared code runs for both protocols automatically.

(*) CORS is HTTP-only — WebSocket connections handle origin at upgrade time.

## Project Structure

```
src/
├── main.ts                # Bootstrap entry point
├── protocol.ts            # HTTP_PROTOCOL, WS_PROTOCOL + ProtocolAdmission
├── server.ts              # ServerApp DI class — HTTP + WS server + dispatch
├── middleware.ts           # Express middleware adapter (defineSlotMethod)
├── types.ts               # SharedContext / HttpContext / WsContext
├── pipeline/
│   ├── catch.ts           # Catch    — sync error boundary (shared, onion)
│   ├── cors.ts            # CORS     — custom ingress slot (HTTP-only)
│   ├── receive.ts         # Receive  — HTTP + WS in one class (method decorators)
│   ├── body-parser.ts     # Receive  — HTTP body parse (compile-time match)
│   ├── auth.ts            # Guard    — API key via @Input (shared)
│   ├── deliver.ts         # Deliver  — HTTP + WS in one class (method decorators)
│   └── logger.ts          # Trace    — request logging (shared, egress)
├── routes/
│   ├── home.ts            # GET /           (shared seed)
│   ├── notes.ts           # Notes CRUD      (shared seeds)
│   └── notes.service.ts   # In-memory logic (DI singleton)
└── public/
    └── index.html         # Interactive demo page (build-time injected)
```

## Kernel Features Demonstrated

| Feature | Where | What |
|---|---|---|
| **Pipeline compilation** | All pipeline/ files | Slots compiled at startup, direct calls at runtime |
| **Seed routing** | routes/ | `@Kernel.Process.seed('/notes/:id')` — pattern matching |
| **Instruction cross-cut** | pipeline/ | `@Kernel.Guard.instruction('/notes/**')` |
| **Compile-time match** | body-parser.ts | `{ match: { pattern: '**', method: 'POST' } }` |
| **Slot composers** | catch (onion), deliver (egress), receive (linear) | All three composer types |
| **Custom slots** | cors.ts | `Kernel.ingress('cors', { anchors })` |
| **defineSlotMethod** | middleware.ts | Extends slot builder with `.middleware()` |
| **AdmissionOfficer** | protocol.ts | Clones STD instructions to HTTP + WS |
| **Multi-protocol dispatch** | server.ts + receive/deliver | Method decorators split by protocol |
| **DI injection** | notes.ts, server.ts | `@Inject`, `@Injectable`, constructor injection |
| **@Input metadata** | auth.ts | `@Input('apiKey')` reads bootstrap config |
| **Bootstrap lifecycle** | main.ts | `@Kernel.bootstrap()` + `main()` |
| **Context data flow** | Full pipeline | `ctx.input` → `ctx.result` |
| **Hot reload** | server.ts | `hotReload()` cleans up server + DI on code change |

## How Protocol Dispatch Works

```typescript
// protocol.ts — admission clones shared instructions to all protocols
@Kernel.admission()
class ProtocolAdmission implements AdmissionOfficer {
  admitInstruction(inst) {
    if (inst.protocol === STD_PROTOCOL) {
      return { ...inst, protocol: [STD_PROTOCOL, HTTP_PROTOCOL, WS_PROTOCOL] };
    }
    return inst;
  }
}

// receive.ts — one class, two protocols via method decorators
@Injectable()
class RequestReceive {
  @Kernel.Receive.instruction({ protocol: HTTP_PROTOCOL })
  http(ctx: HttpContext) { /* req.headers → ctx.input */ }

  @Kernel.Receive.instruction({ protocol: WS_PROTOCOL })
  ws(ctx: WsContext) { /* message → ctx.input */ }
}

// auth.ts — shared, only sees ctx data
@Kernel.Guard.instruction('/notes/**')
class AuthGuard {
  @Input('apiKey') private expectedKey!: string;
  execute(ctx: SharedContext) { /* checks ctx.input.credentials */ }
}
```

## Extending: Add a New Protocol in 3 Steps

Kernel's protocol-agnostic design means adding a third protocol (gRPC, MQTT, IPC, etc.) requires **zero changes** to existing business logic:

**Step 1 — Define the protocol token**

```typescript
import { InjectionToken } from '@hwy-fm/di';
export const GRPC_PROTOCOL = new InjectionToken('grpc');
```

**Step 2 — Register in ProtocolAdmission**

```typescript
// protocol.ts — one line change
return { ...inst, protocol: [STD_PROTOCOL, HTTP_PROTOCOL, WS_PROTOCOL, GRPC_PROTOCOL] };
```

**Step 3 — Add Receive / Deliver methods**

```typescript
// receive.ts — add one method
@Kernel.Receive.instruction({ protocol: GRPC_PROTOCOL })
grpc(ctx: GrpcContext) { /* extract from gRPC call → ctx.input */ }

// deliver.ts — add one method
@Kernel.Deliver.instruction({ protocol: GRPC_PROTOCOL })
grpc(ctx: GrpcContext) { /* ctx.result → gRPC response */ }
```

Existing Guard, Process, Catch, Trace instructions all run automatically for the new protocol — no duplication, no rewiring.

## Why Protocol-Agnostic Matters

Compare implementing HTTP + WebSocket with shared auth across frameworks:

| | Kernel | Express + ws | NestJS |
|---|---|---|---|
| **Business logic** | Write once (Process seed) | Write once (service), call from 2 places | Write once (service), call from 2 places |
| **Auth guard** | 1 class, auto-applied to all protocols | 2 implementations (middleware + manual WS check) | 2 decorators (`@UseGuards` on Controller + Gateway) |
| **Error handling** | 1 Catch instruction, shared | `try/catch` in HTTP handler + WS `onMessage` separately | 2 exception filters |
| **Logging** | 1 Trace instruction, shared | 2 logger middlewares (HTTP-only + custom WS) | 2 interceptors |
| **Add 3rd protocol** | 3 steps above (no existing code touched) | Rewrite from scratch | Not supported |
| **Middleware reuse** | Cross-protocol by default | HTTP-only (`app.use`) | Scope-dependent |

The key difference: other frameworks bind protocol to handler. Kernel separates them — only the pipeline edges (Receive / Deliver) know the protocol; everything in between only sees context data.

## Performance

Kernel pipelines are statically compiled at startup — runtime dispatch is direct function calls with no middleware resolution overhead. On equivalent benchmarks (same routes, CORS, auth, error handling), HTTP throughput is within ~3% of Fastify.

```bash
npm i -g autocannon
hwy build && node dist/server.js &
autocannon -c 100 -d 10 http://localhost:4000/
```

### Key Patterns

**1. Don't parse URLs yourself** — Kernel handles it via `parseContextUrl`:

```typescript
// ✗ Redundant parsing
const url = new URL(req.url, `http://${req.headers.host}`);

// ✓ Pass raw url, Kernel parses path/query/hash with security checks
ctxArg.metadata = { path: req.url || '/', method: req.method };
```

**2. Don't use `async` in Catch** — Kernel detects sync/async via `isThenable`:

```typescript
// ✗ Forces entire pipeline into Promise mode
async execute(ctx, next) { try { await next(); } catch(e) { ... } }

// ✓ Stays sync when pipeline is sync
execute(ctx, next) { try { return next(); } catch(e) { ... } }
```

**3. Use match patterns instead of runtime checks** — resolved at compile time:

```typescript
// ✗ Runtime branching on every request
execute(ctx) { if (req.method === 'POST') { parseBody(req); } }

// ✓ Only invoked for matching methods (compile-time dispatch)
@Kernel.Receive.instruction({ match: { pattern: '**', method: 'POST' }, protocol: HTTP_PROTOCOL })
class BodyParser { execute(ctx) { parseBody(ctx.input.req); } }
```

## Express Middleware

`middleware.ts` registers a `.middleware()` slot method that lets you use Express-compatible middleware (helmet, compression, morgan, etc.) on any Kernel slot:

```typescript
import helmet from 'helmet';
import compression from 'compression';

@Kernel.Receive.middleware([helmet(), compression()])
export class SecureReceive {
  execute(ctx: HttpContext) { ... }
}
```

This bridges Kernel with the Express ecosystem — no need to rewrite existing middleware.

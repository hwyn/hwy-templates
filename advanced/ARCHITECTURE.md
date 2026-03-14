# Architecture

**Write business logic once. The platform is just a build parameter.**

Same codebase → HTTP API · SSR pages · CLI tools — and any protocol you need.

## How It Works

This project defines business logic once in `src/pipelines/`, then runs it on three platforms:

| Platform | Build | What it does |
|----------|-------|--------------|
| **Server** | `hwy start` | HTTP server with SSR via Vue |
| **Client** | `hwy build` | SPA hydration in the browser |
| **CLI** | `hwy build --env cli` | Command-line interface using the same pipelines |

The key: business code has no idea which platform it runs on. No `req`, `res`, `http`, `document`, or `process` — just Seeds and Instructions.

## Two Core Concepts

**Seed** — A business logic entry point with a route.

```typescript
@BusinessKernel.Process.seed('notes/:id')
detail(ctx: KernelContext) {
  ctx.result = this.noteService.findById(ctx.metadata.params?.['id']!);
}
```

**Instruction** — A cross-cutting concern, mounted by route pattern.

```typescript
@BusinessKernel.Guard.instruction('notes/**')
export class AuthGuard {
  execute(ctx: KernelContext) {
    this.auth.validate(ctx.input.credentials.apiKey);
  }
}
```

Seeds handle business logic. Instructions handle pipeline stages (auth, logging, error handling...). Both declare which routes they own. Kernel assembles them into a Pipeline at compile time.

## Platform Switching

Platforms are switched at build time via `resolveAlias` in `project.config.ts`:

```typescript
server: {
  resolveAlias: {
    "@hwy-fm/platform": "./platform/server",
    "@app/view": "./src/views/vue/deliver.server",
  }
},
client: {
  resolveAlias: {
    "@hwy-fm/platform": "./platform/client",
    "@app/view": "./src/views/vue/deliver.client",
  }
}
```

Business code only imports `@hwy-fm/platform` — it never directly imports `http`, `express`, or `document`. At compile time, those dependencies simply don't exist in the dependency graph. This isn't a convention — it's physically impossible.

Adding a new protocol? Create a `platform/ws/` directory + one alias line. Business code doesn't change.

## Pipeline

```
Request
  │
  ▼
INGRESS    catch → receive → guard → check
  │
  ▼
PROCESS    Seed.execute()          ← your business logic
  │
  ▼
EGRESS     deliver → trace         ← runs regardless of success or failure
  │
  ▼
Response
```

Each Slot (e.g. `guard`, `deliver`) can hold multiple Instructions, compiled by Kernel at startup into an immutable execution plan. Zero reflection, zero sorting at runtime.

## Kernel Nesting

This project uses two Kernels:

```
PlatformKernel          ← receives requests, protocol parsing
  └─ BusinessKernel     ← business logic, auth, CRUD
```

The bridge between them is a single file:

```typescript
// src/kernel/business.bridge.ts
@Kernel.Process.seed('**')
export class BusinessBridge extends Gateway<KernelContext>(BusinessKernel) {
  prepare(ctx: KernelContext) {
    return { metadata: ctx.metadata, input: ctx.input };
  }
}
```

Each Kernel has its own Seed/Instruction registry, its own lifecycle, and its own compilation. Teams can own separate Kernels and compose them via Gateway.

## Project Structure

```
src/
  main.ts                 # Kernel bootstrap entry
  cli.ts                  # CLI entry point
  kernel/
    business.model.ts       BusinessKernel definition (1 line)
    business.bridge.ts      PlatformKernel → BusinessKernel bridge
  pipelines/              # Business logic (platform-agnostic)
    auth/                   authentication
    notes/                  Notes CRUD
    home/                   home page
    debug/                  Pipeline Inspector
    playground/             Pipeline Playground
  views/                  # Vue pages + components

platform/                 # Platform adapters
  server/                   HTTP server, CORS, body parser
  client/                   SPA navigation, fetch proxy
  cli/                      CLI deliver
  shared/                   Cross-platform utilities
```

Business code is fully shared. Platform adapters are concentrated in a few files — infrastructure (HTTP parsing, DOM mounting, CORS), not business logic.

## Day-to-Day Development

| Task | How |
|------|-----|
| **Add a feature** | Add a Seed — automatically mounted to all protocols |
| **Add a protocol** | Add a `platform/xx/` directory + one alias line |
| **Cross-cutting concerns** | Add an Instruction in a separate file, auto-orchestrated by Slot |
| **Remove a feature** | Delete the Seed file — pipeline auto-excludes it |
| **Testing** | Seeds are pure functions + DI tokens — unit test directly |

## Packages

| Package | Role |
|---------|------|
| [`@hwy-fm/kernel`](https://www.npmjs.com/package/@hwy-fm/kernel) | Statically compiled computation kernel — not a framework, the thing you use to build one |
| [`@hwy-fm/std`](https://www.npmjs.com/package/@hwy-fm/std) | Framework built on Kernel — 8 pre-configured Slots, Gateway, one-liner decorators |
| [`@hwy-fm/di`](https://www.npmjs.com/package/@hwy-fm/di) | DI container — Scoping, Hooks, Async Governance |
| [`@hwy-fm/cli`](https://www.npmjs.com/package/@hwy-fm/cli) | Build tools + CLI scaffolding |

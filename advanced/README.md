# @hwy-fm Advanced Template

Full-stack application with **SSR + CSR + CLI** — three platforms sharing one codebase, zero code duplication.

Built with [`@hwy-fm/kernel`](https://www.npmjs.com/package/@hwy-fm/kernel) + [`@hwy-fm/std`](https://www.npmjs.com/package/@hwy-fm/std) + Vue 3.

## Quick Start

```bash
npm install
npm run build
npm start
```

## What This Project Demonstrates

- **Write once, run anywhere** — Business logic in `src/pipelines/` has no platform imports. Same Seeds power HTTP API, SSR pages, and CLI.
- **Platform as a build parameter** — `project.config.ts` swaps `@hwy-fm/platform` via `resolveAlias`. Adding a protocol = one directory + one alias line.
- **Kernel nesting** — PlatformKernel dispatches to BusinessKernel via `Gateway`. Each Kernel is physically isolated with its own compilation.
- **Static compilation** — All pipeline structure compiles once at startup. Zero reflection at runtime.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full design walkthrough — how platform switching works, how the pipeline is structured, and how to extend it.

## Project Structure

```
src/
  main.ts                 # Kernel bootstrap
  cli.ts                  # CLI entry point
  kernel/                 # BusinessKernel definition + bridge
  pipelines/              # Business logic: auth, notes, home, debug, playground
  views/                  # Vue pages + components
platform/
  server/                 # HTTP server, CORS, body parser, SSR
  client/                 # SPA hydration, fetch proxy
  cli/                    # CLI deliver
  shared/                 # Cross-platform utilities
project.config.ts         # Build config: server / client / CLI targets
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the development server |
| `npm run build` | Build CLI, then server + client bundles |

## Learn More

- [ARCHITECTURE.md](./ARCHITECTURE.md) — How this project is designed and how to extend it
- [@hwy-fm/kernel](https://www.npmjs.com/package/@hwy-fm/kernel) — The computation kernel powering everything
- [@hwy-fm/std](https://www.npmjs.com/package/@hwy-fm/std) — Framework built on Kernel
- [@hwy-fm/cli](https://www.npmjs.com/package/@hwy-fm/cli) — Build tools + CLI
- For a minimal starting point: `hwy create my-app --template starter`
- [DI documentation](https://www.npmjs.com/package/@hwy-fm/di)

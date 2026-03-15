# hwy-templates

Official project templates for [@hwy-fm](https://github.com/hwyn).

## Usage

```bash
npm install -g @hwy-fm/cli

# Default (api)
hwy create my-app

# Specific template
hwy create my-app --template starter
hwy create my-app --template api
hwy create my-app --template advanced
```

## Available Templates

| Template | Description | Use When |
|----------|-------------|----------|
| **starter** | Minimal — one Seed, one Guard, REPL only | Learning Kernel primitives |
| **api** | HTTP + WebSocket — dual-protocol API with shared pipeline, auth, CORS, real-time push, interactive demo | Building a backend service |
| **advanced** | SSR + CSR + CLI — multi-platform app with Vue | Full-stack or multi-platform app |

**starter** teaches seeds and instructions. **api** demonstrates protocol-agnostic pipelines — one codebase for HTTP and WebSocket with shared auth, error handling, and business logic. **advanced** shows the same paradigm across HTTP, CLI, and browser.

## Template Structure

Each template lives under `<name>/` at the repository root and must contain at least:

- `package.json` — dependencies and scripts
- `project.config.ts` — CLI build configuration
- `tsconfig.json` — TypeScript configuration
- `src/` — application source code

## License

MIT © [hwyn](https://github.com/hwyn)

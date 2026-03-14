# hwy-templates

Official project templates for [@hwy-fm](https://github.com/hwyn) — starter, advanced, and more.

## Usage

```bash
npm install -g @hwy-fm/cli

# Default (starter)
hwy create my-app

# Specific template
hwy create my-app --template starter
hwy create my-app --template advanced
```

## Available Templates

| Template | Description |
|----------|-------------|
| **starter** | Minimal setup — one Seed, one Guard, server only. Best for learning. |
| **advanced** | SSR + CSR + CLI — multi-platform app with Vue integration. *(coming soon)* |

## Template Structure

Each template lives under `templates/<name>/` and must contain at least:

- `package.json` — dependencies and scripts
- `project.config.ts` — CLI build configuration
- `tsconfig.json` — TypeScript configuration
- `src/` — application source code

## License

MIT © [hwyn](https://github.com/hwyn)

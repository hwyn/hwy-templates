# my-hwy-app

A minimal [**@hwy-fm**](https://www.npmjs.com/org/hwy-fm) application.

## Get Started

```bash
npm install
hwy start
```

In the REPL:

```
hwy> hello
hwy> greet Alice
```

## Project Structure

```
src/
  main.ts      — Bootstrap + two Seeds (hello, greet)
  guard.ts     — Guard Instruction (runs before every Seed)
project.config.ts — CLI build configuration
```

## What's Next

- Read the docs: [@hwy-fm/kernel](https://www.npmjs.com/package/@hwy-fm/kernel) · [@hwy-fm/di](https://www.npmjs.com/package/@hwy-fm/di) · [@hwy-fm/std](https://www.npmjs.com/package/@hwy-fm/std)
- Add more Seeds and Instructions to build your pipeline
- For SSR + CSR + Vue integration, use the **advanced** template: `hwy create my-app --template advanced`

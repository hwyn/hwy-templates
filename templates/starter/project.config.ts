import { defineConfig } from '@hwy-fm/cli';

export default defineConfig({
  root: '.',
  source: 'src',
  output: 'dist',

  server: {
    entry: 'main.ts',
    outputFormat: 'esm',
    minimize: false,
  },

  // Disable client / SSR platforms — server only
  client: false,
});

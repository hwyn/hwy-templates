import fs from 'fs';
import { defineConfig } from '@hwy-fm/cli';

export default defineConfig({
  root: '.',
  source: 'src',
  output: 'dist',

  server: {
    entry: 'main.ts',
    outputFormat: 'esm',
    minimize: false,
    define: {
      __DEMO_HTML__: JSON.stringify(fs.readFileSync('./public/index.html', 'utf-8')),
    },
  },

  client: false,
});

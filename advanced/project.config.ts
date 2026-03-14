import fs from 'fs';
import path from 'path';
import { defineConfig } from '@hwy-fm/cli';

const entry = [
  '@hwy-fm/std',
  '@hwy-fm/platform',
  '@app/business',
  '@app/view',
  'main.ts'
];

const dataPath = 'data';
const serverOutputPath = './';
const clientOutputPath = 'client';

export default defineConfig({
  root: '.',
  output: 'dist',
  source: 'src',
  tsConfig: './tsconfig.json',

  plugins: [
    './plugins/vue.strategy.ts'
  ],

  client: {
    outputPath: clientOutputPath,
    entry,
    index: 'views/assets/index.html',
    styles: ['views/assets/global.scss'],
    resolveAlias: {
      "@hwy-fm/platform": './platform/client',
      "@hwy-fm/platform/client": './platform/client',
      "@app/view": './src/views/vue/deliver.client',
      "@app/business": './src/kernel/business.progress.client'
    },
    tsConfig: './tsconfig.client.json'
  },

  server: {
    outputPath: serverOutputPath,
    entry,
    outputFormat: 'esm',
    minimize: false,
    resolveAlias: {
      "@hwy-fm/platform": './platform/server',
      "@hwy-fm/platform/server": './platform/server',
      "@app/view": './src/views/vue/deliver.server',
      "@app/business": './src/kernel/business.progress.server'
    },
    tsConfig: './tsconfig.server.json',
    buildAssets(platform, readSource) {
      let indexHtml = '<div id="app"></div>';
      if (platform.client?.files?.['index.html']) {
        indexHtml = readSource(platform.client.files['index.html']);
      }
      const clientPath = path.relative(serverOutputPath, clientOutputPath);
      return { ...platform, indexHtml, clientPath, dataPath };
    }
  },

  env: {
    client: {
      server: false
    },
    server: {
      client: false,
      define: {
        __BUILD_ASSETS__: JSON.stringify({
          indexHtml: fs.readFileSync('./src/views/assets/index.html', 'utf-8'),
          dataPath: 'data'
        })
      }
    },
    cli: {
      client: false,
      server: {
        entry: { 'cli': ['cli.ts'] },
        nodeExternalsDenylist: [/^@hwy-fm\//],
        resolveAlias: {
          '@hwy-fm/platform': './platform/cli',
          '@hwy-fm/platform/cli': './platform/cli'
        },
        define: {
          __BUILD_ASSETS__: JSON.stringify({ dataPath })
        }
      }
    }
  }
});

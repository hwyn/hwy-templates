import '@hwy-fm/std';

import { Inject } from '@hwy-fm/di';
import { Kernel } from '@hwy-fm/kernel';
import './protocol';
import './middleware';

import './pipeline/catch';
import './pipeline/receive';
import './pipeline/body-parser';
import './pipeline/cors';
import './pipeline/auth';
import './pipeline/deliver';
import './pipeline/logger';

import './routes/home';
import './routes/notes';

import { ServerApp } from './server';

@Kernel.bootstrap({ port: 4000, apiKey: 'my-secret-key' })
class App {
  @Inject(ServerApp) private server!: ServerApp;

  constructor(private kernel: Kernel) { }

  async main() {
    this.server.start();
  }
}

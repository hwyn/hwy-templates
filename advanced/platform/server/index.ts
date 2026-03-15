import './pipeline';
import './html-admission';

import { Provider } from '@hwy-fm/di';
import { createPlatformFactory, Kernel, PLATFORM } from '@hwy-fm/kernel';

import { ServerService } from './server.app';

export const PlatformKernel = Kernel.getModel();
export { HTML_PROTOCOL } from './html-protocol';
export { JsonFileStorage } from '../shared/json-file.storage';

Kernel.bootstrap = Kernel.getModel().createBootstrap((options) => {
  const createPlatform = createPlatformFactory<{ bootstrapStart(providers: Provider[]): Promise<void> }>(null, [
    { provide: ServerService, useClass: ServerService },
    { provide: PLATFORM, useExisting: ServerService }
  ]);

  createPlatform(options).bootstrapStart(options.providers);
});

import './pipeline';
import './client.app';
import './client-proxy.service';

import { Provider } from '@hwy-fm/di';
import { createPlatformFactory, Kernel, PLATFORM } from '@hwy-fm/kernel';
import { STD_PROTOCOL } from '@hwy-fm/std';

import { ClientService } from './client.app';

export { ClientProxyService } from './client-proxy.service';
export const PlatformKernel = Kernel.getModel();
export const HTML_PROTOCOL = STD_PROTOCOL;

Kernel.bootstrap = Kernel.getModel().createBootstrap((options) => {
  const createPlatform = createPlatformFactory<{ bootstrapStart(providers: Provider[]): Promise<void> }>(null, [
    { provide: ClientService, useClass: ClientService },
    { provide: PLATFORM, useExisting: ClientService }
  ]);
  createPlatform(options).bootstrapStart(options.providers);
});

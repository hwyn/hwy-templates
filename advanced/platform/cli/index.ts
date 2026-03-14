import './pipeline';

import { Kernel } from '@hwy-fm/kernel';

export const PlatformKernel = Kernel.getModel();
export { JsonFileStorage } from '../shared/json-file.storage';
export { CliEnvService } from './cli-env.service';

import { InjectorToken } from '@hwy-fm/di';
import { Kernel } from '@hwy-fm/kernel';

export declare const HTML_PROTOCOL: InjectorToken;
export const PlatformKernel = Kernel.getModel();
export { JsonFileStorage } from './shared/json-file.storage';

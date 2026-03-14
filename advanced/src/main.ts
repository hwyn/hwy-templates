import { Kernel, KernelPolicy } from '@hwy-fm/kernel';

KernelPolicy.applyConfig({ debug: false, timeout: 0 });

@Kernel.bootstrap()
export class App {
  main() {
    console.log('App started');
  }
}

import '@app/business';

import { PlatformKernel } from '@hwy-fm/platform/cli';

@PlatformKernel.bootstrap()
export class CliApp {
  main() {
    this.helpDeliver();
  }

  @PlatformKernel.Process.seed('help')
  helpDeliver() {
    console.log(`
🧩 Routes — same Seeds as browser / curl

    /                                      Home
    notes --api_key kernel-demo            🔒 Note list
    notes/1                                Note detail (public)
    notes --method POST --title "My Note"  🔒 Create note
    _debug                                 Pipeline topology

  REPL:
    set api_key kernel-demo                Set persistent credential
    set <key>                              Clear a setting
    set                                    Show all settings
`);
  }
}

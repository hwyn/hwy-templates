import { Kernel } from '@hwy-fm/kernel';
import type { AdmissionOfficer, PipelineInstruction, SeedInstruction } from '@hwy-fm/kernel';
import { STD_PROTOCOL } from '@hwy-fm/std';

import { HTML_PROTOCOL } from './html-protocol';

@Kernel.admission()
export class HtmlAdmission implements AdmissionOfficer {
  admitInstruction(instruction: PipelineInstruction) {
    if (instruction.protocol === STD_PROTOCOL) {
      return { ...instruction, protocol: [STD_PROTOCOL, HTML_PROTOCOL] };
    }
    return instruction;
  }

  admitSeed(seed: SeedInstruction) {
    if (seed.protocol === STD_PROTOCOL) {
      return { ...seed, protocol: [STD_PROTOCOL, HTML_PROTOCOL] };
    }
    return seed;
  }
}

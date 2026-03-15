import { InjectorToken } from '@hwy-fm/di';
import { Kernel, type AdmissionOfficer, type PipelineInstruction, type ProtocolIdentifier, type SeedInstruction } from '@hwy-fm/kernel';
import { STD_PROTOCOL } from '@hwy-fm/std';

export const HTTP_PROTOCOL = InjectorToken.get<ProtocolIdentifier>('HTTP_PROTOCOL');
export const WS_PROTOCOL = InjectorToken.get<ProtocolIdentifier>('WS_PROTOCOL');

@Kernel.admission()
export class ProtocolAdmission implements AdmissionOfficer {
  admitInstruction(instruction: PipelineInstruction) {
    if (instruction.protocol === STD_PROTOCOL) {
      return { ...instruction, protocol: [STD_PROTOCOL, HTTP_PROTOCOL, WS_PROTOCOL] };
    }
    return instruction;
  }

  admitSeed(seed: SeedInstruction) {
    if (seed.protocol === STD_PROTOCOL) {
      return { ...seed, protocol: [STD_PROTOCOL, HTTP_PROTOCOL, WS_PROTOCOL] };
    }
    return seed;
  }
}

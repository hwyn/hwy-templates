import { CompilerConfiguration } from '@hwy-fm/kernel';
import type { PipelineInstruction, SeedInstruction, MatchPattern, MatchPatternObject } from '@hwy-fm/kernel';

import { BusinessKernel } from '../../kernel/business.model';

@BusinessKernel.compilerConfiguration()
export class PlaygroundConfig extends CompilerConfiguration {
  private disabledSeeds = new Map<string, MatchPattern>();
  private disabledInstructions = new Map<string, { token: any; seedMatch: MatchPattern }>();
  private keyToToken = new Map<string, any>();

  excludeSeed(seed: SeedInstruction): boolean {
    return this.isDisabledSeed(seed.match);
  }

  excludeInstruction(instruction: PipelineInstruction, seed: SeedInstruction): boolean {
    return this.isDisabledInstruction(instruction.componentToken, seed.match);
  }

  disable(token: any, key: string, kind: string, match?: MatchPattern, seedMatch?: MatchPattern): void {
    if (kind === 'seed' && match) {
      this.disabledSeeds.set(key, match);
    } else if (kind === 'instruction' && seedMatch) {
      this.disabledInstructions.set(key, { token, seedMatch });
    }
    this.keyToToken.set(key, token);
  }

  enable(key: string, kind: string): boolean {
    const token = this.keyToToken.get(key);
    if (!token) return false;
    if (kind === 'seed') {
      this.disabledSeeds.delete(key);
    } else {
      this.disabledInstructions.delete(key);
    }
    this.keyToToken.delete(key);
    return true;
  }

  getToken(key: string): any {
    return this.keyToToken.get(key);
  }

  isDisabledSeed(match: MatchPattern): boolean {
    for (const m of this.disabledSeeds.values()) {
      if (this.matchEquals(match, m)) return true;
    }
    return false;
  }

  isDisabledInstruction(token: any, seedMatch: MatchPattern): boolean {
    for (const entry of this.disabledInstructions.values()) {
      if (entry.token === token && this.matchEquals(seedMatch, entry.seedMatch)) return true;
    }
    return false;
  }

  reset(): void {
    this.disabledSeeds.clear();
    this.disabledInstructions.clear();
    this.keyToToken.clear();
  }

  private matchEquals(a: MatchPattern, b: MatchPattern): boolean {
    if (a === b) return true;
    if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null && !(a instanceof RegExp) && !(b instanceof RegExp)) {
      const ao = a as MatchPatternObject;
      const bo = b as MatchPatternObject;
      return ao.pattern === bo.pattern && (ao.method || 'GET') === (bo.method || 'GET');
    }
    return String(a) === String(b);
  }
}

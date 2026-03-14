import { Injectable } from '@hwy-fm/di';
import type { MatchPattern } from '@hwy-fm/kernel';
import { TopologyInspector, TraceInspector } from '@hwy-fm/kernel/inspector';
import type { InspectLine } from '@hwy-fm/kernel/inspector';

import { BusinessKernel } from '../../kernel/business.model';
import { PlaygroundConfig } from './playground.config';
import type { RouteCard } from '../../types/playground.types';

@Injectable()
export class PlaygroundService {
  private traceBuffer = new Map<string, any[]>();

  storeTrace(trace: any[], metadata: { path: string; method: string }) {
    const key = `${metadata.method}:${metadata.path}`;
    this.traceBuffer.set(key, trace);
  }

  getLastTrace(method: string, path: string): InspectLine[] {
    const key = `${method}:${path}`;
    const trace = this.traceBuffer.get(key);
    if (!trace?.length) return [];
    return BusinessKernel.kernel.inject(TraceInspector).inspectTrace(trace).lines;
  }

  getRouteCards(): RouteCard[] {
    const lines = BusinessKernel.kernel.inject(TopologyInspector).inspect().lines;
    const config = BusinessKernel.kernel.inject(PlaygroundConfig);

    const seeds: { method: string; pattern: string; rawMatch: MatchPattern; label: string; token: any; excluded?: boolean }[] = [];
    const guards: { match: string; label: string; token: any; excluded?: boolean }[] = [];
    const excludedSeedLabels = new Set<string>();

    for (const line of lines) {
      const token = line.data?.hostClass;
      if (!token) continue;

      if (line.kind === 'seed' && line.data?.match) {
        const { method, pattern } = this.parseMatch(line.data.match);
        seeds.push({ method, pattern, rawMatch: line.data.match, label: line.label, token, excluded: line.excluded });
      } else if (line.kind === 'instruction' && line.data?.action === 'EXCLUDE') {
        excludedSeedLabels.add(line.label);
      } else if (line.kind === 'instruction' && line.data?.match) {
        guards.push({ match: line.data.match, label: line.label, token, excluded: line.excluded });
      }
    }

    const selfToken = seeds.find(s => s.method === 'GET' && s.pattern === '/')?.token;

    const cardMap = new Map<string, RouteCard & { seedLabels: string[]; rawMatches: MatchPattern[] }>();

    for (const seed of seeds) {
      const key = `${seed.method} ${seed.pattern}`;
      if (!cardMap.has(key)) {
        cardMap.set(key, {
          method: seed.method,
          pattern: seed.pattern,
          nodes: [],
          removed: [],
          seedLabels: [],
          rawMatches: [],
          verifyLinks: this.buildVerifyLinks(seed.method, seed.pattern),
          tryEndpoint: { method: seed.method, path: seed.pattern === '/' ? '' : this.resolveExamplePath(seed.pattern) },
        });
      }
      const card = cardMap.get(key)!;
      const tokenId = seed.token.name || String(seed.token);
      const self = seed.token === selfToken || undefined;
      card.seedLabels.push(seed.label);
      card.rawMatches.push(seed.rawMatch);

      if (config.isDisabledSeed(seed.rawMatch)) {
        card.removed.push({ kind: 'seed', label: seed.label, tokenId });
      } else {
        card.nodes.push({ kind: 'seed', label: seed.label, tokenId, excluded: seed.excluded, self });
      }
    }

    for (const [, card] of cardMap) {
      for (const guard of guards) {
        if (!this.guardMatchesRoute(guard.match, card.pattern)) continue;
        if (card.seedLabels.length > 0 && card.seedLabels.every(l => excludedSeedLabels.has(l))) continue;

        const tokenId = guard.token.name || String(guard.token);

        const seedMatch = card.rawMatches[0];
        if (seedMatch && config.isDisabledInstruction(guard.token, seedMatch)) {
          card.removed.push({ kind: 'instruction', label: guard.label, tokenId });
        } else {
          card.nodes.unshift({ kind: 'instruction', label: guard.label, tokenId, excluded: guard.excluded });
        }
      }
    }

    return Array.from(cardMap.values())
      .filter(({ method, pattern }) => !(method === 'GET' && pattern === '/'))
      .map(({ seedLabels, rawMatches, ...card }) => card);
  }

  async toggle(method: string, path: string, kind: string, enabled: boolean): Promise<void> {
    const config = BusinessKernel.kernel.inject(PlaygroundConfig);
    const key = `${kind}:${method}:${path || '/'}`;

    if (enabled) {
      if (!config.enable(key, kind)) {
        throw { status: 400, message: `No disabled ${kind} for ${method} ${path || '/'}` };
      }
    } else {
      const lines = this.inspectLines();
      const pattern = path || '/';
      const resolved = kind === 'seed'
        ? this.findSeed(lines, method, pattern)
        : this.findInstruction(lines, pattern);
      if (!resolved) throw { status: 400, message: `No matching ${kind} for ${method} ${pattern}` };
      if (this.findSeed(lines, 'GET', '/')?.token === resolved.token) {
        throw { status: 400, message: 'Cannot disable the Playground itself' };
      }
      const seedMatch = kind === 'instruction' ? this.findSeed(lines, method, pattern)?.match : undefined;
      config.disable(resolved.token, key, kind, resolved.match, seedMatch);
    }
    await BusinessKernel.kernel.remount();
  }

  async reset(): Promise<void> {
    const config = BusinessKernel.kernel.inject(PlaygroundConfig);
    config.reset();
    await BusinessKernel.kernel.remount();
  }

  private inspectLines(): InspectLine[] {
    return BusinessKernel.kernel.inject(TopologyInspector).inspect().lines;
  }

  private findSeed(lines: InspectLine[], method: string, pattern: string): { token: any; match: MatchPattern } | null {
    for (const line of lines) {
      const token = line.data?.hostClass;
      if (!token || line.kind !== 'seed' || !line.data?.match) continue;
      const parsed = this.parseMatch(line.data.match);
      if (parsed.method === method && parsed.pattern === pattern) return { token, match: line.data.match };
    }
    return null;
  }

  private findInstruction(lines: InspectLine[], pattern: string): { token: any; match: MatchPattern } | null {
    for (const line of lines) {
      const token = line.data?.hostClass;
      if (!token || line.kind !== 'instruction' || !line.data?.match) continue;
      if (this.guardMatchesRoute(line.data.match, pattern)) return { token, match: line.data.match };
    }
    return null;
  }

  private parseMatch(match: string | RegExp | { pattern: string; method?: string }): { method: string; pattern: string } {
    if (match instanceof RegExp) {
      return { method: 'GET', pattern: match.source };
    }
    if (typeof match === 'object') {
      return { method: match.method?.toUpperCase() || 'GET', pattern: match.pattern || '/' };
    }
    return { method: 'GET', pattern: match || '/' };
  }

  private guardMatchesRoute(guardMatch: string, routePattern: string): boolean {
    const base = guardMatch.replace(/\/?\*\*$/, '');
    if (!base) return true;
    return routePattern === base || routePattern.startsWith(base + '/');
  }

  private buildVerifyLinks(method: string, pattern: string): { label: string; href: string }[] {
    if (method !== 'GET') return [];
    const path = pattern === '/' ? '/' : `/${this.resolveExamplePath(pattern)}`;
    return [{ label: pattern, href: path }];
  }

  private resolveExamplePath(pattern: string): string {
    return pattern.replace(/:([^/]+)/g, '1');
  }
}

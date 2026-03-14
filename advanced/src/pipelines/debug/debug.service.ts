/**
 * DebugService — cross-kernel fractal introspection.
 *
 * Data layer: inspectLines() / routeLines() return InspectLine[].
 * Render layer: inspect() returns pre-rendered strings for convenience.
 */
import { Injectable } from '@hwy-fm/di';
import type { KernelModelInstance } from '@hwy-fm/kernel';
import { TopologyInspector, MatchInspector, renderTree } from '@hwy-fm/kernel/inspector';
import type { InspectLine } from '@hwy-fm/kernel/inspector';
import { PlatformKernel } from '@hwy-fm/platform';

const META = new Set(['header', 'separator', 'empty']);

@Injectable()
export class DebugService {
  inspectLines(edges?: string[]): InspectLine[] {
    const lines = this.merge(m => m.kernel.inject(TopologyInspector).inspect().lines, PlatformKernel, new Set(), edges);
    lines[0] = { ...lines[0], label: 'PlatformKernel' };
    return lines;
  }

  routeLines(route: string): InspectLine[] {
    return this.merge(m => m.kernel.inject(MatchInspector).inspectMatch(route).lines);
  }

  inspect(routeQuery?: string) {
    const edges: string[] = [];
    const lines = this.inspectLines(edges);
    return {
      graph: edges.length ? ['Cross-Kernel Graph:', ...edges].join('\n') : 'No cross-kernel gateways found',
      unifiedTopology: renderTree({ lines }),
      ...(routeQuery ? { routeLookupText: renderTree({ lines: this.routeLines(routeQuery) }) } : {}),
    };
  }

  private merge(
    resolve: (m: KernelModelInstance) => InspectLine[],
    model = PlatformKernel, seen = new Set<KernelModelInstance>(),
    edges?: string[],
    parentLabel = 'PlatformKernel',
  ): InspectLine[] {
    let source: InspectLine[];
    try { source = resolve(model); } catch { return []; }
    const out: InspectLine[] = [];
    for (const line of source) {
      if (line.kind === 'protocol' && line.data?.protocol) {
        const name = String(line.data.protocol).replace(/^Token /, '');
        out.push({ ...line, data: { ...line.data, protocol: `Protocol: ${name}` } });
        continue;
      }
      out.push(line);
      const t = (line.kind === 'instruction' || line.kind === 'seed') ? line.data?.hostClass?.__gateway__ : undefined;
      if (!t || seen.has(t)) continue;
      seen.add(t);
      const bridge = typeof line.data!.hostClass === 'function' ? line.data!.hostClass.name : 'Anonymous';
      const childLabel = bridge.replace('Bridge', 'Kernel');
      if (edges) edges.push(`  ${parentLabel} ──[${bridge}]──→ ${childLabel}`);
      const offset = line.depth + 1;
      for (const cl of this.merge(resolve, t, seen, edges, childLabel))
        if (!META.has(cl.kind)) out.push({ ...cl, depth: cl.depth + offset });
    }
    return out;
  }
}

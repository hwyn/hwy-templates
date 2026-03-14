import { Injectable } from '@hwy-fm/di';

export interface TreeNode {
  depth: number;
  marker: 'open' | 'close' | 'dot';
  node: string;
  slot: string;
  composer: string;
  duration: string;
  badge: string;
  status: string;
}

const COMPOSERS: Record<string, string> = {
  catch: 'onion', cors: 'onion',
  receive: 'linear', guard: 'linear', check: 'linear',
  process: 'linear', deliver: 'linear', trace: 'linear',
  static: 'linear', view: 'linear', identify: 'linear',
};

@Injectable()
export class TraceTransformService {
  private findMatchingEnd(raw: any[], startIdx: number): number {
    const nodeId = raw[startIdx].nodeId;
    let nesting = 0;
    for (let j = startIdx + 1; j < raw.length; j++) {
      if (raw[j].nodeId === nodeId) {
        if (raw[j].type === 'START') nesting++;
        else if (raw[j].type === 'END') {
          if (nesting === 0) return j;
          nesting--;
        }
      }
    }
    return -1;
  }

  buildTree(raw: any[]): TreeNode[] {
    const result: TreeNode[] = [];
    let depth = 0;
    const consumed = new Set<number>();

    for (let i = 0; i < raw.length; i++) {
      if (consumed.has(i)) continue;
      const e = raw[i];
      const slot = e.slotName || '';
      const composer = COMPOSERS[slot] || 'linear';

      if (e.type === 'START') {
        const endIdx = this.findMatchingEnd(raw, i);
        if (endIdx === i + 1) {
          const end = raw[endIdx];
          consumed.add(endIdx);
          const dur = end.duration != null ? `${end.duration.toFixed(2)}ms` : '';
          result.push({ depth, marker: 'dot', node: e.nodeId, slot, composer: '', duration: dur, badge: '', status: 'ok' });
        } else {
          result.push({ depth, marker: 'open', node: e.nodeId, slot, composer, duration: '', badge: '', status: 'start' });
          depth++;
        }
      } else if (e.type === 'END') {
        depth = Math.max(0, depth - 1);
        const dur = e.duration != null ? `${e.duration.toFixed(2)}ms` : '';
        result.push({ depth, marker: 'close', node: e.nodeId, slot: '', composer: '', duration: dur, badge: '', status: 'ok' });
      } else if (e.type === 'SKIP') {
        result.push({ depth, marker: 'dot', node: e.nodeId, slot, composer: '', duration: '', badge: 'SKIP', status: 'skip' });
      } else if (e.type === 'ERROR') {
        result.push({ depth, marker: 'dot', node: e.nodeId, slot, composer: '', duration: '', badge: e.reason || 'ERROR', status: 'error' });
      }
    }
    return result;
  }

  computeSummary(raw: any[]): string {
    const count = raw.filter((e: any) => e.type !== 'START').length;
    const ends = raw.filter((e: any) => e.type === 'END' && e.duration != null);
    const total = ends.reduce((s: number, e: any) => s + e.duration, 0);
    return `${count} nodes · ${total.toFixed(2)}ms`;
  }
}

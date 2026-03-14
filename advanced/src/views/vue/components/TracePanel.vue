<template>
  <div v-if="hasTrace" class="trace-panel card">
    <button class="trace-toggle" @click="open = !open">
      <span>📊 Pipeline Trace</span>
      <span class="trace-summary">{{ summary }}</span>
      <span class="trace-arrow">{{ open ? '▼' : '▶' }}</span>
    </button>
    <div v-if="open" class="trace-body">
      <div v-for="(n, i) in nodes" :key="i"
            class="tree-row" :class="'trace-' + n.status"
           :style="{ paddingLeft: (n.depth * 16 + 8) + 'px' }">
        <span class="marker" :class="'marker-' + n.marker">{{ MARKER_CHAR[n.marker] }}</span>
        <span class="node-name">{{ n.node }}</span>
        <span v-if="n.slot" class="slot-tag">{{ n.slot }}</span>
        <span v-if="n.composer" class="composer-badge" :class="'composer-' + n.composer">{{ n.composer }}</span>
        <span class="spacer" />
        <span v-if="n.duration" class="duration">{{ n.duration }}</span>
        <span v-if="n.badge" :class="'badge badge-' + n.status">{{ n.badge }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useViewCtx } from '../context';

const MARKER_CHAR: Record<string, string> = { open: '▶', close: '◀', dot: '·' };

const ctx = useViewCtx();
const open = ref(false);

const hasTrace = computed(() => ctx.traceTree.length > 0);
const nodes = computed(() => ctx.traceTree);
const summary = computed(() => ctx.traceSummary);
</script>

<style scoped>
.trace-panel { margin-top: 24px; overflow: hidden; }

.trace-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  text-align: left;
}
.trace-summary { color: var(--color-text-muted); font-weight: 400; margin-left: auto; }
.trace-arrow { font-size: 10px; color: var(--color-text-muted); }

.trace-body { padding: 0 16px 12px; }

.tree-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  font-size: 12px;
  font-family: var(--font-mono);
  line-height: 1.6;
}

.marker {
  flex-shrink: 0;
  width: 12px;
  text-align: center;
  font-size: 10px;
}
.marker-open { color: #3b82f6; }
.marker-close { color: #3b82f6; }
.marker-dot { color: var(--color-text-muted); }

.node-name { color: var(--color-text); white-space: nowrap; }
.trace-skip .node-name { color: var(--color-text-muted); }
.trace-error .node-name { color: var(--color-error); }
.trace-start .node-name { color: #3b82f6; font-weight: 600; }

.slot-tag {
  font-size: 10px;
  color: var(--color-text-muted);
  font-family: var(--font-sans);
}

.composer-badge {
  font-size: 9px;
  padding: 0 4px;
  border-radius: 3px;
  font-weight: 600;
  font-family: var(--font-mono);
  line-height: 1.5;
}
.composer-onion { background: #fef3c7; color: #92400e; }
.composer-linear { background: #e0f2fe; color: #075985; }

.spacer { flex: 1; }
.duration { color: var(--color-text-secondary); font-size: 11px; white-space: nowrap; }

.badge {
  display: inline-block;
  padding: 0 5px;
  border-radius: 3px;
  font-size: 10px;
  font-family: var(--font-sans);
  font-weight: 600;
  white-space: nowrap;
}
.badge-ok { background: #dcfce7; color: #166534; }
.badge-skip { background: #f1f5f9; color: #64748b; }
.badge-error { background: #fee2e2; color: #991b1b; }
</style>

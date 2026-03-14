<template>
  <div class="playground">
    <div class="page-top">
      <nav class="nav"><a href="/">← Home</a></nav>
    </div>
    <header class="hero">
      <h1>🧩 Kernel Playground</h1>
      <p class="subtitle">Runtime pipeline console · All changes take effect immediately</p>
    </header>

    <div class="playground-body">
    <aside class="sidebar">
      <ul class="guide">
        <li>Expand a route, disable <strong>Guard</strong> → skip authentication</li>
        <li>Disable <strong>Seed</strong> → route returns 404</li>
        <li>After toggling, observe status code changes on the right</li>
        <li>Click "Restore" or the reset button at the bottom to revert</li>
      </ul>

      <div class="sidebar-actions">
        <button class="reset-btn" @click="handleReset">↺ Reset All</button>
      </div>

      <div class="cli-hint">
        <code>hwy src/cli.ts</code><br>
        After bundling: <code>hwy dist/cli.js</code>
      </div>
    </aside>

    <div class="main-content">
    <div class="card-list">
      <div
        v-for="card in routes"
        :key="cardKey(card)"
        class="card route-card"
        :class="{ expanded: expandedSet.has(cardKey(card)) }"
      >
        <div class="route-header" @click="toggleExpand(card)">
          <span class="method-badge" :class="'method-' + card.method.toLowerCase()">{{ card.method }}</span>
          <span class="route-path">{{ card.pattern }}</span>
          <span class="expand-icon">{{ expandedSet.has(cardKey(card)) ? '▼' : '▶' }}</span>
        </div>

        <div v-if="expandedSet.has(cardKey(card))" class="route-body">
          <div class="section-label">Pipeline Nodes</div>
          <div class="node-list">
            <div
              v-for="node in card.nodes"
              :key="node.tokenId + node.label"
              class="node-row"
              :class="'node-' + node.kind"
            >
              <span class="node-kind">{{ node.kind === 'seed' ? 'SEED' : 'GUARD' }}</span>
              <span class="node-label">{{ node.label }}</span>
              <span v-if="node.excluded || node.self" class="node-excluded">{{ node.excluded ? '(excluded)' : '(self)' }}</span>
              <template v-else>
                <span class="node-hint">{{ node.kind === 'seed' ? '→ 404' : '→ skip' }}</span>
                <label class="toggle-switch" @click.stop>
                  <input type="checkbox" checked @change="handleToggle(card, node, ($event.target as HTMLInputElement).checked)">
                  <span class="toggle-slider"></span>
                </label>
              </template>
            </div>
            <div v-if="card.nodes.length === 0" class="node-empty">No controllable nodes</div>
          </div>

          <div v-if="tryResults[cardKey(card)]" class="result-section">
            <div class="section-label">Response</div>
            <div class="result-status">
              <span class="status-badge" :class="tryResults[cardKey(card)].status < 400 ? 'status-ok' : 'status-err'">
                {{ tryResults[cardKey(card)].status }} {{ tryResults[cardKey(card)].statusText }}
              </span>
            </div>
            <pre v-if="tryResults[cardKey(card)].body" class="result-body">{{ tryResults[cardKey(card)].body }}</pre>
          </div>
          <div v-else-if="loading[cardKey(card)]" class="result-section">
            <div class="section-label">Response</div>
            <div class="result-loading">Loading…</div>
          </div>

          <div v-if="traceLines[cardKey(card)]?.length" class="result-section">
            <div class="section-label">Trace</div>
            <div class="trace-tree">
              <div
                v-for="(line, i) in traceLines[cardKey(card)]"
                :key="i"
                class="trace-tree-line"
                :style="{ paddingLeft: line.depth * 14 + 'px' }"
              >
                <span class="trace-tree-kind" :class="'trace-kind-' + line.kind">{{ line.kind }}</span>
                <span class="trace-tree-label">{{ line.label }}</span>
                <span v-if="line.attrs?.length" class="trace-tree-attrs">
                  {{ line.attrs.map((a: any) => a.value).join(' · ') }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="card.removed.length" class="removed-section">
            <div class="section-label">Removed</div>
            <div
              v-for="node in card.removed"
              :key="node.tokenId + node.label"
              class="removed-row"
            >
              <span class="removed-label">{{ node.label }}</span>
              <button class="restore-btn" @click="handleToggle(card, node, true)">Restore</button>
            </div>
          </div>

          <div v-if="card.verifyLinks.length" class="page-links">
            <a v-for="link in card.verifyLinks" :key="link.href" :href="link.href" class="verify-link">
              {{ link.label }} →
            </a>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useViewCtx } from '../context';
import type { RouteCard, RouteNode } from '../../../types/playground.types';

interface TryResult { status: number; statusText: string; body?: string }

const ctx = useViewCtx();

const routes = ref<RouteCard[]>(ctx.data?.routes || []);
const expandedSet = reactive(new Set<string>());
const tryResults = reactive<Record<string, TryResult>>({});
const traceLines = reactive<Record<string, any[]>>({});
const loading = reactive<Record<string, boolean>>({});

function cardKey(card: RouteCard) { return `${card.method} ${card.pattern}`; }

async function loadRoutes(): Promise<RouteCard[]> {
  const data = await ctx.dispatch('_playground');
  return data.routes || [];
}

async function fetchTry(key: string, card: RouteCard) {
  loading[key] = true;
  delete traceLines[key];
  try {
    const { path, method } = card.tryEndpoint;
    const result = await ctx.dispatch(path || '/', { method });
    const isError = result?._isError;
    const status = isError ? result.status : 200;
    const statusText = isError ? result.error : 'OK';
    const body = JSON.stringify(isError ? (() => { const { _isError, ...rest } = result; return rest; })() : result, null, 2);
    tryResults[key] = { status, statusText, body };

    // Fetch trace for this request
    const trace = await ctx.dispatch('_playground/trace', {
      query: { method: card.tryEndpoint.method, path: card.tryEndpoint.path || '/' },
    });
    if (Array.isArray(trace) && trace.length) {
      traceLines[key] = trace;
    }
  } catch {
    tryResults[key] = { status: 0, statusText: 'Fetch Error' };
  } finally {
    loading[key] = false;
  }
}

async function refreshExpanded(newRoutes: RouteCard[]) {
  routes.value = newRoutes;
  for (const key of expandedSet) {
    const card = newRoutes.find(c => cardKey(c) === key);
    if (card) fetchTry(key, card);
  }
}

onMounted(async () => {
  if (!ctx.data?.routes?.length) {
    try { routes.value = await loadRoutes(); } catch {}
  }
  if (routes.value.length > 0) toggleExpand(routes.value[0]);
});

function toggleExpand(card: RouteCard) {
  const key = cardKey(card);
  if (expandedSet.has(key)) {
    expandedSet.delete(key);
    delete tryResults[key];
    delete traceLines[key];
  } else {
    expandedSet.add(key);
    fetchTry(key, card);
  }
}

async function handleToggle(card: RouteCard, node: RouteNode, enabled: boolean) {
  if (!enabled && node.self) return;
  await ctx.dispatch('_playground', {
    method: 'POST',
    body: { method: card.method, path: card.pattern, kind: node.kind, enabled },
  });
  await refreshExpanded(await loadRoutes());
}

async function handleReset() {
  await ctx.dispatch('_playground', { method: 'POST', body: { action: 'reset' } });
  await refreshExpanded(await loadRoutes());
}
</script>

<style scoped>
.page-top { display: flex; justify-content: space-between; align-items: center; }
.page-top .nav { margin-bottom: 0; }
.hero { margin-bottom: 20px; }
.hero h1 { margin-bottom: 4px; }
.subtitle { color: var(--color-text-muted); font-size: 13px; }

.playground-body { display: flex; gap: 24px; align-items: flex-start; }
.sidebar { width: 260px; flex-shrink: 0; position: sticky; top: 24px; }
.main-content { flex: 1; min-width: 0; }

.guide { list-style: none; padding: 0; margin: 0 0 12px; font-size: 12px; color: var(--color-text-secondary); line-height: 1.6; }
.guide li { padding: 3px 0; }
.guide li::before { content: '·'; margin-right: 6px; color: var(--color-text-muted); }
.guide strong { color: var(--color-text); font-weight: 600; }

.sidebar-actions { margin-top: 12px; text-align: center; }
.cli-hint { margin-top: 12px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.6; }

.card-list { display: flex; flex-direction: column; gap: 8px; }
.route-card { overflow: hidden; transition: box-shadow 0.2s; }
.route-card.expanded { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.route-card:not(.expanded):hover { border-color: #94a3b8; }

.route-header { display: flex; align-items: center; gap: 8px; padding: 10px 14px; cursor: pointer; user-select: none; }
.route-path { font-family: var(--font-mono); font-size: 13px; color: #475569; flex: 1; }
.expand-icon { font-size: 10px; color: #94a3b8; }

.route-body { padding: 0 14px 14px; }
.section-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; margin: 12px 0 6px; }

.node-list { display: flex; flex-direction: column; gap: 4px; }
.node-row { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 6px; font-size: 13px; }
.node-instruction { background: #f0fdf4; }
.node-seed { background: #f0f9ff; }
.node-kind { font-size: 10px; font-weight: 700; color: #64748b; min-width: 40px; }
.node-label { flex: 1; }
.node-excluded { color: #94a3b8; font-style: italic; font-size: 12px; }
.node-hint { color: #94a3b8; font-size: 11px; margin-right: 4px; }
.node-empty { color: #94a3b8; font-size: 13px; font-style: italic; padding: 6px 0; }

.toggle-switch { position: relative; display: inline-block; width: 36px; height: 20px; cursor: pointer; flex-shrink: 0; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; background: #e2e8f0; border-radius: 20px; transition: background 0.2s; }
.toggle-slider::before { content: ''; position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: transform 0.2s; }
.toggle-switch input:checked + .toggle-slider { background: #22c55e; }
.toggle-switch input:checked + .toggle-slider::before { transform: translateX(16px); }

.result-section { margin-top: 4px; }
.result-status { margin-bottom: 6px; }
.status-badge { font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }
.status-ok { background: #f0fdf4; color: #16a34a; }
.status-err { background: #fef2f2; color: #dc2626; }
.result-loading { color: #94a3b8; font-size: 13px; }
.result-body { font-family: var(--font-mono); font-size: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; margin: 6px 0 0; white-space: pre-wrap; word-break: break-all; max-height: 200px; overflow: auto; color: #334155; }

.trace-tree { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; margin-top: 4px; }
.trace-tree-line { display: flex; align-items: center; gap: 6px; font-size: 12px; line-height: 1.8; }
.trace-tree-kind { font-size: 10px; font-weight: 700; min-width: 52px; text-transform: uppercase; }
.trace-kind-guard { color: #d97706; }
.trace-kind-seed { color: #2563eb; }
.trace-kind-trace-entry { color: #7c3aed; }
.trace-kind-header { color: #64748b; font-weight: 600; }
.trace-tree-label { color: #334155; }
.trace-tree-attrs { color: #94a3b8; font-size: 11px; }

.removed-section { margin-top: 8px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 8px 10px; }
.removed-row { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 3px 0; }
.removed-label { flex: 1; color: #64748b; text-decoration: line-through; }
.restore-btn { font-size: 11px; color: #3b82f6; background: none; border: none; cursor: pointer; padding: 2px 6px; }
.restore-btn:hover { text-decoration: underline; }

.page-links { margin-top: 8px; display: flex; gap: 12px; }
.verify-link { font-size: 13px; color: var(--color-link); text-decoration: none; }
.verify-link:hover { text-decoration: underline; }

.reset-btn { font-size: 12px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px 14px; cursor: pointer; transition: background 0.15s; width: 100%; }
.reset-btn:hover { background: #f1f5f9; }
</style>

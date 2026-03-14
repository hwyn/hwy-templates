<template>
    <header class="hero">
      <h1>Kernel</h1>
      <p class="subtitle">One codebase · Multi-platform · Zero platform dependency</p>
    </header>

    <section class="demo">
      <h2>Same request, multiple outputs</h2>
      <p class="desc">Below shows the same route /notes/1 with real results across different platforms — business code is identical. Server / Browser / CLI are just three built-in protocols, extensible to any platform:</p>

      <div class="demo-panels">
        <DemoPanel icon="⚡" title="API" cmd="curl /notes/1?api_key=…" body-class="panel-code">
          <pre v-if="jsonResult">{{ jsonResult }}</pre>
          <div v-else class="panel-loading">{{ jsonError || 'Loading…' }}</div>
        </DemoPanel>

        <DemoPanel icon="🌐" title="Browser" cmd="SSR Render" body-class="panel-iframe-wrap">
          <iframe :src="iframeSrc" class="panel-iframe" sandbox="allow-same-origin allow-scripts" loading="lazy"></iframe>
        </DemoPanel>

        <DemoPanel icon="💻" title="CLI" cmd="hwy src/cli.ts">
          <TerminalDemo />
        </DemoPanel>
      </div>

      <p class="demo-note">All platforms use the same Seed: NotesPipeline.detail — protocol differences handled transparently by the pipeline, extensible to WebSocket, gRPC and any protocol</p>
    </section>

    <section class="features">
      <div class="card feature-card">
        <h3>🎯 Token Abstraction</h3>
        <p>Business code depends only on abstract Tokens, not platform APIs. Same Service — file storage on server, local storage on client — auto-matched at build time.</p>
      </div>
      <div class="card feature-card">
        <h3>📡 Protocol Sharding</h3>
        <p>Same Seed, different protocols auto-adapted. Currently showing HTTP / SSR / CLI, same pattern extends to WebSocket, gRPC and any protocol.</p>
      </div>
      <div class="card feature-card">
        <h3>🔬 Fractal Architecture</h3>
        <p>Kernels nest infinitely, each layer self-similar and physically isolated. Bridged via Gateway, independently compiled with separate lifecycles.</p>
      </div>
    </section>

    <section class="fractal">
      <h2>Kernel Structure of This Project</h2>
      <FractalDiagram />
    </section>

    <section class="explore">
      <h2>Explore</h2>
      <div class="explore-grid">
        <a :href="link('/notes')" class="card explore-card">
          <h3>📒 Notes</h3>
          <p>Experience 401 auth flow — follow hints to unlock</p>
        </a>
        <a :href="link('/not-exist')" class="card explore-card">
          <h3>🚫 404</h3>
          <p>Experience 404 routing — see diagnostic suggestions</p>
        </a>
        <a :href="link('/_debug')" class="card explore-card">
          <h3>🛠 Inspector</h3>
          <p>Cross-Kernel pipeline topology · Route matching diagnostics</p>
        </a>
        <a :href="link('/_playground')" class="card explore-card">
          <h3>🧩 Playground</h3>
          <p>Runtime pipeline toggle · Takes effect immediately</p>
        </a>
      </div>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TerminalDemo from '../components/TerminalDemo.vue';
import DemoPanel from '../components/DemoPanel.vue';
import FractalDiagram from '../components/FractalDiagram.vue';
import { useViewCtx } from '../context';

const { link } = useViewCtx();

const jsonResult = ref('');
const jsonError = ref('');
const DEMO_KEY = 'kernel-demo';
const iframeSrc = `/notes/1?api_key=${DEMO_KEY}`;

onMounted(async () => {
  try {
    const res = await fetch(`/notes/1?api_key=${DEMO_KEY}`, { headers: { Accept: 'application/json' } });
    const data = await res.json();
    jsonResult.value = JSON.stringify(data, null, 2);
  } catch {
    jsonError.value = 'Request failed';
  }

});
</script>

<style scoped>
.hero { margin-bottom: 32px; padding-top: 8px; }
.hero h1 { font-size: 28px; letter-spacing: -0.5px; }

section { margin-bottom: 32px; }
section h2 { font-size: 17px; margin-bottom: 12px; }

.demo h2 { margin-bottom: 4px; }

.demo-panels { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

:deep(.panel-code) { padding: 10px 12px; }
:deep(.panel-code) pre { margin: 0; font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; background: transparent; padding: 0; }
:deep(.panel-loading) { color: var(--color-text-muted); font-size: 13px; padding: 10px; }

:deep(.panel-iframe-wrap) { padding: 0; position: relative; overflow: hidden; }
:deep(.panel-iframe) { position: absolute; top: 0; left: 0; width: 200%; height: 200%; border: none; transform: scale(0.5); transform-origin: top left; }

.demo-note { font-size: 12px; color: var(--color-text-muted); margin-top: 8px; text-align: center; }

.features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.feature-card { padding: 16px; }
.feature-card h3 { font-size: 14px; margin-bottom: 6px; }
.feature-card p { font-size: 13px; color: var(--color-text-secondary); line-height: 1.6; }

.explore-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.explore-card { display: block; padding: 16px; text-decoration: none; transition: border-color 0.15s, box-shadow 0.15s; }
.explore-card:hover { text-decoration: none; }
.explore-card h3 { font-size: 14px; color: var(--color-text); margin-bottom: 4px; }
.explore-card p { font-size: 12px; color: var(--color-text-secondary); line-height: 1.5; }

@media (max-width: 640px) {
  .demo-panels, .features, .explore-grid { grid-template-columns: 1fr; }
}


</style>

<template>
    <div class="card card-body debug-card">
      <h3>🔗 Cross-Kernel Graph</h3>
      <pre>{{ ctx.data.graph }}</pre>
    </div>

    <div class="card card-body debug-card">
      <h3>📐 Unified Topology</h3>
      <pre>{{ ctx.data.unifiedTopology }}</pre>
    </div>

    <div class="card card-body debug-card">
      <template v-if="ctx.data?.routeLookupText">
        <h3>🔍 Route Lookup: <code>{{ ctx.query?.route }}</code></h3>
        <pre>{{ ctx.data.routeLookupText }}</pre>
      </template>
      <template v-else>
        <h3>🔍 Route Lookup</h3>
        <p>
          Append <code>?route=notes</code> to inspect a specific route.
          <a :href="link('/_debug', { route: 'notes' })">Try it →</a>
        </p>
      </template>
    </div>
</template>

<script setup lang="ts">
import { useViewCtx } from '../context';

const ctx = useViewCtx();
const { link } = ctx;
</script>

<style scoped>
.debug-card { margin-bottom: 16px; }
.debug-card h3 { font-size: 15px; margin: 0 0 10px; }
.debug-card p { font-size: 13px; color: var(--color-text-secondary); }
</style>


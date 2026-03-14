<template>
  <div class="page error-page">
    <h1>{{ ctx.data?._isError ? ctx.data.status : 404 }}</h1>
    <p>{{ ctx.data?.error || 'Page not found' }}</p>

    <div v-if="ctx.data?.status === 401" class="hint">
      <p>This route requires authentication. You can:</p>
      <ul>
        <li>Add <a :href="link(basePath, { api_key: 'kernel-demo' })">?api_key=kernel-demo</a> to the URL</li>
        <li>Disable <strong>AuthGuard</strong> in <a :href="link('/_playground')">Playground</a>, all routes become public</li>
      </ul>
    </div>

    <div v-else-if="!ctx.data?.status || ctx.data?.status === 404" class="hint">
      <p>This route did not match any Seed. You can:</p>
      <ul>
        <li>Check <a :href="link('/_debug')">Inspector</a> to inspect pipeline topology and route matching</li>
        <li>View currently enabled route nodes in <a :href="link('/_playground')">Playground</a></li>
      </ul>
    </div>

    <a :href="link('/')">← Back to Home</a>
  </div>
</template>

<script setup lang="ts">
import { useViewCtx } from '../context';

const ctx = useViewCtx();
const { link } = ctx;

const p = ctx.data?._requestPath || ctx.path || '';
const basePath = p.startsWith('/') ? p : '/' + p;
</script>

<style scoped>
.error-page { text-align: center; padding: 80px 20px; position: relative; }
.error-page h1 { font-size: 72px; margin: 0 0 8px; color: var(--color-text-secondary); }
.error-page p { font-size: 18px; color: var(--color-text-secondary); margin: 0 0 24px; }
.error-page a { color: var(--color-link); font-size: 14px; }
.hint { text-align: left; max-width: 480px; margin: 0 auto 24px; background: var(--color-bg-secondary, #f8fafc); border-radius: 8px; padding: 16px 20px; }
.hint p { font-size: 14px; margin: 0 0 8px; }
.hint ul { margin: 0; padding-left: 20px; }
.hint li { font-size: 14px; line-height: 1.8; color: var(--color-text-secondary); }
.hint a { color: var(--color-link); text-decoration: none; }
.hint a:hover { text-decoration: underline; }
.hint strong { color: var(--color-text); font-weight: 600; }
</style>

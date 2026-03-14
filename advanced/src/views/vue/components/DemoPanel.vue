<template>
  <div class="card demo-panel">
    <div class="panel-header">
      <span class="panel-icon">{{ icon }}</span>
      <span class="panel-title">{{ title }}</span>
      <code class="panel-cmd">{{ cmd }}</code>
    </div>
    <div class="panel-body" :class="bodyClass">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  cmd: string;
  bodyClass?: string;
}>();
</script>

<style scoped>
.demo-panel { overflow: hidden; display: flex; flex-direction: column; }
.panel-header { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-bottom: 1px solid var(--color-border); background: var(--color-code-bg); }
.panel-icon { font-size: 14px; }
.panel-title { font-weight: 600; font-size: 13px; }
.panel-cmd { margin-left: auto; font-size: 11px; background: transparent; padding: 0; color: var(--color-text-muted); }
.panel-body { flex: 1; min-height: 311px; }
</style>

<template>
  <div v-if="errors.length" class="error-alert">
    <div v-for="(err, i) in errors" :key="i" class="error-item">
      <strong>{{ err.api }}</strong> — {{ err.status }}: {{ err.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ errors: { api: string; status: number; message: string }[] }>();
</script>

<style scoped>
.error-alert { background: var(--color-card); border: 1px solid var(--color-error); border-radius: 8px; padding: 10px 14px; margin-bottom: 16px; }
.error-item { color: var(--color-error); font-size: 13px; padding: 2px 0; }
.error-item strong { font-family: var(--font-mono); font-size: 12px; }
</style>

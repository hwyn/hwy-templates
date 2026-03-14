<template>
  <div class="page">
    <div class="page-top">
      <nav v-if="ctx.meta.backLinks?.length" class="nav">
        <a v-for="bl in ctx.meta.backLinks" :key="bl.href" :href="link(bl.href)">← {{ bl.label }}</a>
      </nav>
      <nav v-else-if="ctx.meta.backLink" class="nav">
        <a :href="link(ctx.meta.backLink)">← Home</a>
      </nav>
      <div v-else></div>
    </div>
    <h1 v-if="ctx.meta.title">{{ ctx.meta.title }}</h1>
    <slot />
    <TracePanel />
  </div>
</template>

<script setup lang="ts">
import { useViewCtx } from '../context';
import TracePanel from './TracePanel.vue';

const ctx = useViewCtx();
const { link } = ctx;
</script>

<style scoped>
.page-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.page-top .nav { margin-bottom: 0; }
.page > h1 { margin-bottom: 16px; }
</style>


<template>
    <div class="card card-body">
      <p class="note-content">{{ ctx.data.content }}</p>
      <p class="meta">Created: {{ ctx.data.createdAt }}</p>
    </div>
</template>

<script setup lang="ts">
import { useViewCtx } from '../context';

const ctx = useViewCtx();
</script>

<style scoped>
.note-content { margin: 0 0 12px; line-height: 1.6; }
</style>


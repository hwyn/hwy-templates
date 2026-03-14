<template>
    <ErrorAlert :errors="errors" />

    <ul class="note-list">
      <li v-for="item in ctx.data" :key="item.id" class="card note-item">
        <a :href="link(`/notes/${item.id}`)">
          <strong>{{ item.title }}</strong>
        </a>
        <span class="note-content">{{ item.content }}</span>
      </li>
    </ul>

    <div class="create-form">
      <h3>Create Note</h3>
      <form method="POST" :action="link('/notes')" @submit.prevent="handleCreate">
        <input name="title" placeholder="Title" required />
        <input name="content" placeholder="Content" required />
        <button type="submit">Create</button>
      </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useViewCtx } from '../context';
import ErrorAlert from '../components/ErrorAlert.vue';

interface AppError { api: string; status: number; message: string }

const ctx = useViewCtx();
const { link } = ctx;
const errors = ref<AppError[]>([]);

async function handleCreate(e: Event) {
  const form = e.target as HTMLFormElement;
  const data = Object.fromEntries(new FormData(form));
  const result = await ctx.dispatch('notes', { method: 'POST', body: data });
  if (result?._isError) {
    errors.value.push({ api: 'POST /notes', status: result.status, message: result.error || 'Unknown error' });
    return;
  }
  form.reset();
  window.dispatchEvent(new PopStateEvent('popstate'));
}
</script>

<style scoped>
.note-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.note-item { padding: 12px 16px; }
.note-item a { color: var(--color-link); text-decoration: none; }
.note-item a:hover { text-decoration: underline; }
.note-content { color: var(--color-text-secondary); margin-left: 8px; }
.create-form { margin-top: 24px; }
.create-form h3 { font-size: 15px; margin: 0 0 10px; }
.create-form form { display: flex; gap: 8px; }
</style>


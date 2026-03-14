<template>
  <div class="terminal">
    <pre><span class="term-prompt">$</span> <span class="term-typing" v-if="step >= 0">{{ cmd }}</span>
<template v-if="step >= 1"><span class="term-dim">{{ help }}</span>
</template><template v-if="step >= 2"><span class="term-prompt">hwy&gt;</span> <span class="term-typing">{{ repl }}</span>
</template><template v-if="step >= 3">{{ output }}
<span class="term-prompt">hwy&gt;</span> <span class="term-cursor">█</span></template></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useViewCtx } from '../context';

const props = withDefaults(defineProps<{
  command?: string;
  helpText?: string;
  replCommand?: string;
  dispatchPath?: string;
  startDelay?: number;
}>(), {
  command: 'hwy src/cli.ts',
  helpText: `
🧩 App Routes
    notes --api_key kernel-demo   🔒 Note list
    notes/1                       Note detail
    _debug                        Pipeline topology`,
  replCommand: 'notes/1 --api_key kernel-demo',
  dispatchPath: 'notes/1',
  startDelay: 300,
});

const ctx = useViewCtx();
const step = ref(-1);
const cmd = ref('');
const help = ref('');
const repl = ref('');
const output = ref('');
const timers: number[] = [];

function typeText(target: typeof cmd, text: string, speed: number): Promise<void> {
  return new Promise(resolve => {
    let i = 0;
    const tick = () => {
      if (i <= text.length) {
        target.value = text.slice(0, i++);
        timers.push(window.setTimeout(tick, speed) as unknown as number);
      } else {
        resolve();
      }
    };
    tick();
  });
}

function delay(ms: number): Promise<void> {
  return new Promise(r => { timers.push(window.setTimeout(r, ms) as unknown as number); });
}

async function runAnimation() {
  step.value = 0;
  await typeText(cmd, props.command, 40);
  await delay(600);

  step.value = 1;
  help.value = props.helpText;
  await delay(800);

  step.value = 2;
  await typeText(repl, props.replCommand, 35);
  await delay(400);

  step.value = 3;

  try {
    const note = await ctx.dispatch(props.dispatchPath);
    output.value = formatCli(note);
  } catch {
    output.value = '📝 Note #1\n   Title:   Welcome to Kernel\n   Content: A microkernel architecture for TypeScript applications';
  }
}

function formatCli(note: any): string {
  if (note?._isError) return `❌ ${note.error || 'Error'}`;
  if (!note) return '(empty)';
  const lines: string[] = [];
  lines.push(`📝 Note #${note.id}`);
  lines.push(`   Title:   ${note.title}`);
  lines.push(`   Content: ${note.content}`);
  return lines.join('\n');
}

onMounted(async () => {
  await delay(props.startDelay);
  runAnimation();
});

onBeforeUnmount(() => {
  for (const t of timers) clearTimeout(t);
});
</script>

<style scoped>
.terminal { padding: 10px 12px; background: #1e293b; color: #e2e8f0; min-height: 100%; box-sizing: border-box; }
.terminal pre { margin: 0; font-size: 12px; line-height: 1.6; white-space: pre-wrap; background: transparent; padding: 0; color: #e2e8f0; }
.term-dim { color: #64748b; }
.term-prompt { color: #86efac; }
.term-typing { color: #e2e8f0; }
.term-cursor { animation: blink 1s step-end infinite; color: #e2e8f0; }
@keyframes blink { 50% { opacity: 0; } }
</style>

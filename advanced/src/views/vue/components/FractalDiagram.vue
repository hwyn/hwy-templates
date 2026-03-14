<template>
  <div class="card fractal-diagram">
    <div class="fractal-node">
      <div class="fractal-label">
        <span class="fractal-icon">⚙️</span>
        <strong>PlatformKernel</strong>
      </div>
      <span class="fractal-desc">Protocol adapter — CORS, request parsing, error catching, response delivery</span>
      <div class="fractal-children">
        <div class="fractal-node">
          <div class="fractal-label">
            <span class="fractal-icon">📦</span>
            <strong>BusinessKernel</strong>
            <span class="fractal-bridge">via BusinessBridge</span>
          </div>
          <span class="fractal-desc">Business logic — auth guard, route dispatch, data processing</span>
        </div>
        <div class="fractal-node">
          <div class="fractal-label">
            <span class="fractal-icon">🎨</span>
            <strong>ViewKernel</strong>
            <span class="fractal-bridge">via ViewBridge</span>
          </div>
          <span class="fractal-desc">View rendering — Vue SSR/CSR, page routing, component mounting</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fractal-diagram { padding: 20px 24px; }
.fractal-node { position: relative; }
.fractal-label { display: flex; align-items: center; gap: 8px; font-size: 14px; line-height: 1.8; }
.fractal-icon { font-size: 15px; flex-shrink: 0; }
.fractal-desc { display: block; font-size: 12px; color: var(--color-text-muted); line-height: 1.5; padding-left: 25px; }
.fractal-bridge { font-size: 11px; color: var(--color-accent, #3b82f6); font-family: var(--font-mono); margin-left: 6px; opacity: 0.7; }
.fractal-children { margin-left: 12px; padding-left: 20px; margin-top: 6px; display: flex; flex-direction: column; gap: 6px; padding-top: 2px; padding-bottom: 2px; }
</style>

import { type RuleContext, type RuleEntry, defineRuleStrategy } from '@hwy-fm/cli/webpack';
import type { RuleSetUseItem } from 'webpack';
import { VueLoaderPlugin } from 'vue-loader';

defineRuleStrategy((context: RuleContext, entries: RuleEntry[]) => {
  const { platform } = context.buildConfig;

  if (platform === 'dll') return null as any;

  for (const entry of entries) {
    const use = entry.rule.use as RuleSetUseItem[];
    if (!Array.isArray(use)) continue;

    for (const item of use) {
      if (typeof item !== 'object' || !('loader' in item) || item.loader !== 'css-loader') continue;
      const modules = (item.options as any)?.modules;
      if (!modules || typeof modules.mode !== 'function') continue;

      const originalMode = modules.mode;
      modules.mode = (resourcePath: string) => {
        if (/\.vue/i.test(resourcePath)) return 'global';
        return originalMode(resourcePath);
      };
    }
  }

  return {
    rules: { test: /\.vue$/, loader: 'vue-loader' },
    plugins: [new VueLoaderPlugin() as any],
  };
});

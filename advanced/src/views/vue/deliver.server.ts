import '../kernel/view.app';
import './registry';

import { createSSRApp, h, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';

import { ViewKernel } from '../kernel/view.model';
import { TraceTransformService } from '../shared/trace-transform.service';
import type { ViewContext } from '../../types/view.types';
import { VIEW_CTX_KEY, createViewCtx, updateViewCtx, buildViewCtxUpdate } from './context';

@ViewKernel.Deliver.instruction()
export class ViewRender {
  constructor(private traceService: TraceTransformService) { }

  async execute(ctx: ViewContext) {
    const view = ctx.result;
    if (!view || typeof view === 'string' || !view.component) return;

    const layout = view.layout as Component;
    const props = view.props || {};
    const root = layout
      ? { render: () => h(layout, null, { default: () => h(view.component as Component, props) }) }
      : view.component as Component;
    const rootProps = layout ? {} : props;

    const viewCtx = createViewCtx();
    updateViewCtx(viewCtx, buildViewCtxUpdate(this.traceService, ctx));

    const app = createSSRApp(root, rootProps);
    app.provide(VIEW_CTX_KEY, viewCtx);
    const html = await renderToString(app);
    const trace = ctx.input.trace || [];
    const payload: any = { data: ctx.input.data };
    if (trace.length) payload.trace = trace;
    const json = JSON.stringify(payload).replace(/</g, '\\u003c');
    ctx.result = html + `<script id="__SSR_DATA__" type="application/json">${json}</script>`;
  }
}

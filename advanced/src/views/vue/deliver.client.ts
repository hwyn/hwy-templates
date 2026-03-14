import '../kernel/view.app';
import './registry';

import { createApp, h, shallowRef, type App, type Component } from 'vue';

import { ViewKernel } from '../kernel/view.model';
import { TraceTransformService } from '../shared/trace-transform.service';
import { ClientDispatchService } from '../shared/client-dispatch';
import type { ViewContext } from '../../types/view.types';
import { VIEW_CTX_KEY, createViewCtx, updateViewCtx, setDispatch, buildViewCtxUpdate } from './context';

@ViewKernel.Deliver.instruction()
export class ViewRender {
  constructor(private traceService: TraceTransformService, private clientDispatch: ClientDispatchService) { }

  private viewCtx = createViewCtx();
  private dispatchReady = false;
  private currentPage = shallowRef<Component | null>(null);
  private currentLayout = shallowRef<Component | null>(null);
  private currentProps = shallowRef<Record<string, any>>({});
  private app: App | null = null;

  private ensureApp() {
    if (this.app) return;
    const container = document.querySelector('#app') || document.body;
    const page = this.currentPage;
    const layout = this.currentLayout;
    const props = this.currentProps;

    container.innerHTML = '';
    this.app = createApp({
      render: () => {
        if (!page.value) return null;
        const pageVNode = h(page.value, props.value);
        return layout.value ? h(layout.value, null, { default: () => pageVNode }) : pageVNode;
      }
    });
    this.app.provide(VIEW_CTX_KEY, this.viewCtx);
    this.app.mount(container);
  }

  execute(ctx: ViewContext) {
    const view = ctx.result;
    if (!view || typeof view === 'string' || !view.component) return;

    updateViewCtx(this.viewCtx, buildViewCtxUpdate(this.traceService, ctx));

    if (!this.dispatchReady) {
      this.dispatchReady = true;
      const viewCtx = this.viewCtx;
      setDispatch(viewCtx, (path, options) =>
        this.clientDispatch.dispatch(path, { ...options, apiKey: viewCtx.query.api_key || '' })
      );
    }

    this.ensureApp();
    this.currentProps.value = view.props || {};
    this.currentLayout.value = (view.layout || null) as Component | null;
    this.currentPage.value = view.component as Component;
  }
}

import { Injectable } from '@hwy-fm/di';
import type { ViewResult } from '../../types/view.types';

interface PageEntry {
  component: unknown;
  meta?: Record<string, any>;
  layout?: unknown;
}

const NOT_SET = Symbol();

@Injectable()
export class PageRegistry {
  private static _pages: Record<string, PageEntry> = {};
  private static _defaultLayout: unknown;
  private static _errorRoute: string | undefined;

  static register(route: string, component: unknown, meta?: Record<string, any>, layout: unknown = NOT_SET) {
    const entry: PageEntry = { component };
    if (meta) entry.meta = meta;
    if (layout !== NOT_SET) entry.layout = layout;
    PageRegistry._pages[route] = entry;
  }

  static error(route: string) {
    PageRegistry._errorRoute = route;
  }

  static layout(component: unknown) {
    PageRegistry._defaultLayout = component;
  }

  page(route: string, meta?: Record<string, any>): ViewResult {
    const entry = PageRegistry._pages[route];
    const layout = 'layout' in (entry || {}) ? entry?.layout : PageRegistry._defaultLayout;
    return { component: entry?.component, layout, props: {}, meta: meta || entry?.meta };
  }

  errorPage(): ViewResult {
    return this.page(PageRegistry._errorRoute!);
  }
}

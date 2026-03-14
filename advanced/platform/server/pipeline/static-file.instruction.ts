import { dirname, join, extname, resolve } from 'path';
import { statSync, createReadStream } from 'fs';
import { Kernel } from '@hwy-fm/kernel';
import type { HttpContext } from '../http-types';

export const Static = Kernel.egress('static', {
  anchors: { before: ['deliver'], after: ['process'] },
});

declare const __BUILD_ASSETS__: {
  client?: { files?: Record<string, string> };
  clientPath?: string;
} | undefined;

const MIME: Record<string, string> = {
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const HASHED_RE = /\.[a-f0-9]{6,12}\.\w+$/;

interface FileEntry {
  filePath: string;
  size: number;
  contentType: string;
  cacheControl: string;
}

@Static.instruction({ match: { method: 'GET' } })
export class StaticFileInstruction {
  private cache = new Map<string, FileEntry>();

  execute(ctx: HttpContext) {
    if (ctx.result != null && (!ctx.result._isError || ctx.result.status !== 404)) return;

    const urlPath = (ctx.metadata.path || '').split('?')[0];
    const entry = this.cache.get(urlPath);
    if (!entry) return;

    const { res } = ctx.input;
    res.writeHead(200, {
      'Content-Type': entry.contentType,
      'Content-Length': entry.size,
      'Cache-Control': entry.cacheControl,
    });
    createReadStream(entry.filePath).pipe(res);
    ctx.result = null;
  }

  onInit() {
    if (typeof __BUILD_ASSETS__ === 'undefined') return;

    const clientPath = __BUILD_ASSETS__?.clientPath;
    const files = __BUILD_ASSETS__?.client?.files;
    if (!clientPath || !files) return;

    const clientDir = resolve(dirname(process.argv[1]), clientPath);
    for (const urlPath of Object.keys(files)) {
      const filePath = join(clientDir, urlPath);
      try {
        const stat = statSync(filePath);
        if (!stat.isFile()) continue;
        this.cache.set(urlPath, {
          filePath,
          size: stat.size,
          contentType: MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
          cacheControl: HASHED_RE.test(urlPath)
            ? 'public, max-age=31536000, immutable'
            : 'public, max-age=0, must-revalidate',
        });
      } catch {
        // file missing on disk - skip
      }
    }
  }
}

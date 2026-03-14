import { Kernel } from '@hwy-fm/kernel';

import type { HttpContext } from '../http-types';

const MAX_BODY_SIZE = 1024 * 1024; // 1 MB

function collectRawBody(req: import('http').IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) {
        req.destroy();
        reject({ status: 413, message: `Payload too large (max ${MAX_BODY_SIZE} bytes)` });
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseUrlEncoded(raw: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (!raw) return result;
  const pairs = raw.split('&');
  for (let i = 0; i < pairs.length; i++) {
    const idx = pairs[i].indexOf('=');
    if (idx === -1) {
      result[decodeURIComponent(pairs[i])] = '';
    } else {
      result[decodeURIComponent(pairs[i].slice(0, idx))] = decodeURIComponent(pairs[i].slice(idx + 1));
    }
  }
  return result;
}

@Kernel.Receive.instruction({ match: { pattern: '**', method: 'PUT' } })
@Kernel.Receive.instruction({ match: { pattern: '**', method: 'POST' } })
export class BodyParserInstruction {
  async execute(ctx: HttpContext) {
    const req = ctx.input.req;
    const contentType = req.headers['content-type'] || '';
    const buf = await collectRawBody(req);

    if (buf.length === 0) {
      ctx.input.body = {};
      return;
    }

    const raw = buf.toString('utf-8');

    if (contentType.includes('application/json')) {
      try {
        ctx.input.body = JSON.parse(raw);
      } catch {
        ctx.input.body = {};
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      ctx.input.body = parseUrlEncoded(raw);
    } else {
      ctx.input.body = {};
    }
  }
}

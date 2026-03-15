import { Kernel } from '@hwy-fm/kernel';
import { HTTP_PROTOCOL } from '../protocol';
import type { HttpContext } from '../types';

const MAX_BODY_SIZE = 1024 * 1024; // 1 MB

function collectBody(req: import('http').IncomingMessage): Promise<Buffer> {
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

@Kernel.Receive.instruction({ match: { pattern: '**', method: 'PUT' }, protocol: HTTP_PROTOCOL })
@Kernel.Receive.instruction({ match: { pattern: '**', method: 'POST' }, protocol: HTTP_PROTOCOL })
export class BodyParserInstruction {
  async execute(ctx: HttpContext) {
    const req = ctx.input.req;
    const contentType = req.headers['content-type'] || '';
    const buf = await collectBody(req);

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
    } else {
      ctx.input.body = {};
    }
  }
}

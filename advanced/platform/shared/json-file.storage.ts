import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { Injectable } from '@hwy-fm/di';

declare const __BUILD_ASSETS__: { dataPath?: string } | undefined;

function resolveDataDir() {
  const dataPath = typeof __BUILD_ASSETS__ !== 'undefined' && __BUILD_ASSETS__?.dataPath || 'data';
  return join(process.cwd(), dataPath);
}

const DATA_DIR = resolveDataDir();

@Injectable()
export class JsonFileStorage {
  private readonly absolutePath = DATA_DIR;

  load<T>(key: string, defaults?: T): T {
    const filePath = join(this.absolutePath, `${key}.json`);
    if (existsSync(filePath)) {
      return JSON.parse(readFileSync(filePath, 'utf-8'));
    } else if (defaults !== undefined) {
      this.save(key, defaults);
      return defaults;
    }
    return undefined as T;
  }

  save<T>(key: string, data: T) {
    const filePath = join(this.absolutePath, `${key}.json`);
    const dir = dirname(filePath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

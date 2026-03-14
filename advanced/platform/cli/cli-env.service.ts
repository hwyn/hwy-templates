import { Injectable } from '@hwy-fm/di';

@Injectable()
export class CliEnvService {
  private env: Record<string, string> = {};

  get isEmpty(): boolean {
    return Object.keys(this.env).length === 0;
  }

  get(key: string): string {
    return this.env[key] || '';
  }

  set(key: string, value: string) {
    this.env[key] = value;
  }

  delete(key: string) {
    delete this.env[key];
  }

  all(): Record<string, string> {
    return { ...this.env };
  }
}

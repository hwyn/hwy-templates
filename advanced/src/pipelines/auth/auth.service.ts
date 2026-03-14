import { Injectable } from '@hwy-fm/di';

@Injectable()
export class AuthService {
  private readonly validKey = 'kernel-demo';

  validate(apiKey: string): void {
    if (apiKey !== this.validKey) {
      throw { status: 401, message: 'Unauthorized: invalid or missing credentials' };
    }
  }
}

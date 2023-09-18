import * as crypto from 'crypto';

export class StringUtils {
  static generateRandomString(length: number) {
    const buffer = crypto.randomBytes(length);
    return buffer.toString('hex');
  }
}

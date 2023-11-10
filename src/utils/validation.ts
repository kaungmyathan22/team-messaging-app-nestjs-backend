export class ValidationUtils {
  static isArrayOfNumbers(data: number[]) {
    return data.every((item) => typeof item === 'number');
  }
}

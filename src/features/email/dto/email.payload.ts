export class EmailPayload {
  to: string;
  subject: string;
  template: string;
  context: Record<string, string>;
}

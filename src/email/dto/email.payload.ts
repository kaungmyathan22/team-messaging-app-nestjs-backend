export class EmailPayload {
  from: string;
  to: string;
  subject: string;
  template: string;
  context: Record<string, string>;
}

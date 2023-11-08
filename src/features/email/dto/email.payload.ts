export class EmailPayload {
  to: string;
  subject: string;
  template: 'confirmation' | 'forgot-password' | 'welcome';
  context: Record<string, string>;
}

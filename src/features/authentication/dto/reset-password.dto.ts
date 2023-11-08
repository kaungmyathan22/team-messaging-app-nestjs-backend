import { IsString, IsStrongPassword } from 'class-validator';

export class ResetPasswordDTO {
  @IsString()
  token: string;
  @IsStrongPassword()
  newPassword: string;
}

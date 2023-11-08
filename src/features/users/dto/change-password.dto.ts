import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ChangePasswordDTO {
  @IsNotEmpty()
  oldPassword: string;
  @IsStrongPassword()
  newPassword: string;
}

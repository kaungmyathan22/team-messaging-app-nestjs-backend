import { IsNotEmpty, IsString } from 'class-validator';

export class TurnOnTwoFactorAuthenticationDto {
  @IsNotEmpty()
  @IsString()
  twoFactorAuthenticationCode: string;
}

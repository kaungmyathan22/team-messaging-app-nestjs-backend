import { PickType } from '@nestjs/mapped-types';
import { IsStrongPassword } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class ChangePasswordDTO extends PickType(CreateUserDto, ['password']) {
  @IsStrongPassword()
  newPassword: string;
}

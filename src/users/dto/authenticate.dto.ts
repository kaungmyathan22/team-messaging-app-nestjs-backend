import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class AuthenticateDTO extends PickType(CreateUserDto, [
  'email',
  'password',
]) {}

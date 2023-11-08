import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import JwtAuthenticationGuard from 'src/features/authentication/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('api/v1/users')
@UseGuards(JwtAuthenticationGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Patch('my-profile')
  updateMyProfile(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }
}

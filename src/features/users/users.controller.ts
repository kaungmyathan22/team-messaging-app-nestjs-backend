import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user';
import JwtAuthenticationGuard from 'src/features/authentication/guards/jwt.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('api/v1/users')
@UseGuards(JwtAuthenticationGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  getUsers() {
    return this.usersService.findAll();
  }

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

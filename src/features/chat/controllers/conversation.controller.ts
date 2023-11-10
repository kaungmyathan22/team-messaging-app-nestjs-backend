import JwtAuthenticationGuard from '@auth/guards/jwt.guard';
import {
  CreateGroupConversationPayload,
  CreateOneToOneConversationPayload,
} from '@chat/dto/conversation-dto/create-conversation.dto';
import { ConversationService } from '@chat/services/conversation.service';
import { CurrentUser } from '@common/decorators/current-user';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserEntity } from '@user/entities/user.entity';

@Controller('api/v1/chat/conversation')
@UseGuards(JwtAuthenticationGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}
  @Post('group')
  createGroupConversation(
    @CurrentUser() user: UserEntity,
    @Body() payload: CreateGroupConversationPayload,
  ) {
    return this.conversationService.createGroupConversation(user, payload);
  }
  @Post('one-to-one')
  createOneToOneConversation(
    @CurrentUser() user: UserEntity,
    @Body() payload: CreateOneToOneConversationPayload,
  ) {
    return this.conversationService.createOneToOneConversation(user, payload);
  }
  @Get()
  getConversation(@CurrentUser() user: UserEntity) {
    return this.conversationService.getConversations(user);
  }
}

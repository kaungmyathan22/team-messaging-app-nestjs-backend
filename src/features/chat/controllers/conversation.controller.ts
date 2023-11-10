import JwtAuthenticationGuard from '@auth/guards/jwt.guard';
import {
  CreateGroupConversationPayload,
  CreateOneToOneConversationPayload,
} from '@chat/dto/conversation-dto/create-conversation.dto';
import { SendMessagePayload } from '@chat/dto/message-dto/send-message.dto';
import { ConversationService } from '@chat/services/conversation.service';
import { MessageService } from '@chat/services/message.service';
import { CurrentUser } from '@common/decorators/current-user';
import { PaginationQueryParamsValidationPipe } from '@common/pipes/pagination-query-params-validation.pipe';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserEntity } from '@user/entities/user.entity';

@Controller('api/v1/chat/conversation')
@UseGuards(JwtAuthenticationGuard)
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}
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
  getConversation(
    @CurrentUser() user: UserEntity,
    @Query(PaginationQueryParamsValidationPipe) query,
  ) {
    return this.conversationService.getConversations(user, query);
  }

  @Post(':conversationId/message')
  sendMessage(
    @CurrentUser() user: UserEntity,
    @Body() payload: SendMessagePayload,
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    return this.messageService.sendMessage(conversationId, user, payload);
  }

  @Get(':conversationId/message')
  getMessage(
    @CurrentUser() user: UserEntity,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query(PaginationQueryParamsValidationPipe) query,
  ) {
    return this.messageService.getMessages(conversationId, user, query);
  }
}

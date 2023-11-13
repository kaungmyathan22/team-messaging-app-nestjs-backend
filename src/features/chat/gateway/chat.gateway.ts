import { TokenService } from '@auth/services/token.service';
import { UserJoinConversationDTO } from '@chat/dto/socket-dto/user-join-chatroom.dto';
import { MessageEntity } from '@chat/entities/message.entity';
import { EnvironmentConstants } from '@common/constants/environment.constants';
import { ConfigService } from '@nestjs/config';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UserEntity } from '@user/entities/user.entity';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}
  //#region life cycle method
  async handleConnection(client: any, ...args: any[]) {
    try {
      const token = client.handshake.headers.cookie
        .split(';')
        .find((cookie) =>
          cookie
            .trim()
            .startsWith(
              this.configService.get(EnvironmentConstants.COOKIE_JWT_KEY),
            ),
        )
        ?.split('=')[1];
      if (!token) {
        throw new Error('Invalid token');
      }
      const user = await this.tokenService.validateAccessToken(token);
      client.user = user;
      console.log('Client connected');
    } catch (error) {
      console.log(error);
      client.disconnect();
    }
  }

  handleDisconnect(client) {
    console.log('Gateway Disconnected:');
  }
  //#endregion

  @SubscribeMessage('ping')
  ping(client: Socket) {
    client.emit('pong', 'pong');
  }

  @SubscribeMessage('join:conversation')
  joinConversation(client: Socket, payload: UserJoinConversationDTO) {
    const roomName = `${payload.conversationId}`;
    client.join(roomName);
    console.log({ roomName });

    // client.to(roomName).emit(`user:join:conversation`, {
    //   message: `${user.email} has joined the chat room.`,
    // });
  }

  @SubscribeMessage('leave')
  leaveConversation(client: Socket, payload: UserJoinConversationDTO) {
    const user = (client as unknown as any).user as UserEntity;
    const roomName = `${payload.conversationId}`;
    client.broadcast.to(roomName).emit(`user:join:conversation`, {
      message: `${user.email} has left the chat room.`,
    });
    client.leave(roomName);
  }

  newMessageEvent(message: MessageEntity, conversationId: number) {
    const roomName = `${conversationId}`;
    this.server.to(roomName).emit('new_message', message);
  }
}

import { JwtWebSocketGuard } from '@auth/guards/jwt-websocket.guard';
import { UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway({ transports: ['websocket'] })
@UseGuards(JwtWebSocketGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  //#region life cycle method
  handleConnection(client: any, ...args: any[]) {
    console.log('Gateway Connected:', client.user);
  }

  handleDisconnect(client) {
    console.log('Gateway Disconnected:', client.user);
  }
  //#endregion

  @SubscribeMessage('join-conversation')
  joinConversation(client: any, payload: any): string {
    return 'Hello world!';
  }
}

import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MyGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    console.log(server);
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
    //Do stuffs
  }

  @SubscribeMessage('joinRoom')
  handleEvent(client: Socket, data: string): string {
    client.join(data);
    console.log(`Joined: ${data}`);
    return `Joined ${data}`;
  }

  async handleConnection(client: Socket, ...args: any[]) {
    console.log(`Connected: ${client.id}`);
    //Do stuffs
  }

  // @SubscribeMessage('sendMessage')
  // handleMessage(client: Socket, payload: any): void {
  //   this.server.to('myRoom').emit('message', payload);
  // }
  @SubscribeMessage('sendMessageToRoom')
  handleMessage(
    client: Socket,
    payload: { roomName: string; message: any },
  ): void {
    const { roomName, message } = payload;
    console.log(`message was emmited to ${roomName}`);
    this.server.to(roomName).emit('message', message);
  }
}

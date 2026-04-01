import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(private cs: ChatService) {}
  handleConnection(c: Socket) {}
  handleDisconnect(c: Socket) {}

  @SubscribeMessage('join_session')
  joinSession(@MessageBody() d: { sessionId: string }, @ConnectedSocket() c: Socket) {
    c.join('s:' + d.sessionId);
  }

  @SubscribeMessage('join_staff')
  joinStaff(@ConnectedSocket() c: Socket) {
    c.join('staff');
    c.emit('sessions_update', this.cs.getActive());
  }

  broadcastMessage(sid: string, msg: any) { this.server.to('s:' + sid).emit('new_message', msg); }
  notifyStaff(session: any) { this.server.to('staff').emit('new_waiting_session', session); }
  broadcastSession(session: any) {
    this.server.to('s:' + session.id).emit('session_updated', session);
    this.server.to('staff').emit('session_status_changed', session);
  }
  broadcastSessions() { this.server.to('staff').emit('sessions_update', this.cs.getActive()); }
}

import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { ChatGateway } from '../chat/chat.gateway';

@Controller('/api/line')
export class LineWebhookController {
  private readonly logger = new Logger(LineWebhookController.name);

  constructor(
    private chatService: ChatService,
    private chatGateway: ChatGateway,
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Body() body: { events?: any[] },
    @Headers('x-line-signature') sig: string,
  ) {
    // DEBUG: log full webhook body to find group ID
    this.logger.log(`LINE webhook signature: ${sig}`);
    this.logger.log(`LINE webhook body: ${JSON.stringify(body)}`);

    const events = body.events || [];

    for (const event of events) {
      if (event.type !== 'message' || event.message?.type !== 'text') continue;

      const text: string = event.message.text;

      // Format: #sessionId message content
      const match = text.match(/^#(\S+)\s+(.+)/s);
      if (!match) continue;

      const [, sessionId, content] = match;
      const session = this.chatService.getSession(sessionId);
      if (!session) {
        this.logger.warn(`Session not found: ${sessionId}`);
        continue;
      }

      // Auto-takeover if still waiting or AI
      if (session.status === 'ai' || session.status === 'waiting') {
        this.chatService.takeover(sessionId, 'line-staff', 'พนักงาน LINE');
        this.chatGateway.broadcastSession(this.chatService.getSession(sessionId));
      }

      const msg = this.chatService.addMessage(sessionId, 'staff', content.trim(), 'พนักงาน LINE');
      if (msg) {
        this.chatGateway.broadcastMessage(sessionId, msg);
        this.chatGateway.broadcastSessions();
      }
    }

    return { status: 'ok' };
  }
}

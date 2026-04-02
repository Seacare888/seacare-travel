import { Module, forwardRef } from '@nestjs/common';
import { LineService } from './line.service';
import { LineWebhookController } from './line.webhook.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [forwardRef(() => ChatModule)],
  controllers: [LineWebhookController],
  providers: [LineService],
  exports: [LineService],
})
export class LineModule {}

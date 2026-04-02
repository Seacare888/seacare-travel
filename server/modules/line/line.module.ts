import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LineService } from './line.service';
import { LineWebhookController } from './line.webhook.controller';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [ConfigModule, forwardRef(() => ChatModule)],
  controllers: [LineWebhookController],
  providers: [LineService],
  exports: [LineService],
})
export class LineModule {}

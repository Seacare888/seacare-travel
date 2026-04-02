import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { messagingApi } from '@line/bot-sdk';

@Injectable()
export class LineService {
  private readonly logger = new Logger(LineService.name);
  private client: messagingApi.MessagingApiClient | null = null;
  private groupId: string | null = null;

  constructor(private config: ConfigService) {
    const token = this.config.get<string>('LINE_CHANNEL_ACCESS_TOKEN');
    this.groupId = this.config.get<string>('LINE_GROUP_ID') || null;

    if (token) {
      this.client = new messagingApi.MessagingApiClient({ channelAccessToken: token });
      this.logger.log('LINE Messaging API client initialized');
    } else {
      this.logger.warn('LINE_CHANNEL_ACCESS_TOKEN not set — LINE notifications disabled');
    }
  }

  async pushMessage(text: string) {
    if (!this.client || !this.groupId) return;
    try {
      await this.client.pushMessage({
        to: this.groupId,
        messages: [{ type: 'text', text }],
      });
    } catch (e) {
      this.logger.error('LINE push failed', e);
    }
  }

  async notifyNewMessage(visitorName: string, content: string, sessionId: string) {
    const siteUrl = this.config.get<string>('SITE_URL') || 'https://seacare-travel.com';
    const text = [
      `💬 ข้อความใหม่จากลูกค้า`,
      `👤 ชื่อ: ${visitorName}`,
      `📝 ข้อความ: ${content}`,
      `🔗 ${siteUrl}/admin/chat`,
    ].join('\n');
    await this.pushMessage(text);
  }

  async notifyStaffRequest(visitorName: string, sessionId: string) {
    const siteUrl = this.config.get<string>('SITE_URL') || 'https://seacare-travel.com';
    const text = [
      `🚨 ลูกค้าต้องการคุยกับพนักงาน!`,
      `👤 ชื่อ: ${visitorName}`,
      `⏰ กรุณาตอบกลับโดยเร็ว`,
      `🔗 ${siteUrl}/admin/chat`,
    ].join('\n');
    await this.pushMessage(text);
  }
}

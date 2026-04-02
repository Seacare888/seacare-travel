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
    const siteUrl = this.config.get<string>('SITE_URL');

    this.logger.log(`LINE config — token: ${token ? 'SET (' + token.slice(0, 8) + '...)' : 'NOT SET'}`);
    this.logger.log(`LINE config — groupId: ${this.groupId || 'NOT SET'}`);
    this.logger.log(`LINE config — SITE_URL: ${siteUrl || 'NOT SET (fallback: https://www.seacare.life)'}`);

    if (token) {
      this.client = new messagingApi.MessagingApiClient({ channelAccessToken: token });
      this.logger.log('LINE Messaging API client initialized');

      // Send a test message on startup if both token and groupId are set
      if (this.groupId) {
        this.sendTestMessage();
      } else {
        this.logger.warn('LINE_GROUP_ID not set — push notifications disabled');
      }
    } else {
      this.logger.warn('LINE_CHANNEL_ACCESS_TOKEN not set — LINE notifications disabled');
    }
  }

  private async sendTestMessage() {
    try {
      await this.client!.pushMessage({
        to: this.groupId!,
        messages: [{ type: 'text', text: '✅ Seacare Travel เชื่อมต่อ LINE สำเร็จ!\nระบบแจ้งเตือนพร้อมใช้งาน' }],
      });
      this.logger.log('LINE test message sent successfully');
    } catch (e: any) {
      this.logger.error(`LINE test message failed: ${e.message || e}`);
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
    const siteUrl = this.config.get<string>('SITE_URL') || 'https://www.seacare.life';
    const text = [
      `💬 ข้อความใหม่จากลูกค้า`,
      `👤 ชื่อ: ${visitorName}`,
      `📝 ข้อความ: ${content}`,
      `🔗 ${siteUrl}/admin/chat`,
    ].join('\n');
    await this.pushMessage(text);
  }

  async notifyStaffRequest(visitorName: string, sessionId: string) {
    const siteUrl = this.config.get<string>('SITE_URL') || 'https://www.seacare.life';
    const text = [
      `🚨 ลูกค้าต้องการคุยกับพนักงาน!`,
      `👤 ชื่อ: ${visitorName}`,
      `⏰ กรุณาตอบกลับโดยเร็ว`,
      `🔗 ${siteUrl}/admin/chat`,
    ].join('\n');
    await this.pushMessage(text);
  }
}

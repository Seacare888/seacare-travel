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

    this.logger.log(`=== LINE CONFIG DEBUG ===`);
    this.logger.log(`TOKEN: ${token ? `SET (length=${token.length}, starts="${token.slice(0, 10)}...")` : 'NOT SET'}`);
    this.logger.log(`GROUP_ID: ${this.groupId ? `SET (value="${this.groupId}")` : 'NOT SET'}`);
    this.logger.log(`SITE_URL: ${siteUrl || 'NOT SET (fallback: https://www.seacare.life)'}`);
    this.logger.log(`=========================`);

    if (token) {
      this.client = new messagingApi.MessagingApiClient({ channelAccessToken: token });
      this.logger.log('LINE client created OK');

      if (this.groupId) {
        this.sendTestMessage();
      } else {
        this.logger.warn('LINE_GROUP_ID not set — push disabled');
      }
    } else {
      this.logger.warn('LINE_CHANNEL_ACCESS_TOKEN not set — LINE disabled');
    }
  }

  private async sendTestMessage() {
    this.logger.log(`Sending test message to groupId="${this.groupId}"...`);
    try {
      const result = await this.client!.pushMessage({
        to: this.groupId!,
        messages: [{ type: 'text', text: '✅ Seacare Travel เชื่อมต่อ LINE สำเร็จ!\nระบบแจ้งเตือนพร้อมใช้งาน' }],
      });
      this.logger.log(`Test message SUCCESS — response: ${JSON.stringify(result)}`);
    } catch (e: any) {
      this.logger.error(`Test message FAILED`);
      this.logger.error(`Error type: ${e.constructor?.name}`);
      this.logger.error(`Error message: ${e.message}`);
      if (e.statusCode) this.logger.error(`HTTP status: ${e.statusCode}`);
      if (e.body) this.logger.error(`Response body: ${JSON.stringify(e.body)}`);
      this.logger.error(`Full error: ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`);
    }
  }

  async pushMessage(text: string) {
    this.logger.log(`pushMessage called — client=${!!this.client}, groupId=${!!this.groupId}`);
    if (!this.client) { this.logger.warn('No LINE client — skipping'); return; }
    if (!this.groupId) { this.logger.warn('No groupId — skipping'); return; }

    this.logger.log(`Pushing to "${this.groupId}": ${text.slice(0, 50)}...`);
    try {
      const result = await this.client.pushMessage({
        to: this.groupId,
        messages: [{ type: 'text', text }],
      });
      this.logger.log(`Push SUCCESS — response: ${JSON.stringify(result)}`);
    } catch (e: any) {
      this.logger.error(`Push FAILED`);
      this.logger.error(`Error: ${e.message}`);
      if (e.statusCode) this.logger.error(`HTTP status: ${e.statusCode}`);
      if (e.body) this.logger.error(`Response body: ${JSON.stringify(e.body)}`);
      this.logger.error(`Full error: ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`);
    }
  }

  async notifyNewMessage(visitorName: string, content: string, sessionId: string) {
    this.logger.log(`notifyNewMessage called — visitor="${visitorName}", session="${sessionId}"`);
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
    this.logger.log(`notifyStaffRequest called — visitor="${visitorName}", session="${sessionId}"`);
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

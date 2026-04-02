import { Injectable, Logger } from '@nestjs/common';
import { messagingApi } from '@line/bot-sdk';

@Injectable()
export class LineService {
  private readonly logger = new Logger(LineService.name);

  private getToken() { return process.env.LINE_CHANNEL_ACCESS_TOKEN; }
  private getGroupId() { return process.env.LINE_GROUP_ID; }
  private getSiteUrl() { return process.env.SITE_URL || 'https://www.seacare.life'; }

  private createClient(token: string) {
    return new messagingApi.MessagingApiClient({ channelAccessToken: token });
  }

  private async push(text: string) {
    const token = this.getToken();
    const groupId = this.getGroupId();

    this.logger.log(`push() — token=${token ? `SET(${token.slice(0, 8)}...)` : 'NOT SET'}, groupId=${groupId || 'NOT SET'}`);

    if (!token || !groupId) {
      this.logger.warn('LINE not configured — skipping push');
      return;
    }

    this.logger.log(`Pushing to "${groupId}": ${text.slice(0, 60)}...`);
    try {
      const client = this.createClient(token);
      const result = await client.pushMessage({
        to: groupId,
        messages: [{ type: 'text', text }],
      });
      this.logger.log(`Push SUCCESS — ${JSON.stringify(result)}`);
    } catch (e: any) {
      this.logger.error(`Push FAILED — ${e.message}`);
      if (e.statusCode) this.logger.error(`HTTP ${e.statusCode}`);
      if (e.body) this.logger.error(`Body: ${JSON.stringify(e.body)}`);
      this.logger.error(`Full: ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`);
    }
  }

  async notifyNewMessage(visitorName: string, content: string, sessionId: string) {
    this.logger.log(`notifyNewMessage — visitor="${visitorName}", session="${sessionId}"`);
    const text = [
      `💬 ข้อความใหม่จากลูกค้า`,
      `👤 ชื่อ: ${visitorName}`,
      `📝 ข้อความ: ${content}`,
      `🔗 ${this.getSiteUrl()}/admin/chat`,
    ].join('\n');
    await this.push(text);
  }

  async notifyStaffRequest(visitorName: string, sessionId: string) {
    this.logger.log(`notifyStaffRequest — visitor="${visitorName}", session="${sessionId}"`);
    const text = [
      `🚨 ลูกค้าต้องการคุยกับพนักงาน!`,
      `👤 ชื่อ: ${visitorName}`,
      `⏰ กรุณาตอบกลับโดยเร็ว`,
      `🔗 ${this.getSiteUrl()}/admin/chat`,
    ].join('\n');
    await this.push(text);
  }
}

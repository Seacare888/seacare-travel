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
    const token = process.env['LINE_CHANNEL_ACCESS_TOKEN'];
    const groupId = process.env['LINE_GROUP_ID'];

    console.log('[LINE DEBUG] All LINE env keys:', Object.keys(process.env).filter(k => k.startsWith('LINE')));
    console.log('[LINE DEBUG] token length:', token?.length);
    console.log('[LINE DEBUG] token first 10:', token?.slice(0, 10));
    console.log('[LINE DEBUG] groupId:', groupId);
    console.log('[LINE DEBUG] SITE_URL:', process.env['SITE_URL']);

    if (!token || !groupId) {
      console.log('[LINE DEBUG] SKIPPING — missing token or groupId');
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

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class LineService {
  constructor(private config: ConfigService) {}

  private async push(text: string) {
    const token = this.config.get<string>('LINE_CHANNEL_ACCESS_TOKEN');
    const groupId = this.config.get<string>('LINE_GROUP_ID');

    console.log('[LINE] token length:', token?.length);
    console.log('[LINE] groupId:', groupId);

    if (!token || !groupId) {
      console.warn('[LINE] not configured — skipping');
      return;
    }

    try {
      const r = await axios.post('https://api.line.me/v2/bot/message/push',
        { to: groupId, messages: [{ type: 'text', text }] },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      console.log('[LINE] sent:', r.status);
    } catch (e: any) {
      console.error('[LINE] error:', e.response?.data || e.message);
    }
  }

  async notifyNewMessage(visitorName: string, content: string, sessionId: string) {
    const siteUrl = this.config.get<string>('SITE_URL') || 'https://www.seacare.life';
    const text = [
      `💬 ข้อความใหม่จากลูกค้า`,
      `👤 ชื่อ: ${visitorName}`,
      `📝 ${content}`,
      `🔗 ${siteUrl}/admin/chat`,
    ].join('\n');
    await this.push(text);
  }

  async notifyStaffRequest(visitorName: string, sessionId: string) {
    const siteUrl = this.config.get<string>('SITE_URL') || 'https://www.seacare.life';
    const text = [
      `🚨 ลูกค้าต้องการคุยกับพนักงาน!`,
      `👤 ชื่อ: ${visitorName}`,
      `⏰ กรุณาตอบกลับโดยเร็ว`,
      `🔗 ${siteUrl}/admin/chat`,
    ].join('\n');
    await this.push(text);
  }
}

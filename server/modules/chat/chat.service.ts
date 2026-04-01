import { Injectable } from '@nestjs/common';

export type SessionStatus = 'ai' | 'waiting' | 'staffing' | 'closed';
export interface ChatMessage {
  id: string; sessionId: string; role: 'user' | 'ai' | 'staff';
  content: string; timestamp: Date; staffName?: string;
}
export interface ChatSession {
  id: string; visitorName: string; status: SessionStatus;
  messages: ChatMessage[]; createdAt: Date; updatedAt: Date;
  staffId?: string; staffName?: string;
}

@Injectable()
export class ChatService {
  private sessions = new Map<string, ChatSession>();
  private id() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

  createSession(name: string): ChatSession {
    const s: ChatSession = { id: this.id(), visitorName: name, status: 'ai',
      messages: [], createdAt: new Date(), updatedAt: new Date() };
    this.sessions.set(s.id, s);
    return s;
  }

  getSession(id: string) { return this.sessions.get(id); }

  getActive() {
    return [...this.sessions.values()].filter(s => s.status !== 'closed')
      .sort((a, b) => {
        const o = { waiting: 0, staffing: 1, ai: 2, closed: 3 };
        return o[a.status] - o[b.status];
      });
  }

  addMessage(sid: string, role: 'user'|'ai'|'staff', content: string, staffName?: string) {
    const s = this.sessions.get(sid);
    if (!s) return null;
    const m: ChatMessage = { id: this.id(), sessionId: sid, role, content, timestamp: new Date(), staffName };
    s.messages.push(m);
    s.updatedAt = new Date();
    return m;
  }

  requestStaff(sid: string) {
    const s = this.sessions.get(sid);
    if (!s) return false;
    s.status = 'waiting'; s.updatedAt = new Date();
    return true;
  }

  takeover(sid: string, staffId: string, staffName: string) {
    const s = this.sessions.get(sid);
    if (!s) return false;
    s.status = 'staffing'; s.staffId = staffId; s.staffName = staffName; s.updatedAt = new Date();
    return true;
  }

  close(sid: string) {
    const s = this.sessions.get(sid);
    if (!s) return false;
    s.status = 'closed'; s.updatedAt = new Date();
    return true;
  }

  getAIReply(message: string): string {
    const m = message.toLowerCase();
    if (m.includes('ราคา') || m.includes('price')) return 'ราคาทัวร์เริ่มต้นที่ 15,000 บาท ขึ้นอยู่กับจุดหมายและจำนวนวัน สนใจดูรายละเอียดได้ที่หน้าแพ็คเกจทัวร์ครับ';
    if (m.includes('ญี่ปุ่น') || m.includes('japan')) return 'ทัวร์ญี่ปุ่นของเรามีหลายเส้นทาง ราคาเริ่ม 45,900 บาท ดูรายละเอียดได้ที่หน้าแพ็คเกจทัวร์ครับ';
    if (m.includes('เกาหลี') || m.includes('korea')) return 'ทัวร์เกาหลีราคาเริ่ม 28,900 บาท มีทั้งโซล เกาะนามิ เอเวอร์แลนด์ ดูรายละเอียดได้เลยครับ';
    if (m.includes('ยุโรป') || m.includes('europe')) return 'ทัวร์ยุโรปของเรามีหลายประเทศ ราคาเริ่ม 65,000 บาท ติดต่อเราเพื่อรับโปรแกรมที่เหมาะกับคุณครับ';
    if (m.includes('จอง') || m.includes('book')) return 'สามารถจองได้โดยโทร 02-888-9999 หรือกรอกฟอร์มติดต่อในหน้าเว็บไซต์ครับ';
    if (m.includes('สวัสดี') || m.includes('hello') || m.includes('hi')) return 'สวัสดีครับ! ยินดีต้อนรับสู่ Seacare Travel มีอะไรให้ช่วยไหมครับ?';
    return 'ขอบคุณสำหรับคำถามครับ หากต้องการข้อมูลเพิ่มเติม กด "คุยกับพนักงาน" หรือโทร 02-888-9999 ได้เลยครับ';
  }
}

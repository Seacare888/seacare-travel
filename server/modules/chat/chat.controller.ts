import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

@Controller('/api/chat')
export class ChatController {
  constructor(private cs: ChatService, private cg: ChatGateway) {}

  @Post('sessions')
  create(@Body() b: { visitorName?: string }) {
    const name = b.visitorName?.trim() || 'ผู้เยี่ยมชม';
    const session = this.cs.createSession(name);
    const welcome = this.cs.addMessage(session.id, 'ai',
      `สวัสดีครับ คุณ${name}! ยินดีต้อนรับสู่ Seacare Travel มีอะไรให้ช่วยไหมครับ? 😊`);
    this.cg.broadcastSessions();
    return { success: true, data: { session, welcomeMessage: welcome } };
  }

  @Get('sessions')
  getAll() { return { success: true, data: this.cs.getActive() }; }

  @Get('sessions/:id')
  getOne(@Param('id') id: string) {
    const s = this.cs.getSession(id);
    if (!s) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    return { success: true, data: s };
  }

  @Post('sessions/:id/messages')
  sendMessage(@Param('id') id: string, @Body() b: { content: string }) {
    const session = this.cs.getSession(id);
    if (!session) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    const userMsg = this.cs.addMessage(id, 'user', b.content);
    this.cg.broadcastMessage(id, userMsg);
    this.cg.broadcastSessions();
    if (session.status === 'ai') {
      const reply = this.cs.getAIReply(b.content);
      const aiMsg = this.cs.addMessage(id, 'ai', reply);
      this.cg.broadcastMessage(id, aiMsg);
      return { success: true, data: { userMessage: userMsg, aiMessage: aiMsg } };
    }
    return { success: true, data: { userMessage: userMsg } };
  }

  @Post('sessions/:id/request-staff')
  requestStaff(@Param('id') id: string) {
    const session = this.cs.getSession(id);
    if (!session) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    this.cs.requestStaff(id);
    const msg = this.cs.addMessage(id, 'ai', '✋ รับทราบแล้วครับ! กำลังประสานงานพนักงาน กรุณารอสักครู่...');
    this.cg.broadcastMessage(id, msg);
    this.cg.notifyStaff(this.cs.getSession(id));
    this.cg.broadcastSessions();
    return { success: true, data: this.cs.getSession(id) };
  }

  @Post('sessions/:id/takeover')
  takeover(@Param('id') id: string, @Body() b: { staffId: string; staffName: string }) {
    const session = this.cs.getSession(id);
    if (!session) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    this.cs.takeover(id, b.staffId, b.staffName);
    const msg = this.cs.addMessage(id, 'staff',
      `สวัสดีครับ ผม ${b.staffName} พนักงาน Seacare Travel ยินดีให้บริการครับ`, b.staffName);
    this.cg.broadcastMessage(id, msg);
    this.cg.broadcastSession(this.cs.getSession(id));
    this.cg.broadcastSessions();
    return { success: true, data: this.cs.getSession(id) };
  }

  @Post('sessions/:id/staff-message')
  staffMessage(@Param('id') id: string, @Body() b: { content: string; staffName: string }) {
    const msg = this.cs.addMessage(id, 'staff', b.content, b.staffName);
    this.cg.broadcastMessage(id, msg);
    this.cg.broadcastSessions();
    return { success: true, data: msg };
  }

  @Post('sessions/:id/close')
  close(@Param('id') id: string) {
    this.cs.close(id);
    this.cg.broadcastSession(this.cs.getSession(id));
    this.cg.broadcastSessions();
    return { success: true };
  }
}

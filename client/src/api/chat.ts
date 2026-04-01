import api from './index';
import type { ChatSession, ChatMessage } from '../types';

export async function createChatSession(visitorName: string) {
  const r = await api.post('/api/chat/sessions', { visitorName });
  return r.data.data as { session: ChatSession; welcomeMessage: ChatMessage };
}
export async function getChatSession(id: string) {
  const r = await api.get('/api/chat/sessions/' + id);
  return r.data.data as ChatSession;
}
export async function getAllSessions() {
  const r = await api.get('/api/chat/sessions');
  return r.data.data as ChatSession[];
}
export async function sendMessage(id: string, content: string) {
  const r = await api.post('/api/chat/sessions/' + id + '/messages', { content });
  return r.data.data;
}
export async function requestStaff(id: string) {
  const r = await api.post('/api/chat/sessions/' + id + '/request-staff');
  return r.data.data as ChatSession;
}
export async function staffTakeover(id: string, staffId: string, staffName: string) {
  const r = await api.post('/api/chat/sessions/' + id + '/takeover', { staffId, staffName });
  return r.data.data as ChatSession;
}
export async function staffSendMessage(id: string, content: string, staffName: string) {
  const r = await api.post('/api/chat/sessions/' + id + '/staff-message', { content, staffName });
  return r.data.data as ChatMessage;
}
export async function closeSession(id: string) {
  await api.post('/api/chat/sessions/' + id + '/close');
}

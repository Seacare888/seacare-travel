import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircleIcon, XIcon, SendIcon, BotIcon, UserIcon, PhoneIcon, Loader2Icon } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { createChatSession, sendMessage, requestStaff, getChatSession } from '../api/chat';
import type { ChatMessage, ChatSession } from '../types';

const KEY = 'seacare_chat_sid';

function timeStr(ts: string) {
  return new Date(ts).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'name'|'chat'>('name');
  const [name, setName] = useState('');
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (open) setHasNew(false); }, [open]);

  const connectSocket = useCallback((sid: string) => {
    if (socketRef.current) return;
    const s = io('/chat', { path: '/socket.io', transports: ['websocket','polling'] });
    s.on('connect', () => s.emit('join_session', { sessionId: sid }));
    s.on('new_message', (msg: ChatMessage) => {
      setMessages(p => p.find(m => m.id === msg.id) ? p : [...p, msg]);
      if (msg.role !== 'user') setHasNew(true);
    });
    s.on('session_updated', (ss: ChatSession) => setSession(ss));
    socketRef.current = s;
  }, []);

  useEffect(() => {
    const sid = localStorage.getItem(KEY);
    if (sid) {
      getChatSession(sid).then(s => {
        if (s.status !== 'closed') {
          setSession(s); setMessages(s.messages); setStep('chat'); connectSocket(s.id);
        } else localStorage.removeItem(KEY);
      }).catch(() => localStorage.removeItem(KEY));
    }
    return () => { socketRef.current?.disconnect(); };
  }, [connectSocket]);

  const startChat = async () => {
    const n = name.trim() || 'ผู้เยี่ยมชม';
    setLoading(true);
    try {
      const { session: s, welcomeMessage: w } = await createChatSession(n);
      setSession(s); setMessages([w]); setStep('chat');
      localStorage.setItem(KEY, s.id);
      connectSocket(s.id);
    } catch { } finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!input.trim() || !session || loading) return;
    const content = input.trim(); setInput(''); setLoading(true);
    const temp: ChatMessage = { id: 'tmp-'+Date.now(), sessionId: session.id, role: 'user', content, timestamp: new Date().toISOString() };
    setMessages(p => [...p, temp]);
    try {
      const r = await sendMessage(session.id, content);
      setMessages(p => {
        const without = p.filter(m => m.id !== temp.id);
        return [...without, r.userMessage, r.aiMessage].filter(Boolean);
      });
    } catch { setMessages(p => p.filter(m => m.id !== temp.id)); }
    finally { setLoading(false); }
  };

  const handleRequestStaff = async () => {
    if (!session) return;
    await requestStaff(session.id);
    setSession(p => p ? { ...p, status: 'waiting' } : p);
  };

  const statusColor = { ai: 'bg-green-500', waiting: 'bg-yellow-500', staffing: 'bg-blue-500', closed: 'bg-gray-400' };
  const statusLabel = { ai: 'AI ผู้ช่วย', waiting: 'รอพนักงาน...', staffing: session?.staffName || 'พนักงาน', closed: 'ปิดแล้ว' };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ maxHeight: 560 }}>
          <div className="bg-[#0066cc] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><BotIcon className="w-4 h-4 text-white" /></div>
              <div>
                <p className="text-white font-semibold text-sm">Seacare Travel</p>
                {session && <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusColor[session.status]}`} />
                  {statusLabel[session.status]}
                </div>}
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white"><XIcon className="w-5 h-5" /></button>
          </div>

          {step === 'name' ? (
            <div className="p-6 flex flex-col gap-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                  <MessageCircleIcon className="w-7 h-7 text-[#0066cc]" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">ยินดีต้อนรับ!</h3>
                <p className="text-sm text-gray-500">กรุณาแนะนำตัวก่อนเริ่มสนทนา</p>
              </div>
              <input className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-[#0066cc]"
                placeholder="ชื่อของคุณ" value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && startChat()} autoFocus />
              <button onClick={startChat} disabled={loading}
                className="bg-[#0066cc] text-white rounded-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#0052a3] transition-colors">
                {loading && <Loader2Icon className="w-4 h-4 animate-spin" />}เริ่มสนทนา
              </button>
              <p className="text-xs text-gray-400 text-center">หรือโทร <a href="tel:028889999" className="text-[#0066cc] font-medium">02-888-9999</a></p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50" style={{ maxHeight: 300 }}>
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role !== 'user' && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'staff' ? 'bg-blue-100' : 'bg-blue-50'}`}>
                        {msg.role === 'staff' ? <UserIcon className="w-3 h-3 text-blue-600" /> : <BotIcon className="w-3 h-3 text-[#0066cc]" />}
                      </div>
                    )}
                    <div className={`max-w-[78%] flex flex-col gap-0.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      {msg.role === 'staff' && <span className="text-xs text-blue-600 font-medium px-1">{msg.staffName}</span>}
                      <div className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                        msg.role === 'user' ? 'bg-[#0066cc] text-white rounded-tr-sm' :
                        msg.role === 'staff' ? 'bg-blue-50 text-blue-900 border border-blue-100 rounded-tl-sm' :
                        'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`}>
                        {msg.content}
                      </div>
                      <span className="text-xs text-gray-400 px-1">{timeStr(msg.timestamp)}</span>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center"><BotIcon className="w-3 h-3 text-[#0066cc]" /></div>
                    <div className="bg-white border border-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                      {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: d+'ms' }} />)}
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
              {session?.status === 'ai' && (
                <div className="px-3 pb-1">
                  <button onClick={handleRequestStaff} className="w-full text-xs text-[#0066cc] border border-[#0066cc]/30 rounded-full py-1.5 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1">
                    <PhoneIcon className="w-3 h-3" />คุยกับพนักงาน
                  </button>
                </div>
              )}
              {session?.status === 'waiting' && (
                <div className="px-3 pb-1">
                  <p className="text-xs text-center text-yellow-700 bg-yellow-50 rounded-full py-1.5">⏳ รอพนักงาน กรุณารอสักครู่...</p>
                </div>
              )}
              <div className="px-3 py-2 border-t border-gray-100 flex gap-2">
                <input ref={el => el && step === 'chat' && el.focus()}
                  className="flex-1 border border-gray-200 rounded-full px-3 py-1.5 text-sm outline-none focus:border-[#0066cc]"
                  placeholder={session?.status === 'waiting' ? 'รอพนักงาน...' : 'พิมพ์ข้อความ...'}
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  disabled={session?.status === 'waiting' || session?.status === 'closed'} />
                <button onClick={handleSend} disabled={!input.trim() || loading || session?.status === 'waiting'}
                  className="w-8 h-8 bg-[#0066cc] rounded-full flex items-center justify-center text-white hover:bg-[#0052a3] disabled:opacity-40 flex-shrink-0">
                  <SendIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <button onClick={() => setOpen(o => !o)}
        className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-[#0066cc] text-white shadow-lg hover:bg-[#0052a3] hover:scale-105 transition-all flex items-center justify-center relative">
        {open ? <XIcon className="w-6 h-6" /> : <MessageCircleIcon className="w-6 h-6" />}
        {!open && hasNew && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />}
      </button>
    </div>
  );
}

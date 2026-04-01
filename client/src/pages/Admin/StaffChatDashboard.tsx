import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircleIcon, UserIcon, BotIcon, SendIcon, XCircleIcon, Loader2Icon, BellIcon } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { getAllSessions, staffTakeover, staffSendMessage, closeSession } from '../../api/chat';
import { useAuth } from '../../hooks/useAuth';
import type { ChatSession, ChatMessage } from '../../types';
import { toast } from 'sonner';

function timeAgo(ts: string) {
  const d = Date.now() - new Date(ts).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'เพิ่งตอนนี้';
  if (m < 60) return m + ' นาทีที่แล้ว';
  return Math.floor(m / 60) + ' ชั่วโมงที่แล้ว';
}

const STATUS = {
  ai: { label: 'AI ตอบ', cls: 'bg-gray-100 text-gray-600' },
  waiting: { label: '⚡ รอพนักงาน', cls: 'bg-yellow-100 text-yellow-700' },
  staffing: { label: 'มีพนักงาน', cls: 'bg-blue-100 text-blue-700' },
  closed: { label: 'ปิดแล้ว', cls: 'bg-gray-100 text-gray-400' },
};

export default function StaffChatDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [active, setActive] = useState<ChatSession | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const loadSessions = useCallback(async () => {
    try { const d = await getAllSessions(); setSessions(d); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  useEffect(() => {
    const s = io('/chat', { path: '/socket.io', transports: ['websocket','polling'] });
    s.on('connect', () => s.emit('join_staff'));
    s.on('sessions_update', (data: ChatSession[]) => setSessions(data));
    s.on('new_waiting_session', (sess: ChatSession) => {
      toast(`💬 ${sess.visitorName} ต้องการคุยกับพนักงาน`, { duration: 8000 });
      setSessions(p => p.find(x => x.id === sess.id) ? p.map(x => x.id === sess.id ? sess : x) : [sess, ...p]);
    });
    s.on('new_message', (msg: ChatMessage) => {
      setActive(a => {
        if (a?.id === msg.sessionId) setMsgs(m => m.find(x => x.id === msg.id) ? m : [...m, msg]);
        return a;
      });
    });
    s.on('session_status_changed', (sess: ChatSession) => setSessions(p => p.map(x => x.id === sess.id ? sess : x)));
    socketRef.current = s;
    return () => { s.disconnect(); };
  }, []);

  const openSession = (sess: ChatSession) => {
    setActive(sess); setMsgs(sess.messages);
    socketRef.current?.emit('join_session', { sessionId: sess.id });
  };

  const handleTakeover = async (id: string) => {
    if (!user) return;
    try {
      const updated = await staffTakeover(id, user.id, user.name);
      setActive(updated); setMsgs(updated.messages);
      setSessions(p => p.map(s => s.id === id ? updated : s));
      toast.success('รับเรื่องเรียบร้อย');
    } catch { toast.error('ไม่สามารถรับเรื่องได้'); }
  };

  const handleSend = async () => {
    if (!input.trim() || !active || sending) return;
    const c = input.trim(); setInput(''); setSending(true);
    try {
      const msg = await staffSendMessage(active.id, c, user?.name || 'พนักงาน');
      setMsgs(p => p.find(m => m.id === msg.id) ? p : [...p, msg]);
    } catch { toast.error('ส่งไม่สำเร็จ'); }
    finally { setSending(false); }
  };

  const handleClose = async (id: string) => {
    try {
      await closeSession(id);
      setSessions(p => p.map(s => s.id === id ? { ...s, status: 'closed' } : s));
      if (active?.id === id) setActive(a => a ? { ...a, status: 'closed' } : a);
      toast.success('ปิดการสนทนาแล้ว');
    } catch { toast.error('ปิดไม่สำเร็จ'); }
  };

  const waiting = sessions.filter(s => s.status === 'waiting').length;

  return (
    <div className="flex h-[600px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"><MessageCircleIcon className="w-4 h-4 text-[#0066cc]" />การสนทนา</span>
          </div>
          {waiting > 0 && <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5"><BellIcon className="w-3.5 h-3.5 text-yellow-600 animate-pulse" /><span className="text-xs text-yellow-700 font-medium">{waiting} รายการรอ</span></div>}
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="flex items-center justify-center py-8"><Loader2Icon className="w-5 h-5 animate-spin text-gray-300" /></div>
            : sessions.length === 0 ? <p className="text-center text-xs text-gray-400 py-8">ยังไม่มีการสนทนา</p>
            : sessions.map(sess => (
              <button key={sess.id} onClick={() => openSession(sess)}
                className={`w-full px-3 py-2.5 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors ${active?.id === sess.id ? 'bg-blue-50 border-l-2 border-l-[#0066cc]' : ''} ${sess.status === 'waiting' ? 'bg-yellow-50/50' : ''}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-gray-800 truncate">{sess.visitorName}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ml-1 ${STATUS[sess.status].cls}`}>{STATUS[sess.status].label}</span>
                </div>
                <p className="text-xs text-gray-400">{timeAgo(sess.updatedAt)}</p>
                {sess.messages.length > 0 && <p className="text-xs text-gray-400 truncate mt-0.5">{sess.messages[sess.messages.length-1].content}</p>}
              </button>
            ))
          }
        </div>
      </div>

      {/* Main */}
      {active ? (
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><UserIcon className="w-4 h-4 text-[#0066cc]" /></div>
              <div><p className="text-sm font-semibold text-gray-800">{active.visitorName}</p><p className={`text-xs font-medium ${STATUS[active.status].cls.replace('bg-','text-').split(' ')[0]}`}>{STATUS[active.status].label}</p></div>
            </div>
            <div className="flex gap-2">
              {active.status === 'waiting' && <button onClick={() => handleTakeover(active.id)} className="bg-[#0066cc] text-white text-xs px-3 py-1.5 rounded-full font-medium hover:bg-[#0052a3]">รับเรื่อง</button>}
              {active.status !== 'closed' && <button onClick={() => handleClose(active.id)} className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 flex items-center gap-1"><XCircleIcon className="w-3.5 h-3.5" />ปิด</button>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {msgs.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-gray-200' : msg.role === 'staff' ? 'bg-blue-100' : 'bg-blue-50'}`}>
                  {msg.role === 'user' ? <UserIcon className="w-3 h-3 text-gray-500" /> : msg.role === 'staff' ? <UserIcon className="w-3 h-3 text-blue-600" /> : <BotIcon className="w-3 h-3 text-[#0066cc]" />}
                </div>
                <div className={`max-w-[70%] flex flex-col gap-0.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-400 px-1">{msg.role === 'staff' ? msg.staffName : msg.role === 'ai' ? 'AI' : active.visitorName}</span>
                  <div className={`px-3 py-2 rounded-2xl text-xs whitespace-pre-wrap ${msg.role === 'user' ? 'bg-gray-100 text-gray-800' : msg.role === 'staff' ? 'bg-[#0066cc] text-white' : 'bg-white text-gray-800 border border-gray-100'}`}>{msg.content}</div>
                  <span className="text-xs text-gray-300 px-1">{new Date(msg.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {active.status === 'staffing' && active.staffId === user?.id ? (
            <div className="px-3 py-2.5 border-t border-gray-100 flex gap-2 bg-white">
              <input className="flex-1 border border-gray-200 rounded-full px-3 py-1.5 text-sm outline-none focus:border-[#0066cc]" placeholder="พิมพ์ข้อความ..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
              <button onClick={handleSend} disabled={!input.trim() || sending} className="w-8 h-8 bg-[#0066cc] rounded-full flex items-center justify-center text-white disabled:opacity-40 flex-shrink-0">
                {sending ? <Loader2Icon className="w-3.5 h-3.5 animate-spin" /> : <SendIcon className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : active.status === 'waiting' ? (
            <div className="px-3 py-2.5 border-t border-gray-100 bg-white"><button onClick={() => handleTakeover(active.id)} className="w-full bg-[#0066cc] text-white text-sm rounded-full py-2 font-medium hover:bg-[#0052a3]">รับเรื่องนี้</button></div>
          ) : active.status === 'closed' ? (
            <div className="px-3 py-2.5 border-t border-gray-100 text-center text-xs text-gray-400">การสนทนานี้ปิดแล้ว</div>
          ) : (
            <div className="px-3 py-2.5 border-t border-gray-100 text-center text-xs text-gray-400">AI กำลังตอบอัตโนมัติ</div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
          <MessageCircleIcon className="w-12 h-12 mb-2 opacity-30" />
          <p className="text-sm">เลือกการสนทนาจากรายการ</p>
        </div>
      )}
    </div>
  );
}

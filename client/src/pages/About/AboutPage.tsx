import { useState } from 'react';
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon, ShieldCheckIcon, UsersIcon, TargetIcon, AwardIcon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';

const TEAM = [
  { name: 'คุณวิภา', role: 'ผู้ก่อตั้งและ CEO', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', desc: 'ประสบการณ์ด้านการท่องเที่ยวกว่า 15 ปี' },
  { name: 'คุณสมศักดิ์', role: 'ผู้อำนวยการฝ่ายปฏิบัติการ', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', desc: 'เชี่ยวชาญการออกแบบผลิตภัณฑ์ท่องเที่ยว' },
  { name: 'คุณประภาพร', role: 'ผู้อำนวยการฝ่ายผลิตภัณฑ์', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', desc: 'นักวางแผนการเดินทางระดับสูง' },
  { name: 'คุณมานะ', role: 'ผู้อำนวยการฝ่ายบริการลูกค้า', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', desc: 'ประสบการณ์ด้านบริการกว่า 20 ปี' },
];

const CONTACTS = [
  { icon: PhoneIcon, title: 'โทรศัพท์', content: '02-888-9999', sub: 'บริการตลอด 24 ชั่วโมง' },
  { icon: MailIcon, title: 'อีเมล', content: 'contact@seacare-travel.co.th', sub: 'ตอบกลับภายใน 24 ชั่วโมง' },
  { icon: MapPinIcon, title: 'ที่อยู่', content: 'อาคารสีลมคอมเพล็กซ์ ชั้น 18 กรุงเทพฯ', sub: 'ยินดีต้อนรับการเยี่ยมชม' },
  { icon: ClockIcon, title: 'เวลาทำการ', content: 'จันทร์-อาทิตย์ 9:00-21:00 น.', sub: 'บริการทุกวัน' },
];

export default function AboutPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('ส่งข้อมูลสำเร็จ! เราจะติดต่อกลับโดยเร็วที่สุด');
    setForm({ name: '', phone: '', email: '', message: '' });
  };
  return (
    <div>
      <div className="bg-gradient-to-br from-[#0066cc] to-[#0052a3] py-16 px-4 text-center">
        <h1 className="text-3xl font-black text-white mb-2">เกี่ยวกับเรา</h1>
        <p className="text-white/80 max-w-xl mx-auto">Seacare Travel — ผู้ให้บริการท่องเที่ยวระดับมืออาชีพ มุ่งมั่นสร้างประสบการณ์ที่น่าจดจำ</p>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
        <section>
          <h2 className="text-2xl font-black text-gray-800 mb-8 text-center">ทีมผู้บริหาร</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {TEAM.map(m => (
              <div key={m.name} className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm">
                <img src={m.avatar} alt={m.name} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-4 border-blue-50" />
                <p className="font-bold text-gray-800 text-sm">{m.name}</p>
                <p className="text-xs text-[#0066cc] font-medium mb-1">{m.role}</p>
                <p className="text-xs text-gray-500">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-black text-gray-800 mb-6">ติดต่อเรา</h2>
            <div className="space-y-4">
              {CONTACTS.map(c => (
                <div key={c.title} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0"><c.icon className="w-5 h-5 text-[#0066cc]" /></div>
                  <div><p className="text-xs text-gray-400">{c.title}</p><p className="font-semibold text-gray-800 text-sm">{c.content}</p><p className="text-xs text-gray-400">{c.sub}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-5">ส่งข้อความหาเรา</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0066cc]" placeholder="ชื่อ-นามสกุล" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input required type="tel" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0066cc]" placeholder="เบอร์โทรศัพท์" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0066cc]" placeholder="อีเมล (ถ้ามี)" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0066cc] resize-none h-24" placeholder="ข้อความ..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
              <button type="submit" className="w-full bg-[#0066cc] text-white rounded-full py-2.5 font-semibold flex items-center justify-center gap-2 hover:bg-[#0052a3]">
                <SendIcon className="w-4 h-4" />ส่งข้อความ
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

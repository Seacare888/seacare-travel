import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon, ClockIcon, StarIcon, ShieldCheckIcon, HeartIcon, SearchIcon, PhoneIcon, MailIcon } from 'lucide-react';
import { getTours, getDestinations } from '../../api/tour';
import type { ITour, IDestination } from '../../types';

const HERO = 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1920&q=80';

const FEATURES = [
  { icon: ShieldCheckIcon, title: 'คุณภาพรับประกัน', desc: 'คัดสรรพาร์ทเนอร์อย่างเข้มงวด เดินทางอย่างมั่นใจ' },
  { icon: ClockIcon, title: 'บริการมืออาชีพ', desc: 'ประสบการณ์กว่า 10 ปี ทีมไกด์มืออาชีพ' },
  { icon: HeartIcon, title: 'ออกแบบทริปส่วนตัว', desc: 'ปรับแต่งทริปตามความต้องการเฉพาะตัวของคุณ' },
  { icon: MapPinIcon, title: 'ครอบคลุมทั่วโลก', desc: 'สำรวจสถานที่กว่า 50 ประเทศทั่วโลก' },
];

const TESTIMONIALS = [
  { name: 'คุณวรรณ', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', content: 'ทริปญี่ปุ่นสุดยอดมากค่ะ! ไกด์มืออาชีพมาก จะใช้บริการอีกแน่นอน', tour: 'ทัวร์ญี่ปุ่น โตเกียว ฟูจิ' },
  { name: 'คุณสมชาย', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80', content: 'พาครอบครัวไปยุโรป ลูกๆ สนุกมาก บริการดีเยี่ยมครับ!', tour: 'ทัวร์ฝรั่งเศส อิตาลี' },
  { name: 'คุณนภา', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80', content: 'มัลดีฟส์สวยงามมาก ขอบคุณ Seacare Travel สำหรับทริปฮันนีมูน', tour: 'ทัวร์มัลดีฟส์ 5 ดาว' },
];

function TourCard({ tour, promoted }: { tour: ITour; promoted?: boolean }) {
  const nav = useNavigate();
  return (
    <div onClick={() => nav('/tours/'+tour.id)} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
      <div className="relative aspect-square overflow-hidden">
        <img src={tour.coverImage || 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=400&q=80'} alt={tour.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {promoted && <span className="bg-[#0066cc] text-white text-xs font-bold px-2 py-0.5 rounded-full">แนะนำ</span>}
          {tour.tags?.slice(0,2).map(t => <span key={t} className="bg-black/55 text-white text-xs px-2 py-0.5 rounded-full">{t}</span>)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{tour.title}</h3>
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" />{tour.duration} วัน</span>
          <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />{tour.departure}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">เริ่มต้น</p>
            <p className="text-xl font-black text-[#0066cc] font-roboto">฿{tour.price.toLocaleString()}</p>
          </div>
          <button className="bg-[#0066cc] text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-[#0052a3]">ดูรายละเอียด</button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const nav = useNavigate();
  const [tours, setTours] = useState<ITour[]>([]);
  const [destinations, setDestinations] = useState<IDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selDest, setSelDest] = useState('all');
  const [tIdx, setTIdx] = useState(0);
  useEffect(() => {
    Promise.all([getTours({ status: 'active' }), getDestinations({ status: 'active' })])
      .then(([t, d]) => { setTours(t); setDestinations(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const promoted = useMemo(() => tours.filter(t => t.featured && t.status === 'active').slice(0, 6), [tours]);

  const filtered = useMemo(() => {
    let r = [...tours];
    if (search) { const s = search.toLowerCase(); r = r.filter(t => t.title.toLowerCase().includes(s) || t.destination.toLowerCase().includes(s)); }
    if (selDest !== 'all') r = r.filter(t => t.destination === selDest);
    return r;
  }, [tours, search, selDest]);

  const showFiltered = search || selDest !== 'all';

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-gray-50" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-8">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight drop-shadow-md">ท่องเที่ยวรอบโลก<br />ไปกับ Seacare</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed">ผู้ให้บริการท่องเที่ยวระดับโลก สร้างประสบการณ์การเดินทางที่น่าจดจำสู่กว่า 50 ประเทศทั่วโลก</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => nav('/tours')} className="bg-[#0066cc] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#0052a3] transition-all hover:shadow-lg">สำรวจแพ็คเกจทัวร์</button>
            <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-all">ปรึกษาตอนนี้</button>
          </div>
        </div>
      </section>

      {/* Tours */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="bg-[#0066cc] text-white text-xs font-bold px-3 py-1 rounded-full">แพ็คเกจขายดี</span>
            <h2 className="text-3xl font-black text-gray-800 mt-2 mb-1">แพ็คเกจท่องเที่ยวยอดนิยม</h2>
            <p className="text-gray-500">คัดสรรเส้นทางคุณภาพโดยทีมงานผู้เชี่ยวชาญ</p>
          </div>
          <button onClick={() => nav('/tours')} className="hidden sm:block border border-[#0066cc] text-[#0066cc] px-5 py-2 rounded-full text-sm hover:bg-blue-50">ดูทั้งหมด</button>
        </div>
        <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0066cc]"
              placeholder="ค้นหา..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0066cc]"
            value={selDest} onChange={e => setSelDest(e.target.value)}>
            <option value="all">ทุกจุดหมาย</option>
            {destinations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
          </select>
        </div>
        {loading ? (
          <div className="text-center py-16"><div className="w-10 h-10 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-500 text-sm">กำลังโหลด...</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(showFiltered ? filtered : promoted).map(t => <TourCard key={t.id} tour={t} promoted={!showFiltered && t.featured} />)}
            {(showFiltered ? filtered : promoted).length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-400">ไม่พบแพ็คเกจที่ตรงกัน</div>
            )}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-800 mb-2">ทำไมต้องเลือก Seacare Travel</h2>
            <p className="text-gray-500">บริการครบวงจร ดูแลคุณตลอดการเดินทาง</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><f.icon className="w-7 h-7 text-[#0066cc]" /></div>
                <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-800 mb-2">เสียงจากลูกค้าของเรา</h2>
            <p className="text-gray-500">ประสบการณ์จริงจากนักเดินทาง</p>
          </div>
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            <img src={TESTIMONIALS[tIdx].avatar} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border-4 border-blue-50" />
            <div className="flex justify-center gap-1 mb-4">{[1,2,3,4,5].map(s => <StarIcon key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}</div>
            <p className="text-gray-600 text-lg mb-4 leading-relaxed">"{TESTIMONIALS[tIdx].content}"</p>
            <p className="font-bold text-gray-800">{TESTIMONIALS[tIdx].name}</p>
            <p className="text-sm text-gray-500">{TESTIMONIALS[tIdx].tour}</p>
            <div className="flex justify-center gap-2 mt-5">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setTIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === tIdx ? 'bg-[#0066cc]' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 px-4 bg-gradient-to-br from-[#0066cc] to-[#0052a3]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-3xl font-black mb-4">พร้อมออกเดินทางกับเรา?</h2>
            <p className="text-white/85 text-lg mb-8 leading-relaxed">ติดต่อเราเพื่อรับคำปรึกษาฟรี ทีมงานมืออาชีพพร้อมออกแบบทริปที่ใช่สำหรับคุณ</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center"><PhoneIcon className="w-5 h-5 text-white" /></div>
                <div><p className="text-white font-semibold">02-888-9999</p><p className="text-white/65 text-xs">บริการตลอด 24 ชั่วโมง</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center"><MailIcon className="w-5 h-5 text-white" /></div>
                <div><p className="text-white font-semibold">contact@seacare-travel.co.th</p><p className="text-white/65 text-xs">ตอบกลับภายใน 24 ชั่วโมง</p></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 items-center justify-center">
            {/* LINE QR */}
            <div className="bg-white rounded-2xl p-6 shadow-xl text-center w-full sm:w-auto">
              <div className="w-12 h-12 rounded-xl bg-[#06C755]/10 flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#06C755]"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
              </div>
              <img src="/line-qr.jpg" alt="LINE QR Code" className="w-36 h-36 mx-auto rounded-xl mb-3 border-2 border-[#06C755]/20" />
              <p className="font-bold text-gray-800 text-sm">Line@ : @golfseacare</p>
            </div>
            {/* Facebook */}
            <a href="https://www.facebook.com/share/14afZa69pXB/" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-2xl p-6 shadow-xl text-center w-full sm:w-52 hover:shadow-2xl hover:-translate-y-1 transition-all block">
              <div className="w-12 h-12 rounded-xl bg-[#1877F2]/10 flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#1877F2]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </div>
              <p className="font-bold text-gray-800 text-sm mb-1">Seacare Travel & Golf</p>
              <p className="text-[#1877F2] text-xs font-semibold">เยี่ยมชมเพจ Facebook</p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

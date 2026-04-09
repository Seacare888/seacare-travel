import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinIcon, ClockIcon, StarIcon, ShieldCheckIcon, HeartIcon, SearchIcon, PhoneIcon, MailIcon } from 'lucide-react';
import { getTours, getDestinations } from '../../api/tour';
import { getSettings, type SiteSettings } from '../../api/settings';
import { getTestimonials, type ITestimonial } from '../../api/testimonial';
import { getUpcomingDepartures, type IDeparture } from '../../api/departure';
import type { ITour, IDestination } from '../../types';

const DEFAULT_HERO = 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1920&q=80';

const FEATURES = [
  { icon: ShieldCheckIcon, title: 'คุณภาพรับประกัน', desc: 'คัดสรรพาร์ทเนอร์อย่างเข้มงวด เดินทางอย่างมั่นใจ' },
  { icon: ClockIcon, title: 'บริการมืออาชีพ', desc: 'ประสบการณ์กว่า 10 ปี ทีมไกด์มืออาชีพ' },
  { icon: HeartIcon, title: 'ออกแบบทริปส่วนตัว', desc: 'ปรับแต่งทริปตามความต้องการเฉพาะตัวของคุณ' },
  { icon: MapPinIcon, title: 'ครอบคลุมทั่วโลก', desc: 'สำรวจสถานที่กว่า 50 ประเทศทั่วโลก' },
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
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [testimonials, setTestimonials] = useState<ITestimonial[]>([]);
  const [departures, setDepartures] = useState<IDeparture[]>([]);
  useEffect(() => {
    document.title = 'Seacare Travel - ท่องเที่ยวรอบโลก';
    Promise.all([getTours({ status: 'active' }), getDestinations({ status: 'active' }), getSettings(), getTestimonials('active'), getUpcomingDepartures()])
      .then(([t, d, s, r, dep]) => { setTours(t); setDestinations(d); setSettings(s); setTestimonials(r); setDepartures(dep); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const t = setInterval(() => setTIdx(i => (i + 1) % testimonials.length), 4000);
    return () => clearInterval(t);
  }, [testimonials.length]);

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
      {/* Upcoming Departures */}
      {departures.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-6 py-2 rounded-full mb-3">โปรไฟใหม้ 🔥 ที่ยังจองได้ วันนี้</div>
              <h2 className="text-3xl font-black text-gray-800">กรุ๊ปออกเดินทางเร็วๆ นี้</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">จุดหมาย</th>
                    <th className="px-4 py-3 text-left">แพ็คเกจ</th>
                    <th className="px-4 py-3 text-left">วันออกเดินทาง</th>
                    <th className="px-4 py-3 text-right">ราคาเดิม</th>
                    <th className="px-4 py-3 text-right">ราคาโปร</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {departures.map((d, i) => (
                    <tr key={d.id} className="hover:bg-orange-50/50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-medium">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{d.tourDestination || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{d.tourTitle || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{d.departureDate}</td>
                      <td className="px-4 py-3 text-right">
                        {d.originalPrice ? <span className="line-through text-gray-400">฿{d.originalPrice.toLocaleString()}</span> : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-red-600">฿{d.promoPrice.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        {d.status === 'full' ? (
                          <span className="bg-gray-200 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">เต็ม</span>
                        ) : (
                          <button onClick={() => nav('/tours/' + d.tourId)} className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-full hover:shadow-md transition-shadow">จอง</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

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
      {testimonials.length > 0 && (
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-800 mb-2">เสียงจากลูกค้าของเรา</h2>
            <p className="text-gray-500">ประสบการณ์จริงจากนักเดินทาง</p>
          </div>
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
            <img src={testimonials[tIdx]?.avatarUrl || ''} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border-4 border-blue-50" />
            <div className="flex justify-center gap-1 mb-4">{[1,2,3,4,5].map(s => <StarIcon key={s} className={`w-5 h-5 ${s <= (testimonials[tIdx]?.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />)}</div>
            <p className="text-gray-600 text-lg mb-4 leading-relaxed">"{testimonials[tIdx]?.content}"</p>
            <p className="font-bold text-gray-800">{testimonials[tIdx]?.customerName}</p>
            <p className="text-sm text-gray-500">{testimonials[tIdx]?.tourName}</p>
            <div className="flex justify-center gap-2 mt-5">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === tIdx ? 'bg-[#0066cc]' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Contact */}
      <section id="contact" className="py-16 px-4 bg-gradient-to-br from-[#0066cc] to-[#0052a3]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h2 className="text-3xl font-black mb-4">พร้อมออกเดินทางกับเรา?</h2>
            <p className="text-white/85 text-lg mb-8 leading-relaxed">ติดต่อเราเพื่อรับคำปรึกษาฟรี ทีมงานมืออาชีพพร้อมออกแบบทริปที่ใช่สำหรับคุณ</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center"><PhoneIcon className="w-5 h-5 text-white" /></div>
                <div><p className="text-white font-semibold">{settings?.phone || '02-888-9999'}</p><p className="text-white/65 text-xs">บริการตลอด 24 ชั่วโมง</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center"><MailIcon className="w-5 h-5 text-white" /></div>
                <div><p className="text-white font-semibold">{settings?.email || 'contact@seacare-travel.co.th'}</p><p className="text-white/65 text-xs">ตอบกลับภายใน 24 ชั่วโมง</p></div>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <img src="/line-qr.jpg" alt="LINE QR Code" className="w-[180px] h-[180px] mx-auto rounded-2xl border-4 border-white/30 shadow-lg" />
            <p className="text-white font-bold mt-4 text-lg">สแกนเพื่อคุยกับเรา</p>
            <p className="text-white/70 text-sm mt-1">Line@ : {settings?.line_id || '@golfseacare'}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

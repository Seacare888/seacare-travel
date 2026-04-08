import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, MapPinIcon } from 'lucide-react';
import { getTours, getDestinations } from '../../api/tour';
import type { ITour, IDestination } from '../../types';

const REGIONS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'asia', label: 'เอเชีย' },
  { id: 'europe', label: 'ยุโรป' },
  { id: 'america', label: 'อเมริกา' },
  { id: 'oceania', label: 'โอเชียเนีย' },
  { id: 'middle-east', label: 'ตะวันออกกลาง' },
];

export default function ToursPage() {
  const nav = useNavigate();
  const [tours, setTours] = useState<ITour[]>([]);
  const [destinations, setDestinations] = useState<IDestination[]>([]);
  const [region, setRegion] = useState('all');
  const [dest, setDest] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'แพ็คเกจทัวร์ทั้งหมด | Seacare Travel';
    Promise.all([getTours({ status: 'active' }), getDestinations({ status: 'active' })])
      .then(([t, d]) => { setTours(t); setDestinations(d); })
      .finally(() => setLoading(false));
  }, []);

  const availDests = useMemo(() =>
    region === 'all' ? destinations : destinations.filter(d => d.region === region), [region, destinations]);

  const filtered = useMemo(() => {
    let r = tours;
    if (region !== 'all') r = r.filter(t => t.region === region);
    if (dest) r = r.filter(t => t.destination === dest);
    return r;
  }, [tours, region, dest]);

  return (
    <div>
      <div className="bg-gradient-to-br from-[#0066cc] to-[#0052a3] py-14 px-4 text-center">
        <h1 className="text-3xl font-black text-white mb-2">แพ็คเกจทัวร์ทั้งหมด</h1>
        <p className="text-white/80">เลือกจุดหมายในฝันของคุณ</p>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 py-4 bg-white border-b border-gray-100 sticky top-16 z-10">
        {REGIONS.map(r => (
          <button key={r.id} onClick={() => { setRegion(r.id); setDest(null); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${region === r.id ? 'bg-[#0066cc] text-white border-[#0066cc]' : 'border-gray-200 text-gray-600 hover:border-[#0066cc] hover:text-[#0066cc]'}`}>
            {r.label}
          </button>
        ))}
      </div>

      {availDests.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 bg-gray-50 border-b border-gray-100">
          <button onClick={() => setDest(null)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border transition-colors ${!dest ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600'}`}>ทั้งหมด</button>
          {availDests.map(d => (
            <button key={d.id} onClick={() => setDest(d.name)} className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border transition-colors ${dest === d.name ? 'bg-gray-800 text-white border-gray-800' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>{d.name}</button>
          ))}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16"><div className="w-10 h-10 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(t => (
              <div key={t.id} onClick={() => nav('/tours/'+t.id)} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                <div className="relative aspect-square overflow-hidden">
                  <img src={t.coverImage || 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=400&q=80'} alt={t.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    {t.tags?.slice(0,2).map(tag => <span key={tag} className="bg-black/55 text-white text-xs px-2 py-0.5 rounded-full">{tag}</span>)}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{t.title}</h3>
                  <div className="flex gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" />{t.duration} วัน</span>
                    <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />{t.destination}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div><p className="text-xs text-gray-400">เริ่มต้น</p><p className="text-xl font-black text-[#0066cc] font-roboto">฿{t.price.toLocaleString()}</p></div>
                    <button className="bg-[#0066cc] text-white text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-[#0052a3]">ดูรายละเอียด</button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400">ไม่พบแพ็คเกจในหมวดนี้</div>}
          </div>
        )}
      </div>
    </div>
  );
}

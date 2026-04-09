import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ClockIcon, MapPinIcon, CalendarIcon, UtensilsIcon, BedDoubleIcon, ImageIcon, DownloadIcon } from 'lucide-react';
import { getTourDetail } from '../../api/tour';
import type { ITour } from '../../types';

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [tour, setTour] = useState<ITour | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { nav('/tours'); return; }
    getTourDetail(id).then(t => {
      if (t) {
        setTour(t);
        document.title = `${t.title} | Seacare Travel`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && t.description) metaDesc.setAttribute('content', t.description);
      } else nav('/tours');
    }).catch(() => nav('/tours')).finally(() => setLoading(false));
  }, [id, nav]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin" /></div>;
  if (!tour) return null;

  const img = tour.coverImage || 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800&q=80';

  const handleDownloadImage = async () => {
    if (!tour.coverImage) return;
    try {
      const res = await fetch(tour.coverImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tour.title}-cover.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(tour.coverImage, '_blank');
    }
  };

  return (
    <>
      <div>
        {/* Header bar with back button and title */}
        <div className="bg-gradient-to-br from-[#0066cc] to-[#0052a3] py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <button onClick={() => nav('/tours')} className="text-white/80 hover:text-white text-sm flex items-center gap-1 mb-4 transition-colors">
              <ChevronLeftIcon className="w-4 h-4" />กลับไปหน้าแพ็คเกจ
            </button>
            <div className="flex flex-wrap gap-2 mb-3">{tour.tags?.map(t => <span key={t} className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full">{t}</span>)}</div>
            <h1 className="text-2xl md:text-4xl font-black text-white mb-2">{tour.title}</h1>
            <div className="flex flex-wrap gap-4 text-white/85 text-sm">
              <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" />{tour.destination}</span>
              <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" />{tour.duration} วัน</span>
              <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" />{tour.departure}</span>
            </div>
          </div>
        </div>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-7">
              {/* Cover image - square 1:1 */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="aspect-square w-full">
                  <img src={img} alt={tour.title} className="w-full h-full object-cover object-center" />
                </div>
              </div>

              {tour.description && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-800 mb-3">ไฮไลท์ทริป</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{tour.description}</p>
                  <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={handleDownloadImage} className="flex items-center gap-2 bg-[#0066cc] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#0052a3] transition-colors">
                      <ImageIcon className="w-4 h-4" />ดาวน์โหลดภาพโปรแกรม
                    </button>
                    {tour.programUrl && (
                      <button onClick={() => window.open(tour.programUrl, '_blank')} className="flex items-center gap-2 border-2 border-[#0066cc] text-[#0066cc] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-blue-50 transition-colors">
                        <DownloadIcon className="w-4 h-4" />ดาวน์โหลดโปรแกรม
                      </button>
                    )}
                  </div>
                </div>
              )}
              {tour.itinerary && tour.itinerary.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-800 mb-5">กำหนดการเดินทาง</h2>
                  <div className="relative pl-8">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-blue-100" />
                    {tour.itinerary.map(day => (
                      <div key={day.day} className="relative mb-5">
                        <div className="absolute left-[-20px] top-1 w-6 h-6 rounded-full bg-[#0066cc] flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow">{day.day}</div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <h3 className="font-semibold text-gray-800 mb-2">{day.title}</h3>
                          <ul className="space-y-1 mb-3">{day.activities.map((a, i) => <li key={i} className="text-sm text-gray-600 flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0066cc] mt-2 flex-shrink-0" />{a}</li>)}</ul>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            {day.meals.length > 0 && <span className="flex items-center gap-1"><UtensilsIcon className="w-3.5 h-3.5" />{day.meals.join(', ')}</span>}
                            {day.accommodation && <span className="flex items-center gap-1"><BedDoubleIcon className="w-3.5 h-3.5" />{day.accommodation}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="sticky top-24 bg-white rounded-2xl p-6 border border-gray-100 shadow-lg">
                <p className="text-sm text-gray-400 mb-1">ราคาผู้ใหญ่</p>
                <p className="text-4xl font-black text-[#0066cc] font-roboto mb-1">฿{tour.price.toLocaleString()}</p>
                <p className="text-sm text-gray-400 mb-5">/ท่าน</p>
                <div className="space-y-2.5 border-t border-gray-100 pt-4 mb-5">
                  {[['จุดออกเดินทาง', tour.departure], ['จำนวนวัน', tour.duration+' วัน'], ['จุดหมาย', tour.destination]].map(([k,v]) => (
                    <div key={k as string} className="flex justify-between text-sm"><span className="text-gray-500">{k}</span><span className="font-medium text-gray-800">{v}</span></div>
                  ))}
                </div>
                <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) || nav('/about')} className="w-full bg-[#0066cc] text-white rounded-full py-3 font-semibold hover:bg-[#0052a3] transition-colors flex items-center justify-center gap-2">
                  สอบถามและจอง →
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">ไม่มีค่าใช้จ่ายแอบแฝง</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

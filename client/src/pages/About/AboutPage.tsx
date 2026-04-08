import { useState, useEffect } from 'react';
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon } from 'lucide-react';
import { getSettings, type SiteSettings } from '../../api/settings';

const TEAM = [
  { name: 'คุณวิภา', role: 'ผู้ก่อตั้งและ CEO', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', desc: 'ประสบการณ์ด้านการท่องเที่ยวกว่า 15 ปี' },
  { name: 'คุณสมศักดิ์', role: 'ผู้อำนวยการฝ่ายปฏิบัติการ', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', desc: 'เชี่ยวชาญการออกแบบผลิตภัณฑ์ท่องเที่ยว' },
  { name: 'คุณประภาพร', role: 'ผู้อำนวยการฝ่ายผลิตภัณฑ์', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', desc: 'นักวางแผนการเดินทางระดับสูง' },
  { name: 'คุณมานะ', role: 'ผู้อำนวยการฝ่ายบริการลูกค้า', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', desc: 'ประสบการณ์ด้านบริการกว่า 20 ปี' },
];

export default function AboutPage() {
  const [s, setS] = useState<SiteSettings | null>(null);
  useEffect(() => { getSettings().then(setS).catch(() => {}); }, []);

  const phone = s?.phone || '02-888-9999';
  const email = s?.email || 'contact@seacare-travel.co.th';
  const address = s?.address || 'อาคารสีลมคอมเพล็กซ์ ชั้น 18 กรุงเทพฯ';
  const lineId = s?.line_id || '@golfseacare';
  const facebookUrl = s?.facebook_url || 'https://www.facebook.com/share/14afZa69pXB/';
  const hours = s?.business_hours || 'จันทร์-อาทิตย์ 9:00-21:00 น.';

  return (
    <div>
      <div className="bg-gradient-to-br from-[#0066cc] to-[#0052a3] py-16 px-4 text-center">
        <h1 className="text-3xl font-black text-white mb-2">เกี่ยวกับเรา</h1>
        <p className="text-white/80 max-w-xl mx-auto">Seacare Travel — ผู้ให้บริการท่องเที่ยวระดับมืออาชีพ มุ่งมั่นสร้างประสบการณ์ที่น่าจดจำ</p>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
        {/* Team */}
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

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-black text-gray-800 mb-8 text-center">ติดต่อเรา</h2>
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: LINE QR */}
              <div className="bg-gray-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100">
                <img src="/line-qr.jpg" alt="LINE QR Code" className="w-[200px] h-[200px] rounded-2xl border-4 border-[#06C755]/30 shadow-md" />
                <div className="mt-4 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#06C755]"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
                  <span className="text-[#06C755] font-bold text-lg">{lineId}</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">สแกนเพื่อเพิ่มเพื่อน</p>
              </div>

              {/* Right: Contact info */}
              <div className="p-8 flex flex-col justify-center space-y-5">
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 group hover:bg-blue-50 rounded-xl p-3 -m-3 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-[#1877F2]/10 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1877F2]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Facebook</p>
                    <p className="font-semibold text-[#1877F2] text-sm group-hover:underline">Seacare Travel & Golf</p>
                  </div>
                </a>

                <a href={`tel:${phone.replace(/-/g, '')}`} className="flex items-center gap-4 hover:bg-blue-50 rounded-xl p-3 -m-3 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-5 h-5 text-[#0066cc]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">โทรศัพท์</p>
                    <p className="font-semibold text-gray-800 text-sm">{phone}</p>
                  </div>
                </a>

                <a href={`mailto:${email}`} className="flex items-center gap-4 hover:bg-blue-50 rounded-xl p-3 -m-3 transition-colors">
                  <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <MailIcon className="w-5 h-5 text-[#0066cc]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">อีเมล</p>
                    <p className="font-semibold text-gray-800 text-sm">{email}</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-3 -m-3">
                  <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="w-5 h-5 text-[#0066cc]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">ที่อยู่</p>
                    <p className="font-semibold text-gray-800 text-sm">{address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 -m-3">
                  <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <ClockIcon className="w-5 h-5 text-[#0066cc]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">เวลาทำการ</p>
                    <p className="font-semibold text-gray-800 text-sm">{hours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

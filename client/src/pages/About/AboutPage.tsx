import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon, ExternalLinkIcon } from 'lucide-react';

const TEAM = [
  { name: 'คุณวิภา', role: 'ผู้ก่อตั้งและ CEO', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', desc: 'ประสบการณ์ด้านการท่องเที่ยวกว่า 15 ปี' },
  { name: 'คุณสมศักดิ์', role: 'ผู้อำนวยการฝ่ายปฏิบัติการ', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', desc: 'เชี่ยวชาญการออกแบบผลิตภัณฑ์ท่องเที่ยว' },
  { name: 'คุณประภาพร', role: 'ผู้อำนวยการฝ่ายผลิตภัณฑ์', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', desc: 'นักวางแผนการเดินทางระดับสูง' },
  { name: 'คุณมานะ', role: 'ผู้อำนวยการฝ่ายบริการลูกค้า', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', desc: 'ประสบการณ์ด้านบริการกว่า 20 ปี' },
];

const INFO = [
  { icon: MapPinIcon, title: 'ที่อยู่', content: 'อาคารสีลมคอมเพล็กซ์ ชั้น 18 กรุงเทพฯ', sub: 'ยินดีต้อนรับการเยี่ยมชม' },
  { icon: ClockIcon, title: 'เวลาทำการ', content: 'จันทร์-อาทิตย์ 9:00-21:00 น.', sub: 'บริการทุกวัน' },
];

export default function AboutPage() {
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

        {/* Contact Cards */}
        <section>
          <h2 className="text-2xl font-black text-gray-800 mb-2 text-center">ติดต่อเรา</h2>
          <p className="text-gray-500 text-center mb-8">เลือกช่องทางที่สะดวกสำหรับคุณ</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* LINE */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group">
              <div className="bg-[#06C755] h-2" />
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#06C755]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#06C755]"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" /></svg>
                </div>
                <img src="/line-qr.jpg" alt="LINE QR Code" className="w-32 h-32 mx-auto rounded-xl mb-4 border-2 border-[#06C755]/20 shadow-sm" />
                <p className="font-bold text-gray-800 mb-1">Line@</p>
                <p className="text-[#06C755] font-semibold text-sm">@golfseacare</p>
              </div>
            </div>

            {/* Facebook */}
            <a href="https://www.facebook.com/share/14afZa69pXB/" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group block">
              <div className="bg-[#1877F2] h-2" />
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#1877F2]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#1877F2]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </div>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <p className="font-bold text-gray-800">Facebook</p>
                  <ExternalLinkIcon className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <p className="text-[#1877F2] font-semibold text-sm">Seacare Travel & Golf</p>
                <p className="text-xs text-gray-400 mt-2">คลิกเพื่อเยี่ยมชมเพจ</p>
              </div>
            </a>

            {/* Phone */}
            <a href="tel:028889999" className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group block">
              <div className="bg-[#0066cc] h-2" />
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#0066cc]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <PhoneIcon className="w-8 h-8 text-[#0066cc]" />
                </div>
                <p className="font-bold text-gray-800 mb-1">โทรศัพท์</p>
                <p className="text-[#0066cc] font-semibold text-lg">02-888-9999</p>
                <p className="text-xs text-gray-400 mt-2">บริการตลอด 24 ชั่วโมง</p>
              </div>
            </a>

            {/* Email */}
            <a href="mailto:contact@seacare-travel.co.th" className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group block">
              <div className="bg-[#EA4335] h-2" />
              <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#EA4335]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MailIcon className="w-8 h-8 text-[#EA4335]" />
                </div>
                <p className="font-bold text-gray-800 mb-1">อีเมล</p>
                <p className="text-[#EA4335] font-semibold text-sm">contact@seacare-travel.co.th</p>
                <p className="text-xs text-gray-400 mt-2">ตอบกลับภายใน 24 ชั่วโมง</p>
              </div>
            </a>
          </div>
        </section>

        {/* Address & Hours */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {INFO.map(c => (
              <div key={c.title} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <c.icon className="w-5 h-5 text-[#0066cc]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{c.title}</p>
                  <p className="font-semibold text-gray-800 text-sm">{c.content}</p>
                  <p className="text-xs text-gray-400">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

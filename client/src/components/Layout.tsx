import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { MenuIcon, XIcon, MapIcon, HomeIcon, InfoIcon } from 'lucide-react';
import ChatWidget from './ChatWidget';

const nav = [
  { to: '/', label: 'หน้าแรก', icon: HomeIcon, end: true },
  { to: '/tours', label: 'แพ็คเกจทัวร์', icon: MapIcon },
  { to: '/about', label: 'เกี่ยวกับเรา', icon: InfoIcon },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0066cc] shadow-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Seacare" className="h-9 w-auto" />
            <span className="text-white font-bold text-lg">Seacare Travel</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(n => (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-white/20 text-white' : 'text-white/85 hover:bg-white/10 hover:text-white'}`
                }>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/about" className="hidden md:block bg-white text-[#0066cc] px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-white/90 transition-colors">
            ติดต่อเรา
          </Link>
          <button className="md:hidden text-white p-2" onClick={() => setOpen(!open)}>
            {open ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden bg-[#0052a3] px-4 py-3 space-y-1">
            {nav.map(n => (
              <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-white/20 text-white' : 'text-white/85'}`
                }>
                <n.icon className="w-4 h-4" />{n.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>
      <main className="pt-16">
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-white/80 py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-[#0066cc] rounded-full flex items-center justify-center text-white font-bold text-xs">S</div>
              <span className="font-bold text-white">Seacare Travel</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">ผู้ให้บริการท่องเที่ยวมืออาชีพ มุ่งมั่นสร้างประสบการณ์การเดินทางที่น่าจดจำ</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">ลิงก์ด่วน</h4>
            {nav.map(n => <Link key={n.to} to={n.to} className="block text-sm text-white/60 hover:text-white mb-1">{n.label}</Link>)}
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">ติดต่อเรา</h4>
            <p className="text-sm text-white/60">โทร: 02-888-9999</p>
            <p className="text-sm text-white/60">อีเมล: contact@seacare-travel.co.th</p>
            <p className="text-sm text-white/60">อาคารสีลมคอมเพล็กซ์ ชั้น 18 กรุงเทพฯ</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/40">
          © 2026 Seacare Travel สงวนลิขสิทธิ์
        </div>
      </footer>
      <ChatWidget />
    </div>
  );
}

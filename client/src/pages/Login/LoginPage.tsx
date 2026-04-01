import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginStaff } from '../../api/staff';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';
import { Loader2Icon } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await loginStaff(username, password);
      login(user);
      navigate('/admin');
    } catch {
      toast.error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0066cc] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#0066cc] rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Seacare Travel</h1>
          <p className="text-sm text-gray-500 mt-1">เข้าสู่ระบบพนักงาน</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">ชื่อผู้ใช้</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]"
              placeholder="username" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">รหัสผ่าน</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc]"
              placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#0066cc] text-white rounded-full py-2.5 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#0052a3] transition-colors disabled:opacity-60">
            {loading && <Loader2Icon className="w-4 h-4 animate-spin" />}
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}

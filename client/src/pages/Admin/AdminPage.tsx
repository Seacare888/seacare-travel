import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, Trash2Icon, LogOutIcon, UsersIcon, MessageCircleIcon, SearchIcon, Loader2Icon, SaveIcon, XIcon } from 'lucide-react';
import { getTours, createTour, updateTour, deleteTour, getDestinations, createDestination, deleteDestination } from '../../api/tour';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../../api/staff';
import { useAuth } from '../../hooks/useAuth';
import type { ITour, IDestination, IStaff } from '../../types';
import { toast } from 'sonner';
import StaffChatDashboard from './StaffChatDashboard';

const REGIONS = [
  { value: 'asia', label: 'เอเชีย' },
  { value: 'europe', label: 'ยุโรป' },
  { value: 'america', label: 'อเมริกา' },
  { value: 'oceania', label: 'โอเชียเนีย' },
  { value: 'middle-east', label: 'ตะวันออกกลาง' },
];

type Tab = 'tours' | 'destinations' | 'staff' | 'chat';

export default function AdminPage() {
  const { user, isAdmin, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('tours');
  const [tours, setTours] = useState<ITour[]>([]);
  const [destinations, setDestinations] = useState<IDestination[]>([]);
  const [staff, setStaff] = useState<IStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tourDialog, setTourDialog] = useState(false);
  const [editTour, setEditTour] = useState<ITour | null>(null);
  const [staffDialog, setStaffDialog] = useState(false);
  const [editStaff, setEditStaff] = useState<IStaff | null>(null);
  const [destDialog, setDestDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [tf, setTf] = useState({ title: '', description: '', destination: '', region: 'asia', duration: 5, price: 0, departure: 'กรุงเทพฯ', coverImage: '', tags: '', status: 'active', featured: false });
  const [sf, setSf] = useState({ username: '', password: '', name: '', role: 'staff' });
  const [df, setDf] = useState({ name: '', nameEn: '', region: 'asia' });

  const load = async () => {
    setLoading(true);
    try {
      const [t, d, s] = await Promise.all([getTours({}), getDestinations({}), getAllStaff()]);
      setTours(t); setDestinations(d); setStaff(s);
    } catch { toast.error('โหลดข้อมูลไม่สำเร็จ'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleLogout = () => { logout(); nav('/login'); };

  const openTourCreate = () => {
    setEditTour(null);
    setTf({ title: '', description: '', destination: destinations[0]?.name || '', region: 'asia', duration: 5, price: 0, departure: 'กรุงเทพฯ', coverImage: '', tags: '', status: 'active', featured: false });
    setTourDialog(true);
  };

  const openTourEdit = (t: ITour) => {
    setEditTour(t);
    setTf({ title: t.title, description: t.description || '', destination: t.destination, region: t.region, duration: t.duration, price: t.price, departure: t.departure, coverImage: t.coverImage || '', tags: t.tags?.join(', ') || '', status: t.status || 'active', featured: t.featured || false });
    setTourDialog(true);
  };

  const saveTour = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data = { ...tf, duration: Number(tf.duration), price: Number(tf.price), tags: tf.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editTour) { await updateTour(editTour.id, data); toast.success('แก้ไขสำเร็จ'); }
      else { await createTour(data as any); toast.success('สร้างสำเร็จ'); }
      setTourDialog(false); load();
    } catch { toast.error('เกิดข้อผิดพลาด'); } finally { setSubmitting(false); }
  };

  const delTour = async (id: string) => {
    if (!confirm('ยืนยันการลบ?')) return;
    try { await deleteTour(id); toast.success('ลบสำเร็จ'); load(); } catch { toast.error('ลบไม่สำเร็จ'); }
  };

  const saveStaff = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editStaff) { await updateStaff(editStaff.id, { name: sf.name, role: sf.role, ...(sf.password ? { password: sf.password } : {}) }); toast.success('แก้ไขสำเร็จ'); }
      else { await createStaff(sf); toast.success('สร้างพนักงานสำเร็จ'); }
      setStaffDialog(false); load();
    } catch { toast.error('เกิดข้อผิดพลาด'); } finally { setSubmitting(false); }
  };

  const delStaff = async (id: string) => {
    if (!confirm('ยืนยันการลบ?')) return;
    try { await deleteStaff(id); toast.success('ลบสำเร็จ'); load(); } catch { toast.error('ลบไม่สำเร็จ'); }
  };

  const saveDest = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try { await createDestination(df as any); toast.success('เพิ่มจุดหมายสำเร็จ'); setDestDialog(false); load(); }
    catch { toast.error('เกิดข้อผิดพลาด'); } finally { setSubmitting(false); }
  };

  const filteredTours = tours.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.destination.toLowerCase().includes(search.toLowerCase()));

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'tours', label: 'แพ็คเกจทัวร์', icon: null },
    { id: 'destinations', label: 'จุดหมาย', icon: null },
    { id: 'staff', label: 'พนักงาน', icon: UsersIcon },
    { id: 'chat', label: 'แชท', icon: MessageCircleIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0066cc] text-white px-4 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">Seacare Travel — Admin</h1>
            <p className="text-white/70 text-xs mt-0.5">{user?.name} · {isAdmin ? 'ผู้ดูแลระบบ' : 'พนักงาน'}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm"><LogOutIcon className="w-4 h-4" />ออกจากระบบ</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-4">
        <div className="max-w-7xl mx-auto flex gap-0">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${tab === t.id ? 'border-[#0066cc] text-[#0066cc]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
              {t.icon && <t.icon className="w-4 h-4" />}{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Chat Tab */}
        {tab === 'chat' && <StaffChatDashboard />}

        {/* Tours Tab */}
        {tab === 'tours' && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="relative w-72">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#0066cc]" placeholder="ค้นหา..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button onClick={openTourCreate} className="bg-[#0066cc] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 hover:bg-[#0052a3]"><PlusIcon className="w-4 h-4" />เพิ่มแพ็คเกจ</button>
            </div>
            {loading ? <div className="text-center py-16"><Loader2Icon className="w-8 h-8 animate-spin text-[#0066cc] mx-auto" /></div> : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase">
                    <tr><th className="px-4 py-3 text-left">แพ็คเกจ</th><th className="px-4 py-3 text-left hidden md:table-cell">จุดหมาย</th><th className="px-4 py-3 text-left hidden sm:table-cell">ราคา</th><th className="px-4 py-3 text-left hidden sm:table-cell">สถานะ</th><th className="px-4 py-3 text-right">จัดการ</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredTours.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={t.coverImage || 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=80&q=60'} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="" />
                            <div><p className="font-medium text-sm text-gray-800 line-clamp-1">{t.title}</p><p className="text-xs text-gray-400">{t.duration} วัน</p></div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{t.destination}</td>
                        <td className="px-4 py-3 hidden sm:table-cell text-sm font-semibold text-[#0066cc] font-roboto">฿{t.price.toLocaleString()}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <div className="flex gap-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t.status === 'active' ? 'แสดง' : 'ซ่อน'}</span>
                            {t.featured && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">แนะนำ</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openTourEdit(t)} className="p-1.5 text-gray-400 hover:text-[#0066cc] hover:bg-blue-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                            {isAdmin && <button onClick={() => delTour(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2Icon className="w-4 h-4" /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTours.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">ไม่พบข้อมูล</p>}
              </div>
            )}
          </>
        )}

        {/* Destinations Tab */}
        {tab === 'destinations' && (
          <>
            <div className="flex justify-end mb-5">
              <button onClick={() => setDestDialog(true)} className="bg-[#0066cc] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 hover:bg-[#0052a3]"><PlusIcon className="w-4 h-4" />เพิ่มจุดหมาย</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {destinations.map(d => (
                <div key={d.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div><p className="font-medium text-sm text-gray-800">{d.name}</p><p className="text-xs text-gray-400">{d.region}</p></div>
                  {isAdmin && <button onClick={async () => { if (confirm('ลบ?')) { await deleteDestination(d.id); load(); } }} className="p-1.5 text-gray-300 hover:text-red-400"><Trash2Icon className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Staff Tab */}
        {tab === 'staff' && isAdmin && (
          <>
            <div className="flex justify-end mb-5">
              <button onClick={() => { setEditStaff(null); setSf({ username: '', password: '', name: '', role: 'staff' }); setStaffDialog(true); }} className="bg-[#0066cc] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 hover:bg-[#0052a3]"><PlusIcon className="w-4 h-4" />เพิ่มพนักงาน</button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase">
                  <tr><th className="px-4 py-3 text-left">ชื่อ</th><th className="px-4 py-3 text-left">username</th><th className="px-4 py-3 text-left">ตำแหน่ง</th><th className="px-4 py-3 text-left">สถานะ</th><th className="px-4 py-3 text-right">จัดการ</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {staff.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-sm text-gray-800">{s.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{s.username}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{s.role === 'admin' ? 'Admin' : 'พนักงาน'}</span></td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.status === 'active' ? 'ใช้งาน' : 'ปิด'}</span></td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditStaff(s); setSf({ username: s.username, password: '', name: s.name, role: s.role }); setStaffDialog(true); }} className="p-1.5 text-gray-400 hover:text-[#0066cc] hover:bg-blue-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                          <button onClick={() => delStaff(s.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2Icon className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Tour Dialog */}
      {tourDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setTourDialog(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editTour ? 'แก้ไขแพ็คเกจ' : 'เพิ่มแพ็คเกจใหม่'}</h3>
              <button onClick={() => setTourDialog(false)}><XIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={saveTour} className="p-5 space-y-4">
              <div><label className="text-xs font-medium text-gray-600 block mb-1">ชื่อแพ็คเกจ *</label><input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={tf.title} onChange={e => setTf({...tf, title: e.target.value})} /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">รายละเอียด</label><textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc] resize-none h-20" value={tf.description} onChange={e => setTf({...tf, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">ทวีป *</label>
                  <select required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={tf.region} onChange={e => setTf({...tf, region: e.target.value})}>
                    {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">จุดหมาย *</label>
                  <select required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={tf.destination} onChange={e => setTf({...tf, destination: e.target.value})}>
                    {destinations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">จำนวนวัน</label><input type="number" min={1} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={tf.duration} onChange={e => setTf({...tf, duration: Number(e.target.value)})} /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">ราคา (บาท)</label><input type="number" min={0} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={tf.price} onChange={e => setTf({...tf, price: Number(e.target.value)})} /></div>
              </div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">รูปภาพ (URL)</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" placeholder="https://..." value={tf.coverImage} onChange={e => setTf({...tf, coverImage: e.target.value})} /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">แท็ก (คั่นด้วย ,)</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" placeholder="ช้อปปิ้ง, ธรรมชาติ" value={tf.tags} onChange={e => setTf({...tf, tags: e.target.value})} /></div>
              <div className="flex gap-4">
                <div className="flex-1"><label className="text-xs font-medium text-gray-600 block mb-1">สถานะ</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={tf.status} onChange={e => setTf({...tf, status: e.target.value})}>
                    <option value="active">แสดง</option><option value="inactive">ซ่อน</option>
                  </select>
                </div>
                <div className="flex items-end pb-2 gap-2">
                  <input type="checkbox" id="featured" checked={tf.featured} onChange={e => setTf({...tf, featured: e.target.checked})} className="w-4 h-4 accent-[#0066cc]" />
                  <label htmlFor="featured" className="text-sm text-gray-600">แนะนำ (แสดงหน้าแรก)</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setTourDialog(false)} className="px-5 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50">ยกเลิก</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-[#0066cc] text-white rounded-full text-sm font-semibold flex items-center gap-1.5 hover:bg-[#0052a3] disabled:opacity-60">
                  {submitting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Dialog */}
      {staffDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setStaffDialog(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editStaff ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน'}</h3>
              <button onClick={() => setStaffDialog(false)}><XIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={saveStaff} className="p-5 space-y-3">
              {!editStaff && <div><label className="text-xs font-medium text-gray-600 block mb-1">Username *</label><input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={sf.username} onChange={e => setSf({...sf, username: e.target.value})} /></div>}
              <div><label className="text-xs font-medium text-gray-600 block mb-1">ชื่อ *</label><input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={sf.name} onChange={e => setSf({...sf, name: e.target.value})} /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">รหัสผ่าน {editStaff && '(เว้นว่างถ้าไม่เปลี่ยน)'}</label><input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={sf.password} onChange={e => setSf({...sf, password: e.target.value})} required={!editStaff} /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">ตำแหน่ง</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={sf.role} onChange={e => setSf({...sf, role: e.target.value})}>
                  <option value="staff">พนักงาน</option><option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setStaffDialog(false)} className="px-5 py-2 border border-gray-200 rounded-full text-sm text-gray-600">ยกเลิก</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-[#0066cc] text-white rounded-full text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60">
                  {submitting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Destination Dialog */}
      {destDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDestDialog(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">เพิ่มจุดหมาย</h3>
              <button onClick={() => setDestDialog(false)}><XIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={saveDest} className="p-5 space-y-3">
              <div><label className="text-xs font-medium text-gray-600 block mb-1">ชื่อ (ภาษาไทย) *</label><input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={df.name} onChange={e => setDf({...df, name: e.target.value})} /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">ชื่อ (ภาษาอังกฤษ)</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={df.nameEn} onChange={e => setDf({...df, nameEn: e.target.value})} /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">ทวีป</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={df.region} onChange={e => setDf({...df, region: e.target.value})}>
                  {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setDestDialog(false)} className="px-5 py-2 border border-gray-200 rounded-full text-sm text-gray-600">ยกเลิก</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-[#0066cc] text-white rounded-full text-sm font-semibold disabled:opacity-60">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

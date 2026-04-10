import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, Trash2Icon, LogOutIcon, UsersIcon, MessageCircleIcon, SearchIcon, Loader2Icon, SaveIcon, XIcon, SettingsIcon, PlaneIcon, ArchiveRestoreIcon } from 'lucide-react';
import { getTours, createTour, updateTour, deleteTour, getDeletedTours, restoreTour, hardDeleteTour, getDestinations, createDestination, deleteDestination } from '../../api/tour';
import { getAllStaff, createStaff, updateStaff, deleteStaff } from '../../api/staff';
import { getSettings, updateSettings, type SiteSettings } from '../../api/settings';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, type ITeamMember } from '../../api/team';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, type ITestimonial } from '../../api/testimonial';
import { getDepartures, createDeparture, updateDeparture, deleteDeparture, type IDeparture } from '../../api/departure';
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

type Tab = 'tours' | 'destinations' | 'staff' | 'chat' | 'settings' | 'team' | 'testimonials' | 'departures';

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

  const [tf, setTf] = useState({ title: '', description: '', destination: '', region: 'asia', duration: 5, price: 0, departure: 'กรุงเทพฯ', coverImage: '', tags: '', status: 'active', featured: false, programUrl: '' });
  const [sf, setSf] = useState({ username: '', password: '', name: '', role: 'staff' });
  const [df, setDf] = useState({ name: '', nameEn: '', region: 'asia' });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ phone: '', email: '', address: '', line_id: '', facebook_url: '', business_hours: '', company_name: '', company_slogan: '', about_intro: '', about_vision: '', about_mission: '', hero_title: '', hero_subtitle: '', hero_image: '' });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [teamMembers, setTeamMembers] = useState<ITeamMember[]>([]);
  const [teamDialog, setTeamDialog] = useState(false);
  const [editTeamMember, setEditTeamMember] = useState<ITeamMember | null>(null);
  const [tmf, setTmf] = useState({ name: '', role: '', description: '', avatarUrl: '', sortOrder: 0, status: 'active' });
  const [testimonialsList, setTestimonialsList] = useState<ITestimonial[]>([]);
  const [testimonialDialog, setTestimonialDialog] = useState(false);
  const [editTestimonial, setEditTestimonial] = useState<ITestimonial | null>(null);
  const [rvf, setRvf] = useState({ customerName: '', avatarUrl: '', content: '', rating: 5, tourName: '', sortOrder: 0, status: 'active' });
  const [departuresList, setDeparturesList] = useState<IDeparture[]>([]);
  const [departureDialog, setDepartureDialog] = useState(false);
  const [editDeparture, setEditDeparture] = useState<IDeparture | null>(null);
  const [depf, setDepf] = useState({ tourId: '', departureDate: '', returnDate: '', originalPrice: 0, promoPrice: 0, seatsLeft: 0, status: 'available', note: '' });
  const [showTrash, setShowTrash] = useState(false);
  const [deletedTours, setDeletedTours] = useState<ITour[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [t, d, s, st, tm, rv, dep] = await Promise.all([getTours({}), getDestinations({}), getAllStaff(), getSettings(), getTeamMembers(), getTestimonials(), getDepartures()]);
      setTours(t); setDestinations(d); setStaff(s); setSiteSettings(st); setTeamMembers(tm); setTestimonialsList(rv); setDeparturesList(dep);
    } catch { toast.error('โหลดข้อมูลไม่สำเร็จ'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleLogout = () => { logout(); nav('/login'); };

  const openTourCreate = () => {
    setEditTour(null);
    setTf({ title: '', description: '', destination: destinations[0]?.name || '', region: 'asia', duration: 5, price: 0, departure: 'กรุงเทพฯ', coverImage: '', tags: '', status: 'active', featured: false, programUrl: '' });
    setTourDialog(true);
  };

  const openTourEdit = (t: ITour) => {
    setEditTour(t);
    setTf({ title: t.title, description: t.description || '', destination: t.destination, region: t.region, duration: t.duration, price: t.price, departure: t.departure, coverImage: t.coverImage || '', tags: t.tags?.join(', ') || '', status: t.status || 'active', featured: t.featured || false, programUrl: t.programUrl || '' });
    setTourDialog(true);
  };

  const saveTour = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data = { ...tf, duration: Number(tf.duration), price: Number(tf.price), tags: tf.tags.split(',').map(t => t.trim()).filter(Boolean), programUrl: tf.programUrl || null };
      if (editTour) { await updateTour(editTour.id, data); toast.success('แก้ไขสำเร็จ'); }
      else { await createTour(data as any); toast.success('สร้างสำเร็จ'); }
      setTourDialog(false); load();
    } catch { toast.error('เกิดข้อผิดพลาด'); } finally { setSubmitting(false); }
  };

  const delTour = async (id: string) => {
    if (!confirm('ยืนยันการลบแพ็คเกจ?')) return;
    try { await deleteTour(id); toast.success('ย้ายไปถังขยะสำเร็จ'); load(); loadTrash(); } catch { toast.error('ลบไม่สำเร็จ'); }
  };

  const loadTrash = async () => {
    try { const d = await getDeletedTours(); setDeletedTours(d); } catch { /* ignore */ }
  };

  const handleRestore = async (id: string) => {
    if (!confirm('ยืนยันการกู้คืนแพ็คเกจ?')) return;
    try { await restoreTour(id); toast.success('กู้คืนแพ็คเกจสำเร็จ'); load(); loadTrash(); } catch { toast.error('กู้คืนไม่สำเร็จ'); }
  };

  const handleHardDelete = async (id: string) => {
    if (!confirm('ลบถาวร? ไม่สามารถกู้คืนได้')) return;
    try { await hardDeleteTour(id); toast.success('ลบถาวรสำเร็จ'); loadTrash(); } catch { toast.error('ลบไม่สำเร็จ'); }
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
    { id: 'team', label: 'ทีมงาน', icon: UsersIcon },
    { id: 'testimonials', label: 'รีวิว', icon: MessageCircleIcon },
    { id: 'departures', label: 'กรุ๊ปออกเดินทาง', icon: PlaneIcon },
    { id: 'settings', label: 'ตั้งค่า', icon: SettingsIcon },
  ];

  const openTeamCreate = () => {
    setEditTeamMember(null);
    setTmf({ name: '', role: '', description: '', avatarUrl: '', sortOrder: teamMembers.length + 1, status: 'active' });
    setTeamDialog(true);
  };

  const openTeamEdit = (m: ITeamMember) => {
    setEditTeamMember(m);
    setTmf({ name: m.name, role: m.role, description: m.description || '', avatarUrl: m.avatarUrl || '', sortOrder: m.sortOrder, status: m.status });
    setTeamDialog(true);
  };

  const saveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data = { ...tmf, sortOrder: Number(tmf.sortOrder) };
      if (editTeamMember) { await updateTeamMember(editTeamMember.id, data); toast.success('แก้ไขสำเร็จ'); }
      else { await createTeamMember(data); toast.success('เพิ่มสมาชิกสำเร็จ'); }
      setTeamDialog(false); load();
    } catch { toast.error('เกิดข้อผิดพลาด'); } finally { setSubmitting(false); }
  };

  const delTeamMember = async (id: string) => {
    if (!confirm('ยืนยันการลบ?')) return;
    try { await deleteTeamMember(id); toast.success('ลบสำเร็จ'); load(); } catch { toast.error('ลบไม่สำเร็จ'); }
  };

  const openTestimonialCreate = () => {
    setEditTestimonial(null);
    setRvf({ customerName: '', avatarUrl: '', content: '', rating: 5, tourName: '', sortOrder: testimonialsList.length + 1, status: 'active' });
    setTestimonialDialog(true);
  };

  const openTestimonialEdit = (t: ITestimonial) => {
    setEditTestimonial(t);
    setRvf({ customerName: t.customerName, avatarUrl: t.avatarUrl || '', content: t.content, rating: t.rating, tourName: t.tourName || '', sortOrder: t.sortOrder, status: t.status });
    setTestimonialDialog(true);
  };

  const saveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data = { ...rvf, rating: Number(rvf.rating), sortOrder: Number(rvf.sortOrder) };
      if (editTestimonial) { await updateTestimonial(editTestimonial.id, data); toast.success('แก้ไขสำเร็จ'); }
      else { await createTestimonial(data); toast.success('เพิ่มรีวิวสำเร็จ'); }
      setTestimonialDialog(false); load();
    } catch { toast.error('เกิดข้อผิดพลาด'); } finally { setSubmitting(false); }
  };

  const delTestimonial = async (id: string) => {
    if (!confirm('ยืนยันการลบ?')) return;
    try { await deleteTestimonial(id); toast.success('ลบสำเร็จ'); load(); } catch { toast.error('ลบไม่สำเร็จ'); }
  };

  const openDepartureCreate = () => {
    setEditDeparture(null);
    setDepf({ tourId: tours[0]?.id || '', departureDate: '', returnDate: '', originalPrice: 0, promoPrice: 0, seatsLeft: 0, status: 'available', note: '' });
    setDepartureDialog(true);
  };

  const openDepartureEdit = (d: IDeparture) => {
    setEditDeparture(d);
    setDepf({ tourId: d.tourId, departureDate: d.departureDate, returnDate: d.returnDate || '', originalPrice: d.originalPrice || 0, promoPrice: d.promoPrice, seatsLeft: d.seatsLeft, status: d.status, note: d.note || '' });
    setDepartureDialog(true);
  };

  const saveDeparture = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const data = { ...depf, originalPrice: Number(depf.originalPrice) || null, promoPrice: Number(depf.promoPrice), seatsLeft: Number(depf.seatsLeft) };
      if (editDeparture) { await updateDeparture(editDeparture.id, data); toast.success('แก้ไขสำเร็จ'); }
      else { await createDeparture(data); toast.success('เพิ่มกรุ๊ปสำเร็จ'); }
      setDepartureDialog(false); load();
    } catch { toast.error('เกิดข้อผิดพลาด'); } finally { setSubmitting(false); }
  };

  const delDeparture = async (id: string) => {
    if (!confirm('ยืนยันการลบ?')) return;
    try { await deleteDeparture(id); toast.success('ลบสำเร็จ'); load(); } catch { toast.error('ลบไม่สำเร็จ'); }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault(); setSettingsSaving(true);
    try { const r = await updateSettings(siteSettings); setSiteSettings(r); toast.success('บันทึกการตั้งค่าสำเร็จ'); }
    catch { toast.error('บันทึกไม่สำเร็จ'); }
    finally { setSettingsSaving(false); }
  };

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
              <div className="flex items-center gap-2">
                {isAdmin && <button onClick={() => { setShowTrash(!showTrash); if (!showTrash) loadTrash(); }} className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 border ${showTrash ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}><Trash2Icon className="w-4 h-4" />ถังขยะ{deletedTours.length > 0 && ` (${deletedTours.length})`}</button>}
                <button onClick={openTourCreate} className="bg-[#0066cc] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 hover:bg-[#0052a3]"><PlusIcon className="w-4 h-4" />เพิ่มแพ็คเกจ</button>
              </div>
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
            {showTrash && isAdmin && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-1.5"><Trash2Icon className="w-4 h-4" />ถังขยะ</h3>
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-red-50 text-xs text-red-500 font-semibold uppercase">
                      <tr><th className="px-4 py-3 text-left">แพ็คเกจ</th><th className="px-4 py-3 text-left hidden md:table-cell">จุดหมาย</th><th className="px-4 py-3 text-left hidden sm:table-cell">ราคา</th><th className="px-4 py-3 text-right">จัดการ</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {deletedTours.map(t => (
                        <tr key={t.id} className="hover:bg-red-50/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={t.coverImage || 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=80&q=60'} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 opacity-60" alt="" />
                              <div><p className="font-medium text-sm text-gray-500 line-clamp-1">{t.title}</p><p className="text-xs text-gray-400">{t.duration} วัน</p></div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-400">{t.destination}</td>
                          <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-400">฿{t.price.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleRestore(t.id)} className="px-3 py-1 text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 rounded-full flex items-center gap-1"><ArchiveRestoreIcon className="w-3.5 h-3.5" />กู้คืน</button>
                              <button onClick={() => handleHardDelete(t.id)} className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-full flex items-center gap-1"><Trash2Icon className="w-3.5 h-3.5" />ลบถาวร</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {deletedTours.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">ถังขยะว่างเปล่า</p>}
                </div>
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

        {/* Team Tab */}
        {tab === 'team' && (
          <>
            <div className="flex justify-end mb-5">
              <button onClick={openTeamCreate} className="bg-[#0066cc] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 hover:bg-[#0052a3]"><PlusIcon className="w-4 h-4" />เพิ่มสมาชิก</button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase">
                  <tr><th className="px-4 py-3 text-left">สมาชิก</th><th className="px-4 py-3 text-left hidden md:table-cell">ตำแหน่ง</th><th className="px-4 py-3 text-left hidden sm:table-cell">ลำดับ</th><th className="px-4 py-3 text-left hidden sm:table-cell">สถานะ</th><th className="px-4 py-3 text-right">จัดการ</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {teamMembers.map(m => (
                    <tr key={m.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={m.avatarUrl || 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=80&q=60'} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                          <div><p className="font-medium text-sm text-gray-800">{m.name}</p><p className="text-xs text-gray-400 line-clamp-1">{m.description}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{m.role}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-500">{m.sortOrder}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{m.status === 'active' ? 'แสดง' : 'ซ่อน'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openTeamEdit(m)} className="p-1.5 text-gray-400 hover:text-[#0066cc] hover:bg-blue-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                          {isAdmin && <button onClick={() => delTeamMember(m.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2Icon className="w-4 h-4" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {teamMembers.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">ไม่มีสมาชิก</p>}
            </div>
          </>
        )}

        {/* Testimonials Tab */}
        {tab === 'testimonials' && (
          <>
            <div className="flex justify-end mb-5">
              <button onClick={openTestimonialCreate} className="bg-[#0066cc] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 hover:bg-[#0052a3]"><PlusIcon className="w-4 h-4" />เพิ่มรีวิว</button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase">
                  <tr><th className="px-4 py-3 text-left">ลูกค้า</th><th className="px-4 py-3 text-left hidden md:table-cell">รีวิว</th><th className="px-4 py-3 text-left hidden sm:table-cell">คะแนน</th><th className="px-4 py-3 text-left hidden sm:table-cell">สถานะ</th><th className="px-4 py-3 text-right">จัดการ</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {testimonialsList.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={t.avatarUrl || 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=80&q=60'} className="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                          <div><p className="font-medium text-sm text-gray-800">{t.customerName}</p><p className="text-xs text-gray-400">{t.tourName}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600 max-w-xs truncate">{t.content}</td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm text-yellow-500 font-semibold">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t.status === 'active' ? 'แสดง' : 'ซ่อน'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openTestimonialEdit(t)} className="p-1.5 text-gray-400 hover:text-[#0066cc] hover:bg-blue-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                          {isAdmin && <button onClick={() => delTestimonial(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2Icon className="w-4 h-4" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {testimonialsList.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">ไม่มีรีวิว</p>}
            </div>
          </>
        )}

        {/* Departures Tab */}
        {tab === 'departures' && (
          <>
            <div className="flex justify-end mb-5">
              <button onClick={openDepartureCreate} className="bg-[#0066cc] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5 hover:bg-[#0052a3]"><PlusIcon className="w-4 h-4" />เพิ่มกรุ๊ป</button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-500 font-semibold uppercase">
                  <tr><th className="px-4 py-3 text-left">แพ็คเกจ</th><th className="px-4 py-3 text-left hidden md:table-cell">วันออกเดินทาง</th><th className="px-4 py-3 text-left hidden sm:table-cell">ราคาโปร</th><th className="px-4 py-3 text-left hidden sm:table-cell">ที่เหลือ</th><th className="px-4 py-3 text-left hidden sm:table-cell">สถานะ</th><th className="px-4 py-3 text-right">จัดการ</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {departuresList.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm text-gray-800 line-clamp-1">{d.tourTitle || '-'}</p>
                        <p className="text-xs text-gray-400">{d.tourDestination}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{d.departureDate}{d.returnDate ? ` — ${d.returnDate}` : ''}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div>
                          {d.originalPrice ? <span className="text-xs text-gray-400 line-through mr-1">฿{d.originalPrice.toLocaleString()}</span> : null}
                          <span className="text-sm font-semibold text-red-600">฿{d.promoPrice.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600">{d.seatsLeft} ที่นั่ง</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === 'available' ? 'bg-green-100 text-green-700' : d.status === 'full' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                          {d.status === 'available' ? 'ว่าง' : d.status === 'full' ? 'เต็ม' : 'ยกเลิก'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openDepartureEdit(d)} className="p-1.5 text-gray-400 hover:text-[#0066cc] hover:bg-blue-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                          {isAdmin && <button onClick={() => delDeparture(d.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2Icon className="w-4 h-4" /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {departuresList.length === 0 && <p className="text-center py-10 text-gray-400 text-sm">ไม่มีกรุ๊ปออกเดินทาง</p>}
            </div>
          </>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <form onSubmit={saveSettings} className="space-y-6">
              {/* Hero Settings */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">หน้าแรก (Hero)</h2>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">หัวข้อหลัก</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={siteSettings.hero_title} onChange={e => setSiteSettings({...siteSettings, hero_title: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">หัวข้อรอง</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={siteSettings.hero_subtitle} onChange={e => setSiteSettings({...siteSettings, hero_subtitle: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">รูปพื้นหลัง (URL)</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" placeholder="https://..." value={siteSettings.hero_image} onChange={e => setSiteSettings({...siteSettings, hero_image: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">ข้อมูลบริษัท</h2>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">ชื่อบริษัท</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={siteSettings.company_name} onChange={e => setSiteSettings({...siteSettings, company_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">สโลแกน</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={siteSettings.company_slogan} onChange={e => setSiteSettings({...siteSettings, company_slogan: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">แนะนำบริษัท (เกี่ยวกับเรา)</label>
                    <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc] resize-none h-20" value={siteSettings.about_intro} onChange={e => setSiteSettings({...siteSettings, about_intro: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">วิสัยทัศน์</label>
                    <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc] resize-none h-16" value={siteSettings.about_vision} onChange={e => setSiteSettings({...siteSettings, about_vision: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">พันธกิจ</label>
                    <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc] resize-none h-16" value={siteSettings.about_mission} onChange={e => setSiteSettings({...siteSettings, about_mission: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">ข้อมูลติดต่อ</h2>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">เบอร์โทรศัพท์</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={siteSettings.phone} onChange={e => setSiteSettings({...siteSettings, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">อีเมล</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={siteSettings.email} onChange={e => setSiteSettings({...siteSettings, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">ที่อยู่</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={siteSettings.address} onChange={e => setSiteSettings({...siteSettings, address: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">LINE ID</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={siteSettings.line_id} onChange={e => setSiteSettings({...siteSettings, line_id: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Facebook URL</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={siteSettings.facebook_url} onChange={e => setSiteSettings({...siteSettings, facebook_url: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">เวลาทำการ</label>
                    <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={siteSettings.business_hours} onChange={e => setSiteSettings({...siteSettings, business_hours: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={settingsSaving} className="px-5 py-2 bg-[#0066cc] text-white rounded-full text-sm font-semibold flex items-center gap-1.5 hover:bg-[#0052a3] disabled:opacity-60">
                  {settingsSaving ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}บันทึกทั้งหมด
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Tour Dialog */}
      {tourDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <div><label className="text-xs font-medium text-gray-600 block mb-1">ลิงก์ดาวน์โหลดโปรแกรม (Google Drive)</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" placeholder="https://drive.google.com/..." value={tf.programUrl} onChange={e => setTf({...tf, programUrl: e.target.value})} /></div>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm">
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

      {/* Team Member Dialog */}
      {teamDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editTeamMember ? 'แก้ไขสมาชิก' : 'เพิ่มสมาชิก'}</h3>
              <button onClick={() => setTeamDialog(false)}><XIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={saveTeamMember} className="p-5 space-y-3">
              <div><label className="text-xs font-medium text-gray-600 block mb-1">ชื่อ *</label><input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={tmf.name} onChange={e => setTmf({...tmf, name: e.target.value})} /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">ตำแหน่ง *</label><input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={tmf.role} onChange={e => setTmf({...tmf, role: e.target.value})} /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">คำอธิบาย</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={tmf.description} onChange={e => setTmf({...tmf, description: e.target.value})} /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">รูปโปรไฟล์ (URL)</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" placeholder="https://..." value={tmf.avatarUrl} onChange={e => setTmf({...tmf, avatarUrl: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">ลำดับ</label><input type="number" min={0} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={tmf.sortOrder} onChange={e => setTmf({...tmf, sortOrder: Number(e.target.value)})} /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">สถานะ</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={tmf.status} onChange={e => setTmf({...tmf, status: e.target.value})}>
                    <option value="active">แสดง</option><option value="inactive">ซ่อน</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setTeamDialog(false)} className="px-5 py-2 border border-gray-200 rounded-full text-sm text-gray-600">ยกเลิก</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-[#0066cc] text-white rounded-full text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60">
                  {submitting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Departure Dialog */}
      {departureDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editDeparture ? 'แก้ไขกรุ๊ป' : 'เพิ่มกรุ๊ปใหม่'}</h3>
              <button onClick={() => setDepartureDialog(false)}><XIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={saveDeparture} className="p-5 space-y-3">
              <div><label className="text-xs font-medium text-gray-600 block mb-1">แพ็คเกจ *</label>
                <select required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={depf.tourId} onChange={e => setDepf({...depf, tourId: e.target.value})}>
                  <option value="">เลือกแพ็คเกจ</option>
                  {tours.map(t => <option key={t.id} value={t.id}>{t.title} ({t.destination})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">วันออกเดินทาง *</label><input required type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={depf.departureDate} onChange={e => setDepf({...depf, departureDate: e.target.value})} /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">วันกลับ</label><input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={depf.returnDate} onChange={e => setDepf({...depf, returnDate: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">ราคาเดิม (บาท)</label><input type="number" min={0} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={depf.originalPrice} onChange={e => setDepf({...depf, originalPrice: Number(e.target.value)})} /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">ราคาโปร (บาท) *</label><input required type="number" min={0} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={depf.promoPrice} onChange={e => setDepf({...depf, promoPrice: Number(e.target.value)})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">ที่นั่งเหลือ</label><input type="number" min={0} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={depf.seatsLeft} onChange={e => setDepf({...depf, seatsLeft: Number(e.target.value)})} /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">สถานะ</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={depf.status} onChange={e => setDepf({...depf, status: e.target.value})}>
                    <option value="available">ว่าง</option><option value="full">เต็ม</option><option value="cancelled">ยกเลิก</option>
                  </select>
                </div>
              </div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">หมายเหตุ</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={depf.note} onChange={e => setDepf({...depf, note: e.target.value})} /></div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setDepartureDialog(false)} className="px-5 py-2 border border-gray-200 rounded-full text-sm text-gray-600">ยกเลิก</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-[#0066cc] text-white rounded-full text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60">
                  {submitting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Dialog */}
      {testimonialDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editTestimonial ? 'แก้ไขรีวิว' : 'เพิ่มรีวิว'}</h3>
              <button onClick={() => setTestimonialDialog(false)}><XIcon className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={saveTestimonial} className="p-5 space-y-3">
              <div><label className="text-xs font-medium text-gray-600 block mb-1">ชื่อลูกค้า *</label><input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={rvf.customerName} onChange={e => setRvf({...rvf, customerName: e.target.value})} /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">รูปโปรไฟล์ (URL)</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" placeholder="https://..." value={rvf.avatarUrl} onChange={e => setRvf({...rvf, avatarUrl: e.target.value})} /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">เนื้อหารีวิว *</label><textarea required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc] resize-none h-20" value={rvf.content} onChange={e => setRvf({...rvf, content: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">คะแนน (1-5)</label><input type="number" min={1} max={5} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={rvf.rating} onChange={e => setRvf({...rvf, rating: Number(e.target.value)})} /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">ลำดับ</label><input type="number" min={0} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={rvf.sortOrder} onChange={e => setRvf({...rvf, sortOrder: Number(e.target.value)})} /></div>
              </div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">ชื่อแพ็คเกจ</label><input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={rvf.tourName} onChange={e => setRvf({...rvf, tourName: e.target.value})} /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">สถานะ</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0066cc]" value={rvf.status} onChange={e => setRvf({...rvf, status: e.target.value})}>
                  <option value="active">แสดง</option><option value="inactive">ซ่อน</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setTestimonialDialog(false)} className="px-5 py-2 border border-gray-200 rounded-full text-sm text-gray-600">ยกเลิก</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-[#0066cc] text-white rounded-full text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60">
                  {submitting ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <SaveIcon className="w-4 h-4" />}บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

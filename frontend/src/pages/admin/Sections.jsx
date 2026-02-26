import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Plus, Pencil, Trash2, Layers, Search, Eye } from 'lucide-react';

export default function Sections() {
    const [sections, setSections] = useState([]);
    const [majors, setMajors] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
    const [form, setForm] = useState({ name: '', code: '', major: '', academicYear: '', level: '', description: '' });

    const fetchData = async () => {
        try {
            const [s, m, y, l] = await Promise.all([api.get('/admin/sections'), api.get('/admin/majors'), api.get('/admin/academic-years'), api.get('/admin/levels')]);
            setSections(s.data); setMajors(m.data); setAcademicYears(y.data); setLevels(l.data);
        } catch { toast.error('โหลดข้อมูลล้มเหลว'); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const openCreate = () => { setForm({ name: '', code: '', major: '', academicYear: '', level: '', description: '' }); setModal({ open: true, mode: 'create', data: null }); };
    const openEdit = (s) => { setForm({ name: s.name || '', code: s.code || '', major: s.major?._id || '', academicYear: s.academicYear?._id || '', level: s.level?._id || '', description: s.description || '' }); setModal({ open: true, mode: 'edit', data: s }); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modal.mode === 'create') { await api.post('/admin/sections', form); toast.success('เพิ่มห้องเรียนสำเร็จ'); }
            else { await api.put(`/admin/sections/${modal.data._id}`, form); toast.success('แก้ไขสำเร็จ'); }
            setModal({ open: false, mode: 'create', data: null }); fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('ยืนยันลบห้องเรียนนี้?')) return;
        try { await api.delete(`/admin/sections/${id}`); toast.success('ลบสำเร็จ'); fetchData(); }
        catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    const filtered = sections.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.code?.toLowerCase().includes(search.toLowerCase()));

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22d3ee, #3b82f6)' }}>
                        <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900">ห้องเรียน</h1>
                        <p className="text-surface-500 text-sm mt-0.5">จัดการข้อมูลห้องเรียน</p>
                    </div>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all text-sm font-semibold hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 15px rgba(109,62,242,0.25)' }}><Plus className="w-4 h-4" />เพิ่มห้องเรียน</button>
            </div>

            <div className="rounded-2xl space-card">
                <div className="p-4 border-b border-surface-100">
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input type="text" placeholder="ค้นหาห้องเรียน..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" /></div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr className="border-b border-surface-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">ห้องเรียน</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">สาขา / แผนก</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">ปีการศึกษา</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">ระดับชั้น</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase">จัดการ</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s._id} className="border-b border-surface-50 hover:bg-primary-50/30 transition-colors">
                                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-cyan-50 rounded-xl flex items-center justify-center"><Layers className="w-4 h-4 text-cyan-500" /></div>
                                        <div><p className="font-medium text-surface-800 text-sm">{s.name}</p><p className="text-xs text-surface-400">{s.code}</p></div></div></td>
                                    <td className="px-6 py-4 text-sm text-surface-600">{s.major?.name || '-'} <span className="text-surface-400">/ {s.major?.department?.name || '-'}</span></td>
                                    <td className="px-6 py-4 text-sm text-surface-600">{s.academicYear?.name || '-'}</td>
                                    <td className="px-6 py-4 text-sm text-surface-600">{s.level?.name || '-'}</td>
                                    <td className="px-6 py-4"><div className="flex items-center justify-center gap-1">
                                        <button onClick={() => openEdit(s)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(s._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div></td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-surface-400 text-sm">ไม่พบข้อมูล</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'เพิ่มห้องเรียน' : 'แก้ไขห้องเรียน'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-surface-600 mb-1">ชื่อห้อง *</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" /></div>
                        <div><label className="block text-sm font-medium text-surface-600 mb-1">รหัสห้อง *</label>
                            <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-surface-600 mb-1">สาขาวิชา</label>
                        <select value={form.major} onChange={e => setForm({ ...form, major: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm">
                            <option value="">เลือกสาขาวิชา</option>{majors.map(m => <option key={m._id} value={m._id}>{m.name} ({m.department?.name})</option>)}
                        </select></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-surface-600 mb-1">ปีการศึกษา</label>
                            <select value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm">
                                <option value="">เลือกปีการศึกษา</option>{academicYears.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
                            </select></div>
                        <div><label className="block text-sm font-medium text-surface-600 mb-1">ระดับชั้น</label>
                            <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm">
                                <option value="">เลือกระดับชั้น</option>{levels.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
                            </select></div>
                    </div>
                    <div><label className="block text-sm font-medium text-surface-600 mb-1">รายละเอียด</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" /></div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal({ open: false, mode: 'create', data: null })} className="px-5 py-2.5 bg-surface-100 text-surface-600 rounded-xl text-sm font-medium hover:bg-surface-200 transition-colors">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 12px rgba(109,62,242,0.25)' }}>{modal.mode === 'create' ? 'เพิ่ม' : 'บันทึก'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

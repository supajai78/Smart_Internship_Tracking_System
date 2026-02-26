import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Plus, Pencil, Trash2, FolderTree, Search } from 'lucide-react';

export default function Majors() {
    const [majors, setMajors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
    const [form, setForm] = useState({ name: '', code: '', department: '', description: '', isActive: true });

    const fetchData = async () => {
        try {
            const [m, d] = await Promise.all([api.get('/admin/majors'), api.get('/admin/departments')]);
            setMajors(m.data); setDepartments(d.data);
        } catch { toast.error('โหลดข้อมูลล้มเหลว'); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setForm({ name: '', code: '', department: '', description: '', isActive: true });
        setModal({ open: true, mode: 'create', data: null });
    };
    const openEdit = (m) => {
        setForm({ name: m.name, code: m.code || '', department: m.department?._id || '', description: m.description || '', isActive: m.isActive });
        setModal({ open: true, mode: 'edit', data: m });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modal.mode === 'create') { await api.post('/admin/majors', form); toast.success('เพิ่มสาขาวิชาสำเร็จ'); }
            else { await api.put(`/admin/majors/${modal.data._id}`, form); toast.success('แก้ไขสาขาวิชาสำเร็จ'); }
            setModal({ open: false, mode: 'create', data: null }); fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('ยืนยันลบสาขาวิชานี้?')) return;
        try { await api.delete(`/admin/majors/${id}`); toast.success('ลบสำเร็จ'); fetchData(); }
        catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    const filtered = majors.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()) || m.department?.name?.toLowerCase().includes(search.toLowerCase()));

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                        <FolderTree className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900">สาขาวิชา</h1>
                        <p className="text-surface-500 text-sm mt-0.5">จัดการข้อมูลสาขาวิชาทั้งหมด</p>
                    </div>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all text-sm font-semibold hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 15px rgba(109,62,242,0.25)' }}><Plus className="w-4 h-4" />เพิ่มสาขา</button>
            </div>

            <div className="rounded-2xl space-card">
                <div className="p-4 border-b border-surface-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input type="text" placeholder="ค้นหาสาขาวิชา..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr className="border-b border-surface-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">สาขาวิชา</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">แผนก</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase">รหัส</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase">สถานะ</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase">จัดการ</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map(m => (
                                <tr key={m._id} className="border-b border-surface-50 hover:bg-primary-50/30 transition-colors">
                                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center"><FolderTree className="w-4 h-4 text-purple-500" /></div><span className="font-medium text-surface-800 text-sm">{m.name}</span></div></td>
                                    <td className="px-6 py-4 text-sm text-surface-600">{m.department?.name || '-'}</td>
                                    <td className="px-6 py-4 text-center text-sm text-surface-500">{m.code || '-'}</td>
                                    <td className="px-6 py-4 text-center"><span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${m.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-100 text-surface-500'}`}>{m.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span></td>
                                    <td className="px-6 py-4"><div className="flex items-center justify-center gap-1">
                                        <button onClick={() => openEdit(m)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(m._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div></td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-surface-400 text-sm">ไม่พบข้อมูล</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'เพิ่มสาขาวิชา' : 'แก้ไขสาขาวิชา'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label className="block text-sm font-medium text-surface-600 mb-1">ชื่อสาขาวิชา *</label>
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" /></div>
                    <div><label className="block text-sm font-medium text-surface-600 mb-1">รหัสสาขา</label>
                        <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" /></div>
                    <div><label className="block text-sm font-medium text-surface-600 mb-1">แผนกวิชา *</label>
                        <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm">
                            <option value="">เลือกแผนกวิชา</option>
                            {departments.filter(d => d.isActive).map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select></div>
                    <div><label className="block text-sm font-medium text-surface-600 mb-1">รายละเอียด</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" /></div>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded text-primary-600" /><span className="text-sm text-surface-600">เปิดใช้งาน</span></label>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal({ open: false, mode: 'create', data: null })} className="px-5 py-2.5 bg-surface-100 text-surface-600 rounded-xl text-sm font-medium hover:bg-surface-200 transition-colors">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 12px rgba(109,62,242,0.25)' }}>{modal.mode === 'create' ? 'เพิ่ม' : 'บันทึก'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Plus, Pencil, Trash2, Building2, Search, FolderTree } from 'lucide-react';

export default function Departments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
    const [form, setForm] = useState({ name: '', code: '', description: '', isActive: true });

    const fetchData = async () => {
        try {
            const res = await api.get('/admin/departments');
            setDepartments(res.data);
        } catch { toast.error('โหลดข้อมูลล้มเหลว'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setForm({ name: '', code: '', description: '', isActive: true });
        setModal({ open: true, mode: 'create', data: null });
    };

    const openEdit = (dept) => {
        setForm({ name: dept.name, code: dept.code || '', description: dept.description || '', isActive: dept.isActive });
        setModal({ open: true, mode: 'edit', data: dept });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modal.mode === 'create') {
                await api.post('/admin/departments', form);
                toast.success('เพิ่มแผนกวิชาสำเร็จ');
            } else {
                await api.put(`/admin/departments/${modal.data._id}`, form);
                toast.success('แก้ไขแผนกวิชาสำเร็จ');
            }
            setModal({ open: false, mode: 'create', data: null });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('ยืนยันลบแผนกวิชานี้?')) return;
        try {
            await api.delete(`/admin/departments/${id}`);
            toast.success('ลบแผนกวิชาสำเร็จ');
            fetchData();
        } catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    const filtered = departments.filter(d =>
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.code?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6d3ef2, #8b5cf6)' }}>
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900">แผนกวิชา</h1>
                        <p className="text-surface-500 text-sm mt-0.5">จัดการข้อมูลแผนกวิชาทั้งหมด</p>
                    </div>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all text-sm font-semibold hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 15px rgba(109,62,242,0.25)' }}>
                    <Plus className="w-4 h-4" />เพิ่มแผนก
                </button>
            </div>

            <div className="rounded-2xl space-card">
                <div className="p-4 border-b border-surface-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input type="text" placeholder="ค้นหาแผนกวิชา..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-surface-100">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">ชื่อแผนก</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">รหัส</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase">สาขาวิชา</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase">สถานะ</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(dept => (
                                <tr key={dept._id} className="border-b border-surface-50 hover:bg-primary-50/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
                                                <Building2 className="w-4 h-4 text-primary-500" />
                                            </div>
                                            <span className="font-medium text-surface-800 text-sm">{dept.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-surface-600">{dept.code || '-'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">{dept.majorCount || 0} สาขา</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${dept.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-100 text-surface-500'}`}>
                                            {dept.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openEdit(dept)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(dept._id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-12 text-surface-400 text-sm">ไม่พบข้อมูล</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'เพิ่มแผนกวิชา' : 'แก้ไขแผนกวิชา'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-600 mb-1">ชื่อแผนก *</label>
                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                            className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-600 mb-1">รหัสแผนก</label>
                        <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                            className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-600 mb-1">รายละเอียด</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                            className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
                            className="rounded text-primary-600 focus:ring-primary-500" />
                        <span className="text-sm text-surface-600">เปิดใช้งาน</span>
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal({ open: false, mode: 'create', data: null })}
                            className="px-5 py-2.5 bg-surface-100 text-surface-600 rounded-xl text-sm font-medium hover:bg-surface-200 transition-colors">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 12px rgba(109,62,242,0.25)' }}>
                            {modal.mode === 'create' ? 'เพิ่ม' : 'บันทึก'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

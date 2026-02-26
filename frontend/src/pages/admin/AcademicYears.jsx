import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Plus, Pencil, Trash2, Calendar, Search, Star } from 'lucide-react';

export default function AcademicYears() {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
    const [form, setForm] = useState({ year: '', semester: '1', startDate: '', endDate: '', isActive: false });

    const fetchData = async () => {
        try { setYears((await api.get('/admin/academic-years')).data); }
        catch { toast.error('โหลดข้อมูลล้มเหลว'); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setForm({ year: '', semester: '1', startDate: '', endDate: '', isActive: false });
        setModal({ open: true, mode: 'create', data: null });
    };
    const openEdit = (y) => {
        setForm({ year: y.year?.toString() || '', semester: y.semester?.toString() || '1', startDate: y.startDate?.split('T')[0] || '', endDate: y.endDate?.split('T')[0] || '', isActive: y.isActive });
        setModal({ open: true, mode: 'edit', data: y });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modal.mode === 'create') { await api.post('/admin/academic-years', form); toast.success('เพิ่มปีการศึกษาสำเร็จ'); }
            else { await api.put(`/admin/academic-years/${modal.data._id}`, form); toast.success('แก้ไขปีการศึกษาสำเร็จ'); }
            setModal({ open: false, mode: 'create', data: null }); fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('ยืนยันลบปีการศึกษานี้?')) return;
        try { await api.delete(`/admin/academic-years/${id}`); toast.success('ลบสำเร็จ'); fetchData(); }
        catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #22d3ee)' }}>
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900">ปีการศึกษา</h1>
                        <p className="text-surface-500 text-sm mt-0.5">จัดการปีการศึกษาและภาคเรียน</p>
                    </div>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all text-sm font-semibold hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 15px rgba(109,62,242,0.25)' }}>
                    <Plus className="w-4 h-4" />เพิ่มปีการศึกษา
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {years.map(y => (
                    <div key={y._id} className={`bg-white rounded-2xl p-6 shadow-sm border transition-all hover:shadow-md ${y.isActive ? 'border-primary-200 ring-2 ring-primary-100' : 'border-surface-100'}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${y.isActive ? 'bg-primary-50' : 'bg-surface-100'}`}>
                                    <Calendar className={`w-5 h-5 ${y.isActive ? 'text-primary-500' : 'text-surface-400'}`} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-surface-800">{y.name}</h3>
                                    <p className="text-xs text-surface-400">ปี {y.year} ภาคเรียนที่ {y.semester}</p>
                                </div>
                            </div>
                            {y.isActive && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium">
                                    <Star className="w-3 h-3" />Active
                                </span>
                            )}
                        </div>
                        {y.startDate && (
                            <p className="text-xs text-surface-500 mb-4">
                                {new Date(y.startDate).toLocaleDateString('th-TH')} - {y.endDate ? new Date(y.endDate).toLocaleDateString('th-TH') : '-'}
                            </p>
                        )}
                        <div className="flex gap-1">
                            <button onClick={() => openEdit(y)} className="flex-1 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">แก้ไข</button>
                            <button onClick={() => handleDelete(y._id)} className="py-2 px-3 text-sm text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
                {years.length === 0 && <p className="col-span-full text-center py-12 text-surface-400">ยังไม่มีข้อมูลปีการศึกษา</p>}
            </div>

            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'เพิ่มปีการศึกษา' : 'แก้ไขปีการศึกษา'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-600 mb-1">ปีการศึกษา *</label>
                            <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} required
                                className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" placeholder="เช่น 2567" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-600 mb-1">ภาคเรียน *</label>
                            <select value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm">
                                <option value="1">1</option><option value="2">2</option><option value="3">ฤดูร้อน</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-600 mb-1">วันเริ่มต้น</label>
                            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-600 mb-1">วันสิ้นสุด</label>
                            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                                className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="rounded text-primary-600" />
                        <span className="text-sm text-surface-600">ตั้งเป็นปีการศึกษาปัจจุบัน</span>
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal({ open: false, mode: 'create', data: null })} className="px-5 py-2.5 bg-surface-100 text-surface-600 rounded-xl text-sm font-medium hover:bg-surface-200 transition-colors">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 12px rgba(109,62,242,0.25)' }}>{modal.mode === 'create' ? 'เพิ่ม' : 'บันทึก'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Plus, Pencil, FileText, Clock, Calendar, Sparkles } from 'lucide-react';

export default function DailyLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
    const [form, setForm] = useState({ date: '', workDescription: '', hoursWorked: '8' });

    const fetchData = () => {
        api.get('/student/daily-logs').then(r => { setLogs(r.data); setLoading(false); }).catch(() => setLoading(false));
    };
    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setForm({ date: new Date().toISOString().split('T')[0], workDescription: '', hoursWorked: '8' });
        setModal({ open: true, mode: 'create', data: null });
    };
    const openEdit = (log) => {
        setForm({ date: log.date?.split('T')[0] || '', workDescription: log.workDescription || '', hoursWorked: log.hoursWorked?.toString() || '8' });
        setModal({ open: true, mode: 'edit', data: log });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modal.mode === 'create') { await api.post('/student/daily-logs', form); toast.success('บันทึกงานสำเร็จ'); }
            else { await api.put(`/student/daily-logs/${modal.data._id}`, form); toast.success('แก้ไขสำเร็จ'); }
            setModal({ open: false, mode: 'create', data: null }); fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    const colors = ['#6d3ef2', '#22d3ee', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900">บันทึกงานรายวัน</h1>
                        <p className="text-surface-500 text-sm mt-0.5">จำนวน {logs.length} รายการ</p>
                    </div>
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all text-sm font-semibold hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 15px rgba(109,62,242,0.25)' }}>
                    <Plus className="w-4 h-4" />เพิ่มบันทึก
                </button>
            </div>

            {/* Logs List */}
            <div className="space-y-3">
                {logs.map((log, idx) => (
                    <div key={log._id} className="bg-white rounded-2xl p-5 border border-surface-100 hover:shadow-lg hover:border-primary-100 transition-all group"
                        style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${colors[idx % colors.length]}15` }}>
                                    <Calendar className="w-5 h-5" style={{ color: colors[idx % colors.length] }} />
                                </div>
                                <div>
                                    <p className="font-semibold text-surface-800 text-sm">{new Date(log.date).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-surface-400 flex items-center gap-1"><Clock className="w-3 h-3" />{log.hoursWorked || 8} ชั่วโมง</span>
                                        <span className="w-1 h-1 rounded-full bg-surface-300" />
                                        <span className="text-xs text-surface-400 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />{log.workDescription?.length || 0} ตัวอักษร
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => openEdit(log)} className="p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 hover:bg-primary-50" style={{ color: '#6d3ef2' }}>
                                <Pencil className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="ml-14 p-3 rounded-xl bg-surface-50 text-sm text-surface-600 whitespace-pre-wrap leading-relaxed">
                            {log.workDescription || 'ไม่มีรายละเอียด'}
                        </div>
                    </div>
                ))}
                {logs.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
                        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-primary-400" />
                        </div>
                        <p className="text-surface-500 font-medium">ยังไม่มีบันทึกงาน</p>
                        <p className="text-surface-400 text-sm mt-1">เริ่มเพิ่มบันทึกงานแรกของคุณ!</p>
                        <button onClick={openCreate} className="mt-4 px-5 py-2 text-sm font-medium rounded-xl text-white transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)' }}>เพิ่มบันทึก</button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? '📝 เพิ่มบันทึกงาน' : '✏️ แก้ไขบันทึก'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">วันที่ *</label>
                            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required disabled={modal.mode === 'edit'}
                                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm disabled:opacity-50 focus:ring-2 focus:ring-primary-100" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">ชั่วโมงทำงาน</label>
                            <input type="number" min="1" max="12" value={form.hoursWorked} onChange={e => setForm({ ...form, hoursWorked: e.target.value })}
                                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-100" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">รายละเอียดงาน *</label>
                        <textarea value={form.workDescription} onChange={e => setForm({ ...form, workDescription: e.target.value })} rows={5} required placeholder="อธิบายงานที่ทำวันนี้..."
                            className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-100" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal({ open: false, mode: 'create', data: null })} className="px-5 py-2.5 bg-surface-100 text-surface-600 rounded-xl text-sm font-medium hover:bg-surface-200 transition-colors">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 12px rgba(109,62,242,0.25)' }}>{modal.mode === 'create' ? 'บันทึก' : 'แก้ไข'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

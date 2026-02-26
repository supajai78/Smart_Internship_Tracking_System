import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Plus, CheckCircle, Clock, FileText, BookOpen, AlertTriangle, ArrowRight } from 'lucide-react';

const statusConfig = {
    draft: { icon: FileText, color: '#64748b', bg: '#f1f5f9', label: 'ฉบับร่าง' },
    submitted: { icon: Clock, color: '#d97706', bg: '#fffbeb', label: 'ส่งแล้ว' },
    approved: { icon: CheckCircle, color: '#059669', bg: '#ecfdf5', label: 'อนุมัติ' }
};

export default function StudentWeeklyReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ weekNumber: '', summary: '', issues: '', nextPlan: '' });

    const fetchData = () => {
        api.get('/student/weekly-reports').then(r => { setReports(r.data); setLoading(false); }).catch(() => setLoading(false));
    };
    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/student/weekly-reports', { ...form, weekNumber: parseInt(form.weekNumber) });
            toast.success('ส่งรายงานสำเร็จ'); setModal(false); fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    const weekColors = ['#6d3ef2', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #22d3ee)' }}>
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900">รายงานรายสัปดาห์</h1>
                        <p className="text-surface-500 text-sm mt-0.5">จำนวน {reports.length} รายงาน</p>
                    </div>
                </div>
                <button onClick={() => { setForm({ weekNumber: (reports.length + 1).toString(), summary: '', issues: '', nextPlan: '' }); setModal(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all text-sm font-semibold hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 15px rgba(109,62,242,0.25)' }}>
                    <Plus className="w-4 h-4" />ส่งรายงาน
                </button>
            </div>

            {/* Report Cards */}
            <div className="space-y-4">
                {reports.map((r, idx) => {
                    const cfg = statusConfig[r.status] || statusConfig.draft;
                    const Icon = cfg.icon;
                    const weekColor = weekColors[idx % weekColors.length];

                    return (
                        <div key={r._id} className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-lg hover:border-primary-100 transition-all"
                            style={{ animationDelay: `${idx * 50}ms` }}>
                            {/* Color accent bar */}
                            <div className="h-1" style={{ background: `linear-gradient(90deg, ${weekColor}, ${weekColor}88)` }} />
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                                            style={{ background: weekColor }}>
                                            W{r.weekNumber}
                                        </div>
                                        <h3 className="font-bold text-surface-800">สัปดาห์ที่ {r.weekNumber}</h3>
                                    </div>
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                                        <Icon className="w-3.5 h-3.5" />{cfg.label}
                                    </span>
                                </div>

                                {r.summary && (
                                    <div className="mb-3 p-3 rounded-xl bg-surface-50 text-sm text-surface-600 leading-relaxed">
                                        <p className="text-xs text-surface-400 font-medium mb-1">📋 สรุปงาน</p>
                                        {r.summary}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    {r.issues && (
                                        <div className="flex-1 p-3 rounded-xl text-sm bg-amber-50/50 border border-amber-100">
                                            <p className="text-xs text-amber-600 font-medium mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />ปัญหา</p>
                                            <p className="text-surface-600 text-xs">{r.issues}</p>
                                        </div>
                                    )}
                                    {r.nextPlan && (
                                        <div className="flex-1 p-3 rounded-xl text-sm bg-blue-50/50 border border-blue-100">
                                            <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1"><ArrowRight className="w-3 h-3" />แผนถัดไป</p>
                                            <p className="text-surface-600 text-xs">{r.nextPlan}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {reports.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="text-surface-500 font-medium">ยังไม่มีรายงาน</p>
                        <p className="text-surface-400 text-sm mt-1">เริ่มส่งรายงานสัปดาห์แรกเลย!</p>
                        <button onClick={() => { setForm({ weekNumber: '1', summary: '', issues: '', nextPlan: '' }); setModal(true); }}
                            className="mt-4 px-5 py-2 text-sm font-medium rounded-xl text-white transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)' }}>ส่งรายงาน</button>
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal isOpen={modal} onClose={() => setModal(false)} title="📊 ส่งรายงานสัปดาห์" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">สัปดาห์ที่ *</label>
                        <input type="number" min="1" value={form.weekNumber} onChange={e => setForm({ ...form, weekNumber: e.target.value })} required
                            className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">สรุปงานที่ทำ *</label>
                        <textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={4} required placeholder="สรุปงานที่ทำในสัปดาห์นี้..."
                            className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">ปัญหาที่พบ</label>
                            <textarea value={form.issues} onChange={e => setForm({ ...form, issues: e.target.value })} rows={2} placeholder="ปัญหาหรืออุปสรรค (ถ้ามี)..."
                                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">แผนสัปดาห์ถัดไป</label>
                            <textarea value={form.nextPlan} onChange={e => setForm({ ...form, nextPlan: e.target.value })} rows={2} placeholder="สิ่งที่จะทำต่อ..."
                                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal(false)} className="px-5 py-2.5 bg-surface-100 text-surface-600 rounded-xl text-sm font-medium hover:bg-surface-200 transition-colors">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 12px rgba(109,62,242,0.25)' }}>ส่งรายงาน</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

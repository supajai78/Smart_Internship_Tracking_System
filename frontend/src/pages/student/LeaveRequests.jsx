import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Plus, FileText, Clock, CheckCircle, XCircle, Calendar, Thermometer, User, HelpCircle } from 'lucide-react';

const typeConfig = {
    sick: { label: 'ลาป่วย', icon: Thermometer, color: '#ef4444', bg: '#fef2f2' },
    personal: { label: 'ลากิจ', icon: User, color: '#3b82f6', bg: '#eff6ff' },
    other: { label: 'อื่นๆ', icon: HelpCircle, color: '#8b5cf6', bg: '#f5f3ff' }
};

const statusConfig = {
    pending: { icon: Clock, color: '#d97706', bg: '#fffbeb', label: 'รออนุมัติ' },
    approved: { icon: CheckCircle, color: '#059669', bg: '#ecfdf5', label: 'อนุมัติ' },
    rejected: { icon: XCircle, color: '#dc2626', bg: '#fef2f2', label: 'ไม่อนุมัติ' }
};

export default function StudentLeaveRequests() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ type: 'sick', startDate: '', endDate: '', reason: '' });

    const fetchData = () => {
        api.get('/student/leave-requests').then(r => { setLeaves(r.data); setLoading(false); }).catch(() => setLoading(false));
    };
    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/student/leave-requests', form);
            toast.success('ส่งคำขอลาสำเร็จ'); setModal(false); fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    // Summary counts
    const pending = leaves.filter(l => l.status === 'pending').length;
    const approved = leaves.filter(l => l.status === 'approved').length;
    const rejected = leaves.filter(l => l.status === 'rejected').length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900">ขอลางาน</h1>
                        <p className="text-surface-500 text-sm mt-0.5">รายการคำขอลาทั้งหมด</p>
                    </div>
                </div>
                <button onClick={() => { setForm({ type: 'sick', startDate: '', endDate: '', reason: '' }); setModal(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all text-sm font-semibold hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 15px rgba(109,62,242,0.25)' }}>
                    <Plus className="w-4 h-4" />ยื่นขอลา
                </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'รออนุมัติ', count: pending, color: '#d97706', bg: '#fffbeb' },
                    { label: 'อนุมัติแล้ว', count: approved, color: '#059669', bg: '#ecfdf5' },
                    { label: 'ไม่อนุมัติ', count: rejected, color: '#dc2626', bg: '#fef2f2' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-surface-100 text-center hover:shadow-md transition-all">
                        <p className="text-2xl font-bold" style={{ color: s.color }}>{s.count}</p>
                        <p className="text-xs text-surface-500 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Leave Cards */}
            <div className="space-y-3">
                {leaves.map((l, idx) => {
                    const type = typeConfig[l.type] || typeConfig.other;
                    const status = statusConfig[l.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    const TypeIcon = type.icon;

                    return (
                        <div key={l._id} className="bg-white rounded-2xl p-5 border border-surface-100 hover:shadow-lg hover:border-primary-100 transition-all"
                            style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: type.bg }}>
                                        <TypeIcon className="w-5 h-5" style={{ color: type.color }} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-surface-800 text-sm">{type.label}</p>
                                        <p className="text-xs text-surface-400 flex items-center gap-1 mt-0.5">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(l.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} — {new Date(l.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: status.bg, color: status.color }}>
                                    <StatusIcon className="w-3.5 h-3.5" />{status.label}
                                </span>
                            </div>
                            {l.reason && <p className="text-sm text-surface-600 ml-13 pl-13 border-l-2 border-surface-100 py-1 ml-[52px] pl-3">{l.reason}</p>}
                            {l.rejectReason && (
                                <div className="mt-2 ml-[52px] p-2.5 rounded-lg bg-red-50 text-sm text-red-600 flex items-start gap-2">
                                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" />เหตุผล: {l.rejectReason}
                                </div>
                            )}
                        </div>
                    );
                })}
                {leaves.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
                        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-amber-400" />
                        </div>
                        <p className="text-surface-500 font-medium">ยังไม่มีคำขอลา</p>
                        <p className="text-surface-400 text-sm mt-1">คุณยังไม่ได้ยื่นขอลา</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal isOpen={modal} onClose={() => setModal(false)} title="📋 ขอลางาน">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">ประเภทการลา *</label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(typeConfig).map(([key, cfg]) => {
                                const Icon = cfg.icon;
                                return (
                                    <button key={key} type="button" onClick={() => setForm({ ...form, type: key })}
                                        className={`p-3 rounded-xl border-2 text-center transition-all text-sm font-medium ${form.type === key ? 'border-primary-400 shadow-md' : 'border-surface-200 hover:border-surface-300'}`}
                                        style={form.type === key ? { background: cfg.bg } : {}}>
                                        <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: cfg.color }} />
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">วันเริ่ม *</label>
                            <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required
                                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">วันสิ้นสุด *</label>
                            <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required
                                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">เหตุผล</label>
                        <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3} placeholder="ระบุเหตุผล..."
                            className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal(false)} className="px-5 py-2.5 bg-surface-100 text-surface-600 rounded-xl text-sm font-medium hover:bg-surface-200 transition-colors">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 12px rgba(109,62,242,0.25)' }}>ส่งคำขอ</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

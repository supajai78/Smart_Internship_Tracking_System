import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FileText, CheckCircle, XCircle, Clock, Calendar, ThumbsUp, ThumbsDown } from 'lucide-react';
import Modal from '../../components/Modal';

const typeLabels = { sick: 'ลาป่วย', personal: 'ลากิจ', other: 'อื่นๆ' };
const statusConfig = {
    pending: { icon: Clock, color: '#d97706', bg: '#fffbeb', label: 'รออนุมัติ' },
    approved: { icon: CheckCircle, color: '#059669', bg: '#ecfdf5', label: 'อนุมัติ' },
    rejected: { icon: XCircle, color: '#dc2626', bg: '#fef2f2', label: 'ไม่อนุมัติ' }
};

export default function MentorLeaveRequests() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rejectModal, setRejectModal] = useState({ open: false, id: null });
    const [rejectReason, setRejectReason] = useState('');

    const fetchData = () => {
        api.get('/mentor/leave-requests').then(r => { setLeaves(r.data); setLoading(false); }).catch(() => setLoading(false));
    };
    useEffect(() => { fetchData(); }, []);

    const handleApprove = async (id) => {
        try { await api.put(`/mentor/leave-requests/${id}/approve`); toast.success('อนุมัติใบลาสำเร็จ'); fetchData(); }
        catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    const handleReject = async () => {
        try { await api.put(`/mentor/leave-requests/${rejectModal.id}/reject`, { rejectReason }); toast.success('ไม่อนุมัติใบลา'); setRejectModal({ open: false, id: null }); fetchData(); }
        catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    const pending = leaves.filter(l => l.status === 'pending').length;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900">อนุมัติใบลา</h1>
                        <p className="text-surface-500 text-sm mt-0.5">จัดการคำขอลาของนักศึกษา</p>
                    </div>
                </div>
                {pending > 0 && (
                    <span className="px-3 py-1.5 rounded-xl text-sm font-semibold" style={{ background: '#fffbeb', color: '#d97706' }}>
                        รออนุมัติ {pending} รายการ
                    </span>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-md transition-all">
                <div className="divide-y divide-surface-50">
                    {leaves.map(l => {
                        const cfg = statusConfig[l.status] || statusConfig.pending;
                        const Icon = cfg.icon;
                        return (
                            <div key={l._id} className="px-6 py-5 hover:bg-primary-50/30 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                                            style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)' }}>
                                            {l.student?.firstName?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-surface-800 text-sm">{l.student?.firstName} {l.student?.lastName}</p>
                                            <p className="text-xs text-surface-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {typeLabels[l.type] || l.type} · {new Date(l.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} — {new Date(l.endDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                                            <Icon className="w-3.5 h-3.5" />{cfg.label}
                                        </span>
                                        {l.status === 'pending' && (
                                            <div className="flex gap-1.5">
                                                <button onClick={() => handleApprove(l._id)}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-white rounded-lg font-semibold transition-all hover:scale-[1.02]"
                                                    style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                                                    <ThumbsUp className="w-3 h-3" />อนุมัติ
                                                </button>
                                                <button onClick={() => { setRejectReason(''); setRejectModal({ open: true, id: l._id }); }}
                                                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-white rounded-lg font-semibold transition-all hover:scale-[1.02]"
                                                    style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
                                                    <ThumbsDown className="w-3 h-3" />ไม่อนุมัติ
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {l.reason && <p className="text-sm text-surface-500 ml-[52px] p-2 rounded-lg bg-surface-50">เหตุผล: {l.reason}</p>}
                            </div>
                        );
                    })}
                    {leaves.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <FileText className="w-7 h-7 text-amber-400" />
                            </div>
                            <p className="text-surface-400 text-sm">ยังไม่มีคำขอลา</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={rejectModal.open} onClose={() => setRejectModal({ open: false, id: null })} title="❌ เหตุผลที่ไม่อนุมัติ" size="sm">
                <div className="space-y-4">
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="ระบุเหตุผล..."
                        className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm" />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setRejectModal({ open: false, id: null })} className="px-5 py-2.5 bg-surface-100 text-surface-600 rounded-xl text-sm font-medium hover:bg-surface-200 transition-colors">ยกเลิก</button>
                        <button onClick={handleReject} className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', boxShadow: '0 4px 12px rgba(239,68,68,0.25)' }}>ยืนยัน</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

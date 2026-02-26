import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FileText, CheckCircle, Clock, BookOpen } from 'lucide-react';

export default function TeacherWeeklyReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = () => {
        api.get('/teacher/weekly-reports').then(r => { setReports(r.data); setLoading(false); }).catch(() => setLoading(false));
    };
    useEffect(() => { fetchData(); }, []);

    const handleApprove = async (id) => {
        try { await api.put(`/teacher/weekly-reports/${id}/approve`); toast.success('อนุมัติรายงานสำเร็จ'); fetchData(); }
        catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    const statusConfig = {
        submitted: { icon: Clock, color: '#d97706', bg: '#fffbeb', label: 'รออนุมัติ' },
        approved: { icon: CheckCircle, color: '#059669', bg: '#ecfdf5', label: 'อนุมัติ' },
        draft: { icon: FileText, color: '#64748b', bg: '#f1f5f9', label: 'ฉบับร่าง' }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    const pending = reports.filter(r => r.status === 'submitted').length;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #22d3ee)' }}>
                        <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900">รายงานรายสัปดาห์</h1>
                        <p className="text-surface-500 text-sm mt-0.5">ตรวจสอบและอนุมัติรายงาน</p>
                    </div>
                </div>
                {pending > 0 && (
                    <span className="px-3 py-1.5 rounded-xl text-sm font-semibold" style={{ background: '#fffbeb', color: '#d97706' }}>
                        รออนุมัติ {pending} ฉบับ
                    </span>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-md transition-all">
                <div className="divide-y divide-surface-50">
                    {reports.map((r, idx) => {
                        const cfg = statusConfig[r.status] || statusConfig.draft;
                        const Icon = cfg.icon;
                        return (
                            <div key={r._id} className="flex items-center justify-between px-6 py-4 hover:bg-primary-50/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white"
                                        style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)' }}>
                                        {r.student?.firstName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-surface-800 text-sm">{r.student?.firstName} {r.student?.lastName} — สัปดาห์ที่ {r.weekNumber}</p>
                                        <p className="text-xs text-surface-400">{r.summary?.substring(0, 80)}...</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                                        <Icon className="w-3.5 h-3.5" />{cfg.label}
                                    </span>
                                    {r.status === 'submitted' && (
                                        <button onClick={() => handleApprove(r._id)}
                                            className="px-4 py-1.5 text-xs text-white rounded-lg font-semibold transition-all hover:scale-[1.02]"
                                            style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}>
                                            อนุมัติ
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {reports.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <BookOpen className="w-7 h-7 text-emerald-400" />
                            </div>
                            <p className="text-surface-400 text-sm">ยังไม่มีรายงาน</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

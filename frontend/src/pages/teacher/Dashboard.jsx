import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { Users, ClipboardList, GraduationCap, CheckCircle, AlertCircle, XCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/teacher/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    const stats = data?.stats || {};
    const statusColors = { complete: '#10b981', working: '#f59e0b', absent: '#ef4444' };
    const statusLabels = { complete: 'ลงเวลาครบ', working: 'เข้างานแล้ว', absent: 'ยังไม่เข้างาน' };
    const statusIcons = { complete: CheckCircle, working: AlertCircle, absent: XCircle };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white animate-pulse-glow"
                    style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)' }}>
                    {user?.firstName?.charAt(0) || 'T'}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">สวัสดี, {user?.firstName}! 👋</h1>
                    <p className="text-surface-500 text-sm mt-0.5">ภาพรวมนักศึกษาในความดูแลของคุณ</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'นักศึกษาในความดูแล', value: stats.studentCount || 0, icon: GraduationCap, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
                    { label: 'เข้างานวันนี้', value: stats.presentToday || 0, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                    { label: 'รอตรวจรายงาน', value: stats.pendingReports || 0, icon: ClipboardList, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                ].map((c, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-surface-100 hover:shadow-lg hover:scale-[1.02] transition-all">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
                                <c.icon className="w-5 h-5" style={{ color: c.color }} />
                            </div>
                            <span className="text-sm text-surface-500">{c.label}</span>
                        </div>
                        <p className="text-3xl font-bold text-surface-800">{c.value}</p>
                    </div>
                ))}
            </div>

            {/* Student List */}
            <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-md transition-all">
                <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, rgba(109,62,242,0.03), rgba(34,211,238,0.03))' }}>
                    <h3 className="font-semibold text-surface-800 flex items-center gap-2">
                        <Users className="w-5 h-5" style={{ color: '#6d3ef2' }} />สถานะนักศึกษาวันนี้
                    </h3>
                    <Link to="/teacher/students" className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg transition-all hover:bg-primary-50" style={{ color: '#6d3ef2' }}>
                        <Eye className="w-4 h-4" />ดูทั้งหมด
                    </Link>
                </div>
                <div className="divide-y divide-surface-50">
                    {(data?.students || []).map((s, idx) => {
                        const StatusIcon = statusIcons[s.todayStatus] || AlertCircle;
                        return (
                            <div key={s._id} className="flex items-center justify-between px-6 py-4 hover:bg-primary-50/30 transition-colors"
                                style={{ animationDelay: `${idx * 30}ms` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                                        style={{ background: `linear-gradient(135deg, ${statusColors[s.todayStatus] || '#94a3b8'}cc, ${statusColors[s.todayStatus] || '#94a3b8'})` }}>
                                        {s.firstName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-surface-800 text-sm">{s.firstName} {s.lastName}</p>
                                        <p className="text-xs text-surface-400">{s.company?.name || 'ยังไม่ระบุสถานประกอบการ'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                                    style={{ background: `${statusColors[s.todayStatus] || '#94a3b8'}12`, color: statusColors[s.todayStatus] || '#94a3b8' }}>
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    {statusLabels[s.todayStatus] || 'ไม่ทราบ'}
                                </div>
                            </div>
                        );
                    })}
                    {(!data?.students || data.students.length === 0) && (
                        <div className="text-center py-12">
                            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <GraduationCap className="w-7 h-7 text-primary-400" />
                            </div>
                            <p className="text-surface-400 text-sm">ยังไม่มีนักศึกษาในความดูแล</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

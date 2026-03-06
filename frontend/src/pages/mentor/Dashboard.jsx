import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { Link } from 'react-router-dom';
import { Users, FileText, Clock, GraduationCap, Building2, Eye, ArrowRight } from 'lucide-react';

export default function MentorDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/mentor/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    const stats = data?.stats || {};

    return (
        <div className="space-y-8 pb-10">
            {/* Hero Section */}
            <div className="relative mb-8 mt-2">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="max-w-2xl animate-fade-in-up">
                        {/* Role Badge */}
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel mb-5 shadow-sm border border-surface-200/50">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-inner"
                                style={{ background: 'linear-gradient(135deg, #10b981, #22d3ee)', color: '#fff' }}>
                                {user?.firstName?.charAt(0) || 'พ'}
                            </div>
                            <span className="text-sm font-semibold text-surface-700">
                                พี่เลี้ยง • {user?.firstName} {user?.lastName}
                            </span>
                        </div>

                        {/* Main Tagline */}
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500">
                                Mentorship
                            </span>
                            <br className="hidden md:block" />
                            <span className="text-surface-900"> Workspace</span>
                        </h1>
                        <p className="text-base text-surface-500 font-medium flex items-center gap-2 max-w-lg leading-relaxed">
                            <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            {data?.mentor?.company?.name || 'ยังไม่ระบุสถานประกอบการ'}
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0 mb-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <Link
                            to="/mentor/students"
                            className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl transition-all font-bold text-base overflow-hidden"
                            style={{
                                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                                color: '#fff',
                                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.2)'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative z-10 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                                    <Users className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" />
                                </div>
                                <span className="tracking-wide">จัดการนักศึกษา</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'นักศึกษาในสังกัด', value: stats.studentCount || 0, icon: GraduationCap, color: '#3b82f6', iconColor: '#60a5fa', bg: 'rgba(59,130,246,0.12)' },
                    { label: 'ใบลารออนุมัติ', value: stats.pendingLeaves || 0, icon: FileText, color: '#f59e0b', iconColor: '#fbbf24', bg: 'rgba(245,158,11,0.12)' },
                    { label: 'เข้างานวันนี้', value: stats.todayAttendance || 0, icon: Clock, color: '#10b981', iconColor: '#4ade80', bg: 'rgba(16,185,129,0.12)' },
                ].map((c, i) => (
                    <div key={i} className="relative rounded-2xl p-6 glass-panel border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 100 + 150}ms` }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full blur-[40px] opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" style={{ background: c.color }} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm border border-white/50" style={{ background: c.bg }}>
                                    <c.icon className="w-6 h-6" style={{ color: c.color }} />
                                </div>
                                <span className="text-sm font-semibold text-surface-500 bg-surface-100/50 px-3 py-1 rounded-full">{c.label}</span>
                            </div>
                            <p className="text-4xl font-black text-surface-900 tracking-tight group-hover:text-emerald-500 transition-colors">{c.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Student List */}
            <div className="rounded-3xl border border-white/40 glass-panel shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                <div className="px-6 py-5 border-b border-surface-200/50 flex items-center justify-between"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2))' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                            <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-surface-900 tracking-tight">รายชื่อนักศึกษาในสังกัด</h3>
                            <p className="text-xs font-medium text-surface-500">เลือกเพื่อดูรายละเอียดเพิ่มเติม</p>
                        </div>
                    </div>
                    <Link to="/mentor/students" className="hidden sm:flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-all hover:bg-emerald-50 text-emerald-600 border border-transparent hover:border-emerald-100">
                        ดูทั้งหมด <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="divide-y divide-surface-200/50 bg-white/40">
                    {(data?.students || []).map((s, idx) => (
                        <Link key={s._id} to={`/mentor/students/${s._id}`}
                            className="flex items-center justify-between px-6 py-4 hover:bg-primary-50/30 transition-colors"
                            style={{ animationDelay: `${idx * 30}ms` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                                    style={{ background: `linear-gradient(135deg, #6d3ef2, #22d3ee)` }}>
                                    {s.firstName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-surface-800 text-sm">{s.firstName} {s.lastName}</p>
                                    <p className="text-xs text-surface-400">{s.major?.name || '-'}</p>
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-surface-300" />
                        </Link>
                    ))}
                    {(!data?.students || data.students.length === 0) && (
                        <div className="text-center py-12">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <GraduationCap className="w-7 h-7 text-emerald-400" />
                            </div>
                            <p className="text-surface-400 text-sm">ยังไม่มีนักศึกษา</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

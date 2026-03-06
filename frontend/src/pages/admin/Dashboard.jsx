import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import {
    Users, GraduationCap, Briefcase, Building2, UserCheck, Clock,
    TrendingUp, Calendar
} from 'lucide-react';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/dashboard').then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
    );

    const stats = data?.stats || {};
    const cards = [
        { label: 'นักศึกษา', value: stats.studentCount || 0, icon: GraduationCap, bg: 'rgba(59,130,246,0.12)', text: 'text-blue-400', iconColor: '#60a5fa' },
        { label: 'ครูนิเทศก์', value: stats.teacherCount || 0, icon: UserCheck, bg: 'rgba(34,197,94,0.12)', text: 'text-emerald-400', iconColor: '#4ade80' },
        { label: 'พี่เลี้ยง', value: stats.mentorCount || 0, icon: Users, bg: 'rgba(168,85,247,0.12)', text: 'text-purple-400', iconColor: '#c084fc' },
        { label: 'สถานประกอบการ', value: stats.companyCount || 0, icon: Briefcase, bg: 'rgba(251,191,36,0.12)', text: 'text-amber-400', iconColor: '#fbbf24' },
        { label: 'แผนกวิชา', value: stats.departmentCount || 0, icon: Building2, bg: 'rgba(244,63,94,0.12)', text: 'text-rose-400', iconColor: '#fb7185' },
        { label: 'เข้างานวันนี้', value: stats.todayAttendance || 0, icon: Clock, bg: 'rgba(34,211,238,0.12)', text: 'text-cyan-400', iconColor: '#22d3ee' },
    ];

    const studentByDept = data?.chartData?.studentByDept || [];
    const maxCount = Math.max(...studentByDept.map(d => d.count), 1);

    return (
        <div className="space-y-8 pb-10">
            {/* Hero Section */}
            <div className="relative mb-8 mt-2">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="max-w-2xl animate-fade-in-up">
                        {/* System Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-5 shadow-sm border border-surface-200/50">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
                            </span>
                            <span className="text-sm font-semibold text-surface-700">
                                System Online • {new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date())}
                            </span>
                        </div>

                        {/* Main Tagline */}
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-500 to-primary-500">
                                Administrator
                            </span>
                            <br className="hidden md:block" />
                            <span className="text-surface-900"> Control Center</span>
                        </h1>
                        <p className="text-base text-surface-500 font-medium flex items-center gap-2 max-w-lg leading-relaxed">
                            <TrendingUp className="w-4 h-4 text-primary-500 shrink-0" />
                            ภาพรวมระบบการจัดการนักศึกษาฝึกงานอัจฉริยะ
                        </p>
                    </div>

                    {data?.activeYear && (
                        <div className="shrink-0 mb-1 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <div className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl glass-panel shadow-sm border border-primary-200/50 backdrop-blur-xl">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-50 text-primary-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-0.5">ปีการศึกษาปัจจุบัน</p>
                                    <p className="text-base font-black text-primary-700">{data.activeYear.name}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="relative rounded-2xl p-5 md:p-6 glass-panel border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(109,62,242,0.12)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 50 + 150}ms` }}>
                        {/* Background subtle glow effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[30px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" style={{ background: card.iconColor }} />

                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-white/50"
                                style={{ background: card.bg }}>
                                <card.icon className="w-6 h-6 drop-shadow-sm" style={{ color: card.iconColor }} />
                            </div>
                            <div className="mt-auto">
                                <h3 className="text-3xl font-black text-surface-900 tracking-tight group-hover:text-primary-600 transition-colors drop-shadow-sm">{card.value}</h3>
                                <p className="text-sm font-semibold text-surface-500 mt-1">{card.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Student by Department Bar Chart */}
                <div className="rounded-3xl p-6 md:p-8 glass-panel border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-shadow animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center border border-primary-100">
                                <TrendingUp className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-surface-900 tracking-tight">นักศึกษาแยกตามแผนก</h3>
                                <p className="text-xs font-medium text-surface-500">สถิติจำนวนนักศึกษาฝึกงานแต่ละสาขา</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {studentByDept.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-60">
                                <Building2 className="w-12 h-12 text-surface-300 mb-3" />
                                <p className="text-surface-500 font-medium">ยังไม่มีข้อมูลในระบบ</p>
                            </div>
                        ) : studentByDept.map((dept, i) => (
                            <div key={i} className="group relative">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-surface-700 group-hover:text-primary-600 transition-colors w-full truncate pr-4">{dept.name}</span>
                                    <span className="text-sm font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">{dept.count}</span>
                                </div>
                                <div className="w-full rounded-full h-3 bg-surface-100 overflow-hidden shadow-inner relative">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                                        style={{ width: `${Math.max((dept.count / maxCount) * 100, 2)}%`, background: 'linear-gradient(90deg, #6d3ef2, #22d3ee)' }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Internship Status */}
                <div className="rounded-3xl p-6 md:p-8 glass-panel border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-shadow animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                                <Briefcase className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-surface-900 tracking-tight">สถานะการฝึกงาน</h3>
                                <p className="text-xs font-medium text-surface-500">ภาพรวมสถานะนักเรียนทั้งหมด</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center py-2 h-[calc(100%-5rem)]">
                        <div className="grid grid-cols-1 gap-4 w-full">
                            {(data?.chartData?.internshipStatus || []).map((s, i) => {
                                const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-blue-500'];
                                const bgColors = ['bg-emerald-50/80', 'bg-amber-50/80', 'bg-blue-50/80'];
                                const textColors = ['text-emerald-700', 'text-amber-700', 'text-blue-700'];
                                const borderColors = ['border-emerald-200/50', 'border-amber-200/50', 'border-blue-200/50'];

                                return (
                                    <div key={i} className={`${bgColors[i]} ${borderColors[i]} border rounded-2xl p-5 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300 shadow-sm`}>
                                        <div className="flex items-center gap-4">
                                            <div className="relative flex h-4 w-4">
                                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[i]} opacity-40`}></span>
                                                <span className={`relative inline-flex rounded-full h-4 w-4 ${colors[i]} border-2 border-white/50 backdrop-blur-sm`}></span>
                                            </div>
                                            <span className={`text-base font-bold ${textColors[i]}`}>{s.name}</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-3xl font-black ${textColors[i]} tracking-tighter`}>{s.count}</span>
                                            <span className={`text-sm font-semibold opacity-70 ${textColors[i]}`}>คน</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-surface-800">แดชบอร์ด</h1>
                    <p className="text-surface-500 text-sm mt-1">สวัสดี, {user?.firstName}! นี่คือภาพรวมระบบ</p>
                </div>
                {data?.activeYear && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-sm font-medium">
                        <Calendar className="w-4 h-4" />
                        ปีการศึกษา {data.activeYear.name}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {cards.map((card, i) => (
                    <div key={i} className="rounded-2xl p-5 space-card hover:scale-105 transition-all group">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                            style={{ background: card.bg }}>
                            <card.icon className="w-5 h-5" style={{ color: card.iconColor }} />
                        </div>
                        <p className="text-2xl font-bold text-surface-800">{card.value}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#6b7194' }}>{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student by Department Bar Chart */}
                <div className="rounded-2xl p-6 space-card">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-primary-500" />
                        <h3 className="font-semibold text-surface-800">นักศึกษาแยกตามแผนก</h3>
                    </div>
                    <div className="space-y-3">
                        {studentByDept.length === 0 ? (
                            <p className="text-surface-400 text-sm text-center py-8">ยังไม่มีข้อมูล</p>
                        ) : studentByDept.map((dept, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="text-sm text-surface-600 w-24 truncate">{dept.name}</span>
                                <div className="flex-1 rounded-full h-8 overflow-hidden" style={{ background: 'rgba(109,62,242,0.08)' }}>
                                    <div
                                        className="h-full rounded-full flex items-center justify-end pr-3 transition-all duration-700"
                                        style={{ width: `${Math.max((dept.count / maxCount) * 100, 10)}%`, background: 'linear-gradient(90deg, #6d3ef2, #22d3ee)' }}
                                    >
                                        <span className="text-xs font-bold" style={{ color: '#fff' }}>{dept.count}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Internship Status */}
                <div className="rounded-2xl p-6 space-card">
                    <div className="flex items-center gap-2 mb-6">
                        <Briefcase className="w-5 h-5 text-primary-500" />
                        <h3 className="font-semibold text-surface-800">สถานะการฝึกงาน</h3>
                    </div>
                    <div className="flex items-center justify-center py-4">
                        <div className="grid grid-cols-1 gap-4 w-full">
                            {(data?.chartData?.internshipStatus || []).map((s, i) => {
                                const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-blue-500'];
                                const bgColors = ['bg-emerald-50', 'bg-amber-50', 'bg-blue-50'];
                                const textColors = ['text-emerald-700', 'text-amber-700', 'text-blue-700'];
                                return (
                                    <div key={i} className={`${bgColors[i]} rounded-xl p-4 flex items-center justify-between`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 ${colors[i]} rounded-full`} />
                                            <span className={`text-sm font-medium ${textColors[i]}`}>{s.name}</span>
                                        </div>
                                        <span className={`text-xl font-bold ${textColors[i]}`}>{s.count}</span>
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

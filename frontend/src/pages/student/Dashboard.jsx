import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { Clock, Calendar, FileText, MapPin, Building2, User, Phone, Mail, BookOpen } from 'lucide-react';

export default function StudentDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/student/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'rgba(109,62,242,0.2)', borderTopColor: '#6d3ef2' }} /></div>;

    const stats = data?.stats || {};
    const student = data?.student || {};
    const progress = stats.progress || 0;
    const totalAttendance = stats.totalAttendance || 0;
    const requiredDays = stats.requiredDays || 120;

    const getMotivation = (p) => {
        if (p >= 75) return 'เกือบเสร็จแล้ว! สู้ๆ อีกนิดเดียว! 💪';
        if (p >= 50) return 'ผ่านครึ่งทางแล้ว! ดีมาก! 🎉';
        if (p >= 25) return 'กำลังไปได้ดี! พยายามต่อไป! ⭐';
        if (p > 0) return 'คุณทำได้ยอดเยี่ยมมาก! พยายามต่อไปเพื่อเป้าหมาย';
        return 'เริ่มต้นฝึกงานกันเลย! 🚀';
    };

    const todayStatus = () => {
        if (!stats.todayAttendance) return 'ยังไม่ลงเวลา';
        if (stats.todayAttendance.checkOutTime) return 'ลงเวลาครบแล้ว';
        if (stats.todayAttendance.checkInTime) return 'เข้างานแล้ว';
        return 'ยังไม่ลงเวลา';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold animate-pulse-glow"
                        style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', color: '#fff' }}>
                        {user?.firstName?.charAt(0) || 'น'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900">สวัสดี, {user?.firstName}! 👋</h1>
                        <p className="text-sm flex items-center gap-1 mt-0.5 text-surface-500">
                            <MapPin className="w-3.5 h-3.5" style={{ color: '#6d3ef2' }} />
                            <span style={{ color: '#6d3ef2' }} className="font-medium">ฝึกงานที่</span> {student.company?.name || 'ยังไม่ระบุสถานประกอบการ'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/student/attendance')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-sm font-medium"
                    style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', color: '#fff', boxShadow: '0 4px 15px rgba(109, 62, 242, 0.25)' }}
                >
                    <MapPin className="w-4 h-4" />ลงเวลาเข้างาน
                </button>
            </div>

            {/* Dark hero card - this keeps dark space look */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f0f23, #13132b)', border: '1px solid rgba(109, 62, 242, 0.12)' }}>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                    {/* Left - Progress */}
                    <div className="lg:col-span-3 p-6 lg:p-8">
                        <h3 style={{ color: '#fff' }} className="font-semibold text-lg mb-1">ความคืบหน้าการฝึกงาน</h3>
                        <p className="text-sm mb-6" style={{ color: '#6b7194' }}>{getMotivation(progress)}</p>

                        <div className="flex items-end gap-3 mb-4">
                            <span className="text-5xl font-black" style={{ color: '#fff' }}>{progress}%</span>
                            <span className="font-semibold text-lg mb-1" style={{ color: '#22d3ee' }}>สำเร็จแล้ว</span>
                        </div>

                        <div className="w-full h-3 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(109, 62, 242, 0.15)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    width: `${Math.max(progress, 2)}%`,
                                    background: 'linear-gradient(90deg, #6d3ef2, #22d3ee)',
                                    boxShadow: '0 0 10px rgba(34, 211, 238, 0.3)'
                                }}
                            />
                        </div>
                        <p className="text-sm" style={{ color: '#6b7194' }}>
                            เข้างานแล้ว <span style={{ color: '#fff' }} className="font-semibold">{totalAttendance}</span> จาก <span style={{ color: '#fff' }} className="font-semibold">{requiredDays}</span> วันที่ต้องการ
                        </p>
                    </div>

                    {/* Right - Quick stats grid */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-3 p-4 lg:p-6">
                        <div className="rounded-2xl p-4 flex flex-col" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                                <Clock className="w-5 h-5" style={{ color: '#60a5fa' }} />
                            </div>
                            <p className="text-xs" style={{ color: '#6b7194' }}>สถานะวันนี้</p>
                            <p className="font-bold text-sm mt-0.5" style={{ color: '#fff' }}>{todayStatus()}</p>
                        </div>

                        <div className="rounded-2xl p-4 flex flex-col" style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.15)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(244, 63, 94, 0.15)' }}>
                                <Calendar className="w-5 h-5" style={{ color: '#fb7185' }} />
                            </div>
                            <p className="text-xs" style={{ color: '#6b7194' }}>เดือนนี้</p>
                            <p className="font-bold text-sm mt-0.5" style={{ color: '#fff' }}>{stats.monthlyAttendance || 0} วัน</p>
                        </div>

                        <div className="rounded-2xl p-4 flex flex-col" style={{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                                <FileText className="w-5 h-5" style={{ color: '#4ade80' }} />
                            </div>
                            <p className="text-xs" style={{ color: '#6b7194' }}>บันทึกงาน</p>
                            <p className="font-bold text-sm mt-0.5" style={{ color: '#fff' }}>{stats.totalDailyLogs || 0} ครั้ง</p>
                        </div>

                        <div className="rounded-2xl p-4 flex flex-col" style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.15)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
                                <BookOpen className="w-5 h-5" style={{ color: '#fbbf24' }} />
                            </div>
                            <p className="text-xs" style={{ color: '#6b7194' }}>ลาอนุมัติ</p>
                            <p className="font-bold text-sm mt-0.5" style={{ color: '#fff' }}>{stats.pendingLeaves || 0} ใบ</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom info cards - WHITE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-100">
                    <h3 className="font-semibold text-surface-800 flex items-center gap-2 mb-4">
                        <Building2 className="w-5 h-5" style={{ color: '#6d3ef2' }} />สถานประกอบการ
                    </h3>
                    {student.company ? (
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(109, 62, 242, 0.1)' }}>
                                    <Building2 className="w-6 h-6" style={{ color: '#6d3ef2' }} />
                                </div>
                                <div>
                                    <p className="font-semibold text-surface-800">{student.company.name}</p>
                                    <p className="text-sm mt-0.5 text-surface-500">{student.company.address || 'ไม่ระบุที่อยู่'}</p>
                                </div>
                            </div>
                            {student.company.phone && (
                                <div className="flex items-center gap-2 text-sm text-surface-600 pl-1">
                                    <Phone className="w-4 h-4 text-surface-400" />{student.company.phone}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-surface-400">ยังไม่ได้กำหนดสถานประกอบการ</p>
                    )}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-surface-100">
                    <h3 className="font-semibold text-surface-800 flex items-center gap-2 mb-4">
                        <User className="w-5 h-5" style={{ color: '#6d3ef2' }} />ครูนิเทศก์
                    </h3>
                    {student.teacher ? (
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg"
                                    style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', color: '#fff' }}>
                                    {student.teacher.firstName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-surface-800">{student.teacher.firstName} {student.teacher.lastName}</p>
                                    <p className="text-sm mt-0.5 text-surface-500">{student.teacher.department?.name || ''}</p>
                                </div>
                            </div>
                            {student.teacher.email && (
                                <div className="flex items-center gap-2 text-sm text-surface-600 pl-1">
                                    <Mail className="w-4 h-4 text-surface-400" />{student.teacher.email}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-surface-400">ยังไม่ได้กำหนดครูนิเทศก์</p>
                    )}
                </div>
            </div>
        </div>
    );
}

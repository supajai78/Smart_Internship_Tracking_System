import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { ArrowLeft, CheckCircle, Clock, FileText, Star, Calendar, Briefcase, AlertTriangle, ArrowRight } from 'lucide-react';

export default function StudentDetail() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('attendance');

    useEffect(() => {
        api.get(`/teacher/students/${id}`).then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );
    if (!data?.student) return <p className="text-center py-12 text-surface-400">ไม่พบข้อมูลนักศึกษา</p>;

    const s = data.student;
    const tabs = [
        { key: 'attendance', label: 'การเข้างาน', icon: CheckCircle },
        { key: 'dailyLogs', label: 'บันทึกรายวัน', icon: FileText },
        { key: 'weeklyReports', label: 'รายงานสัปดาห์', icon: Calendar },
        { key: 'evaluations', label: 'การประเมิน', icon: Star },
    ];

    const statusBadge = (st) => {
        const styles = {
            present: { bg: '#ecfdf5', color: '#059669', label: 'เข้างาน' },
            late: { bg: '#fffbeb', color: '#d97706', label: 'สาย' },
            absent: { bg: '#fef2f2', color: '#dc2626', label: 'ขาด' },
            leave: { bg: '#eff6ff', color: '#2563eb', label: 'ลา' }
        };
        const st2 = styles[st] || { bg: '#f1f5f9', color: '#64748b', label: st };
        return <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: st2.bg, color: st2.color }}>{st2.label}</span>;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <Link to="/teacher/students" className="flex items-center gap-1.5 text-sm font-medium transition-all hover:gap-2" style={{ color: '#6d3ef2' }}>
                <ArrowLeft className="w-4 h-4" />กลับรายชื่อนักศึกษา
            </Link>

            {/* Student Profile Card */}
            <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-md transition-all">
                <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #6d3ef2, #22d3ee)' }} />
                <div className="p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                        style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)' }}>
                        {s.firstName?.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-surface-900">{s.firstName} {s.lastName}</h1>
                        <p className="text-sm text-surface-500 mt-0.5">{s.studentId || '-'} · {s.major?.name || '-'} · {s.level?.name || '-'}</p>
                        <p className="text-sm text-surface-400 mt-0.5 flex items-center gap-1"><Briefcase className="w-3 h-3" />{s.company?.name || 'ยังไม่ระบุสถานประกอบการ'}</p>
                    </div>
                    <div className="text-center px-6 border-l border-surface-100">
                        <p className="text-3xl font-bold" style={{ color: '#6d3ef2' }}>{data.totalAttendance}</p>
                        <p className="text-xs text-surface-500 mt-0.5">วันเข้างาน</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl p-1.5 border border-surface-100">
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'text-white' : 'text-surface-500 hover:bg-surface-50'}`}
                        style={tab === t.key ? { background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)' } : {}}>
                        <t.icon className="w-4 h-4" />{t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-md transition-all">
                {tab === 'attendance' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead><tr className="border-b border-surface-100 bg-surface-50/50">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">วันที่</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">เข้างาน</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">ออกงาน</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">สถานะ</th>
                            </tr></thead>
                            <tbody>{(data.attendances || []).map((a, i) => (
                                <tr key={i} className="border-b border-surface-50 hover:bg-primary-50/30 transition-colors">
                                    <td className="px-6 py-3.5 text-sm font-medium text-surface-700">{new Date(a.date).toLocaleDateString('th-TH')}</td>
                                    <td className="px-6 py-3.5 text-sm text-center text-surface-600">{a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                    <td className="px-6 py-3.5 text-sm text-center text-surface-600">{a.checkOutTime ? new Date(a.checkOutTime).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                    <td className="px-6 py-3.5 text-center">{statusBadge(a.status)}</td>
                                </tr>
                            ))}{(data.attendances || []).length === 0 && <tr><td colSpan={4} className="text-center py-12 text-surface-400 text-sm">ยังไม่มีข้อมูล</td></tr>}</tbody>
                        </table>
                    </div>
                )}
                {tab === 'dailyLogs' && (
                    <div className="divide-y divide-surface-50">
                        {(data.dailyLogs || []).map((d, i) => (
                            <div key={i} className="px-6 py-4 hover:bg-primary-50/30 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-surface-800">{new Date(d.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                    <span className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: '#eff6ff', color: '#3b82f6' }}>{d.hoursWorked || 8} ชม.</span>
                                </div>
                                <p className="text-sm text-surface-600 p-3 rounded-lg bg-surface-50 whitespace-pre-wrap">{d.workDescription}</p>
                            </div>
                        ))}{(data.dailyLogs || []).length === 0 && <p className="text-center py-12 text-surface-400 text-sm">ยังไม่มีข้อมูล</p>}
                    </div>
                )}
                {tab === 'weeklyReports' && (
                    <div className="divide-y divide-surface-50">
                        {(data.weeklyReports || []).map((r, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-primary-50/30 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: '#6d3ef2' }}>W{r.weekNumber}</div>
                                    <div>
                                        <p className="font-medium text-sm text-surface-800">สัปดาห์ที่ {r.weekNumber}</p>
                                        <p className="text-xs text-surface-400">{r.summary?.substring(0, 80)}...</p>
                                    </div>
                                </div>
                                <span className="text-xs px-2.5 py-1 rounded-lg font-medium" style={
                                    r.status === 'approved' ? { background: '#ecfdf5', color: '#059669' } :
                                        r.status === 'submitted' ? { background: '#fffbeb', color: '#d97706' } :
                                            { background: '#f1f5f9', color: '#64748b' }
                                }>{r.status === 'approved' ? 'อนุมัติ' : r.status === 'submitted' ? 'รออนุมัติ' : 'ฉบับร่าง'}</span>
                            </div>
                        ))}{(data.weeklyReports || []).length === 0 && <p className="text-center py-12 text-surface-400 text-sm">ยังไม่มีข้อมูล</p>}
                    </div>
                )}
                {tab === 'evaluations' && (
                    <div className="divide-y divide-surface-50">
                        {(data.evaluations || []).map((e, i) => (
                            <div key={i} className="px-6 py-4 hover:bg-primary-50/30 transition-colors">
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-surface-800">{e.evaluator?.firstName} {e.evaluator?.lastName}</span>
                                    <span className="text-xs px-2.5 py-1 rounded-lg font-medium" style={
                                        e.evaluatorRole === 'teacher' ? { background: '#eff6ff', color: '#3b82f6' } : { background: '#f5f3ff', color: '#8b5cf6' }
                                    }>{e.evaluatorRole === 'teacher' ? 'ครูนิเทศก์' : 'พี่เลี้ยง'}</span>
                                </div>
                                <div className="flex gap-2 flex-wrap">{(e.scores || []).map((sc, j) => (
                                    <span key={j} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: 'rgba(109,62,242,0.08)', color: '#6d3ef2' }}>{sc.criteria}: {sc.score}/{sc.maxScore}</span>
                                ))}</div>
                                {e.comment && <p className="text-sm text-surface-500 mt-2 p-2 rounded-lg bg-surface-50">{e.comment}</p>}
                            </div>
                        ))}{(data.evaluations || []).length === 0 && <p className="text-center py-12 text-surface-400 text-sm">ยังไม่มีข้อมูล</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

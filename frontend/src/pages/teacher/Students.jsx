import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { GraduationCap, Briefcase, Eye, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/teacher/students').then(r => { setStudents(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const filtered = students.filter(s => s.firstName?.toLowerCase().includes(search.toLowerCase()) || s.lastName?.toLowerCase().includes(search.toLowerCase()) || s.studentId?.includes(search));

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    const colors = ['#6d3ef2', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">นักศึกษาในความดูแล</h1>
                    <p className="text-surface-500 text-sm mt-0.5">จำนวน {students.length} คน</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-md transition-all">
                <div className="p-4 border-b border-surface-100" style={{ background: 'linear-gradient(135deg, rgba(109,62,242,0.03), rgba(34,211,238,0.03))' }}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input type="text" placeholder="ค้นหานักศึกษา..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all" />
                    </div>
                </div>
                <div className="divide-y divide-surface-50">
                    {filtered.map((s, idx) => (
                        <Link key={s._id} to={`/teacher/students/${s._id}`} className="flex items-center justify-between px-6 py-4 hover:bg-primary-50/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                                    style={{ background: colors[idx % colors.length] }}>
                                    {s.firstName?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-surface-800 text-sm">{s.firstName} {s.lastName}</p>
                                    <p className="text-xs text-surface-400">{s.studentId || '-'} · {s.major?.name || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {s.company && <span className="flex items-center gap-1 text-xs text-surface-500 bg-surface-50 px-2.5 py-1 rounded-lg border border-surface-100"><Briefcase className="w-3 h-3" />{s.company.name}</span>}
                                <ArrowRight className="w-4 h-4 text-surface-300" />
                            </div>
                        </Link>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <GraduationCap className="w-7 h-7 text-primary-400" />
                            </div>
                            <p className="text-surface-400 text-sm">ไม่พบข้อมูลนักศึกษา</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

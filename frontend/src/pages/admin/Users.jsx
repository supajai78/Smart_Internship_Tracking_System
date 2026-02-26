import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Plus, Pencil, Trash2, Users as UsersIcon, Search, GraduationCap, UserCheck, Shield, Wrench } from 'lucide-react';

const roleIcons = { admin: Shield, teacher: UserCheck, student: GraduationCap, mentor: Wrench };
const roleLabels = { admin: 'ผู้ดูแลระบบ', teacher: 'ครูนิเทศก์', student: 'นักศึกษา', mentor: 'พี่เลี้ยง' };
const roleColors = { admin: 'bg-red-50 text-red-700', teacher: 'bg-emerald-50 text-emerald-700', student: 'bg-blue-50 text-blue-700', mentor: 'bg-purple-50 text-purple-700' };

export default function UsersList() {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
    const [form, setForm] = useState({ username: '', password: '', firstName: '', lastName: '', role: 'student', studentId: '', department: '', major: '', section: '', company: '', teacher: '' });

    const fetchData = async () => {
        try {
            const [u, fd] = await Promise.all([api.get('/admin/users'), api.get('/admin/users/form-data')]);
            setUsers(u.data); setFormData(fd.data);
        } catch { toast.error('โหลดข้อมูลล้มเหลว'); }
        finally { setLoading(false); }
    };
    useEffect(() => { fetchData(); }, []);

    const openCreate = () => {
        setForm({ username: '', password: '', firstName: '', lastName: '', role: 'student', studentId: '', department: '', major: '', section: '', company: '', teacher: '' });
        setModal({ open: true, mode: 'create', data: null });
    };
    const openEdit = (u) => {
        setForm({ username: u.username, password: '', firstName: u.firstName || '', lastName: u.lastName || '', role: u.role, studentId: u.studentId || '', department: u.department?._id || '', major: u.major?._id || '', section: u.section?._id || '', company: u.company?._id || '', teacher: u.teacher?._id || '' });
        setModal({ open: true, mode: 'edit', data: u });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...form };
            if (!payload.password) delete payload.password;
            if (modal.mode === 'create') { await api.post('/admin/users', payload); toast.success('เพิ่มผู้ใช้สำเร็จ'); }
            else { await api.put(`/admin/users/${modal.data._id}`, payload); toast.success('แก้ไขผู้ใช้สำเร็จ'); }
            setModal({ open: false, mode: 'create', data: null }); fetchData();
        } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('ยืนยันลบผู้ใช้นี้?')) return;
        try { await api.delete(`/admin/users/${id}`); toast.success('ลบสำเร็จ'); fetchData(); }
        catch { toast.error('เกิดข้อผิดพลาด'); }
    };

    const filtered = users.filter(u => {
        const matchSearch = u.firstName?.toLowerCase().includes(search.toLowerCase()) || u.lastName?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)' }}>
                        <UsersIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900">ผู้ใช้งาน</h1>
                        <p className="text-surface-500 text-sm mt-0.5">จัดการข้อมูลผู้ใช้งานทั้งหมด ({users.length} คน)</p>
                    </div>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all text-sm font-semibold hover:scale-[1.02] active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 15px rgba(109,62,242,0.25)' }}><Plus className="w-4 h-4" />เพิ่มผู้ใช้</button>
            </div>

            {/* Role filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {[{ key: 'all', label: 'ทั้งหมด' }, { key: 'admin', label: 'Admin' }, { key: 'teacher', label: 'ครูนิเทศก์' }, { key: 'student', label: 'นักศึกษา' }, { key: 'mentor', label: 'พี่เลี้ยง' }].map(t => (
                    <button key={t.key} onClick={() => setRoleFilter(t.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${roleFilter === t.key ? 'text-white' : 'bg-white text-surface-600 border border-surface-100 hover:bg-surface-50'}`}
                        style={roleFilter === t.key ? { background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)' } : {}}>
                        {t.label} {t.key !== 'all' && <span className="ml-1 opacity-70">({users.filter(u => u.role === t.key).length})</span>}
                    </button>
                ))}
            </div>

            <div className="rounded-2xl space-card">
                <div className="p-4 border-b border-surface-100">
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input type="text" placeholder="ค้นหาผู้ใช้งาน..." value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr className="border-b border-surface-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">ผู้ใช้</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">ชื่อผู้ใช้</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase">บทบาท</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase">สังกัด</th>
                            <th className="text-center px-6 py-3 text-xs font-semibold text-surface-500 uppercase">จัดการ</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map(u => {
                                const RoleIcon = roleIcons[u.role] || UsersIcon;
                                return (
                                    <tr key={u._id} className="border-b border-surface-50 hover:bg-primary-50/30 transition-colors">
                                        <td className="px-6 py-4"><div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center font-bold text-sm text-primary-600">{u.firstName?.charAt(0) || 'U'}</div>
                                            <div><p className="font-medium text-surface-800 text-sm">{u.firstName} {u.lastName}</p>{u.studentId && <p className="text-xs text-surface-400">{u.studentId}</p>}</div>
                                        </div></td>
                                        <td className="px-6 py-4 text-sm text-surface-600">{u.username}</td>
                                        <td className="px-6 py-4 text-center"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${roleColors[u.role]}`}><RoleIcon className="w-3 h-3" />{roleLabels[u.role]}</span></td>
                                        <td className="px-6 py-4 text-sm text-surface-500">{u.department?.name || u.company?.name || '-'}</td>
                                        <td className="px-6 py-4"><div className="flex items-center justify-center gap-1">
                                            <button onClick={() => openEdit(u)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(u._id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        </div></td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-surface-400 text-sm">ไม่พบข้อมูล</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, mode: 'create', data: null })} title={modal.mode === 'create' ? 'เพิ่มผู้ใช้' : 'แก้ไขผู้ใช้'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-surface-600 mb-1">ชื่อจริง *</label>
                            <input type="text" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" /></div>
                        <div><label className="block text-sm font-medium text-surface-600 mb-1">นามสกุล *</label>
                            <input type="text" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-surface-600 mb-1">ชื่อผู้ใช้ *</label>
                            <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" /></div>
                        <div><label className="block text-sm font-medium text-surface-600 mb-1">{modal.mode === 'create' ? 'รหัสผ่าน *' : 'รหัสผ่าน (เว้นว่างถ้าไม่เปลี่ยน)'}</label>
                            <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={modal.mode === 'create'} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-surface-600 mb-1">บทบาท *</label>
                            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm">
                                <option value="student">นักศึกษา</option><option value="teacher">ครูนิเทศก์</option><option value="mentor">พี่เลี้ยง</option><option value="admin">ผู้ดูแลระบบ</option>
                            </select></div>
                        {form.role === 'student' && (
                            <div><label className="block text-sm font-medium text-surface-600 mb-1">รหัสนักศึกษา</label>
                                <input type="text" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm" /></div>
                        )}
                    </div>
                    {(form.role === 'student' || form.role === 'teacher') && formData && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-surface-600 mb-1">แผนกวิชา</label>
                                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm">
                                    <option value="">เลือกแผนกวิชา</option>{formData.departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                </select></div>
                            {form.role === 'student' && (
                                <div><label className="block text-sm font-medium text-surface-600 mb-1">สาขาวิชา</label>
                                    <select value={form.major} onChange={e => setForm({ ...form, major: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm">
                                        <option value="">เลือกสาขาวิชา</option>{formData.majors.filter(m => !form.department || m.department?._id === form.department).map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                    </select></div>
                            )}
                        </div>
                    )}
                    {form.role === 'student' && formData && (
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-surface-600 mb-1">ห้องเรียน</label>
                                <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm">
                                    <option value="">เลือกห้องเรียน</option>{formData.sections.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                                </select></div>
                            <div><label className="block text-sm font-medium text-surface-600 mb-1">สถานประกอบการ</label>
                                <select value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm">
                                    <option value="">เลือกสถานประกอบการ</option>{formData.companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select></div>
                        </div>
                    )}
                    {form.role === 'student' && formData && (
                        <div><label className="block text-sm font-medium text-surface-600 mb-1">ครูนิเทศก์</label>
                            <select value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm">
                                <option value="">เลือกครูนิเทศก์</option>{formData.teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
                            </select></div>
                    )}
                    {form.role === 'mentor' && formData && (
                        <div><label className="block text-sm font-medium text-surface-600 mb-1">สถานประกอบการ</label>
                            <select value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full px-4 py-2.5 bg-white border border-surface-100 rounded-xl text-sm">
                                <option value="">เลือกสถานประกอบการ</option>{formData.companies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select></div>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal({ open: false, mode: 'create', data: null })} className="px-5 py-2.5 bg-surface-100 text-surface-600 rounded-xl text-sm font-medium hover:bg-surface-200 transition-colors">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]" style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 12px rgba(109,62,242,0.25)' }}>{modal.mode === 'create' ? 'เพิ่ม' : 'บันทึก'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

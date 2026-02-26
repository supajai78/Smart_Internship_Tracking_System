import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { MapPin, Plus, Calendar, Building2, FileText, MessageSquare } from 'lucide-react';

export default function Supervisions() {
    const [supervisions, setSupervisions] = useState([]);
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ company: '', visitDate: '', notes: '', recommendations: '', studentsVisited: [] });

    useEffect(() => {
        Promise.all([api.get('/teacher/supervisions'), api.get('/teacher/supervisions/form-data')])
            .then(([s, fd]) => { setSupervisions(s.data); setFormData(fd.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/teacher/supervisions', form);
            toast.success('บันทึกการนิเทศสำเร็จ'); setModal(false);
            const res = await api.get('/teacher/supervisions');
            setSupervisions(res.data);
        } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6d3ef2, #8b5cf6)' }}>
                        <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-surface-900">บันทึกการนิเทศ</h1>
                        <p className="text-surface-500 text-sm mt-0.5">บันทึกการเยี่ยมนิเทศนักศึกษา</p>
                    </div>
                </div>
                <button onClick={() => { setForm({ company: '', visitDate: '', notes: '', recommendations: '', studentsVisited: [] }); setModal(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl transition-all text-sm font-semibold hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 15px rgba(109,62,242,0.25)' }}>
                    <Plus className="w-4 h-4" />บันทึกนิเทศ
                </button>
            </div>

            <div className="space-y-4">
                {supervisions.map((s, idx) => (
                    <div key={s._id} className="bg-white rounded-2xl border border-surface-100 overflow-hidden hover:shadow-lg hover:border-primary-100 transition-all"
                        style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="h-1" style={{ background: `linear-gradient(90deg, #6d3ef2, #22d3ee)` }} />
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)' }}>
                                        <Building2 className="w-5 h-5" style={{ color: '#10b981' }} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-surface-800">{s.company?.name || 'ไม่ระบุ'}</h3>
                                        <p className="text-xs text-surface-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />{new Date(s.visitDate).toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {s.notes && (
                                <div className="p-3 rounded-xl bg-surface-50 text-sm text-surface-600 mb-2 flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />{s.notes}
                                </div>
                            )}
                            {s.recommendations && (
                                <div className="p-3 rounded-xl text-sm border border-primary-100 flex items-start gap-2" style={{ background: 'rgba(109,62,242,0.04)' }}>
                                    <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#6d3ef2' }} />
                                    <span className="text-surface-600">ข้อเสนอแนะ: {s.recommendations}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {supervisions.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
                        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-primary-400" />
                        </div>
                        <p className="text-surface-500 font-medium">ยังไม่มีบันทึกการนิเทศ</p>
                        <p className="text-surface-400 text-sm mt-1">เริ่มบันทึกการเยี่ยมนิเทศครั้งแรก</p>
                    </div>
                )}
            </div>

            <Modal isOpen={modal} onClose={() => setModal(false)} title="📝 บันทึกการนิเทศ" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">สถานประกอบการ *</label>
                            <select value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm">
                                <option value="">เลือกสถานประกอบการ</option>{(formData?.companies || []).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-700 mb-1.5">วันที่เยี่ยม *</label>
                            <input type="date" value={form.visitDate} onChange={e => setForm({ ...form, visitDate: e.target.value })} required className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">บันทึก</label>
                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">ข้อเสนอแนะ</label>
                        <textarea value={form.recommendations} onChange={e => setForm({ ...form, recommendations: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal(false)} className="px-5 py-2.5 bg-surface-100 text-surface-600 rounded-xl text-sm font-medium hover:bg-surface-200 transition-colors">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 4px 12px rgba(109,62,242,0.25)' }}>บันทึก</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { Star, GraduationCap, CheckCircle, Award } from 'lucide-react';

const criteria = [
    { name: 'ความรับผิดชอบในงาน', maxScore: 20 },
    { name: 'ความตรงต่อเวลา', maxScore: 20 },
    { name: 'ความสามารถในการทำงาน', maxScore: 20 },
    { name: 'การทำงานร่วมกับผู้อื่น', maxScore: 20 },
    { name: 'การปฏิบัติตามกฎระเบียบ', maxScore: 20 }
];

export default function MentorEvaluations() {
    const [data, setData] = useState({ students: [], evaluations: [] });
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ open: false, student: null });
    const [scores, setScores] = useState({});
    const [comment, setComment] = useState('');

    useEffect(() => {
        api.get('/mentor/evaluations').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const openEval = (student) => {
        const init = {};
        criteria.forEach(c => { init[c.name] = 0; });
        setScores(init); setComment('');
        setModal({ open: true, student });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const scoreArray = criteria.map(c => ({ criteria: c.name, maxScore: c.maxScore, score: parseInt(scores[c.name]) || 0 }));
        try {
            await api.post(`/mentor/evaluations/${modal.student._id}`, { scores: scoreArray, comment });
            toast.success('บันทึกการประเมินสำเร็จ'); setModal({ open: false, student: null });
            const res = await api.get('/mentor/evaluations'); setData(res.data);
        } catch (err) { toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด'); }
    };

    const hasEval = (id) => data.evaluations.some(e => e.student?._id === id);
    const totalScore = Object.values(scores).reduce((a, b) => a + parseInt(b || 0), 0);

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '3px solid #e2e8f0', borderTopColor: '#6d3ef2' }} />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                    <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-surface-900">ประเมินนักศึกษา</h1>
                    <p className="text-surface-500 text-sm mt-0.5">ประเมินพฤติกรรมการปฏิบัติงาน</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.students.map(s => (
                    <div key={s._id} className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-lg ${hasEval(s._id) ? 'border-emerald-200' : 'border-surface-100 hover:border-primary-100'}`}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                                style={{ background: hasEval(s._id) ? '#10b981' : 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                                {s.firstName?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-surface-800 text-sm">{s.firstName} {s.lastName}</p>
                                <p className="text-xs text-surface-400">{s.major?.name || '-'}</p>
                            </div>
                        </div>
                        {hasEval(s._id) ? (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 px-3 py-2 rounded-xl">
                                <CheckCircle className="w-4 h-4" />ประเมินแล้ว
                            </div>
                        ) : (
                            <button onClick={() => openEval(s)}
                                className="w-full py-2.5 text-sm font-medium text-white rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
                                style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                                <Star className="w-4 h-4" />ประเมิน
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <Modal isOpen={modal.open} onClose={() => setModal({ open: false, student: null })} title={`⭐ ประเมิน: ${modal.student?.firstName} ${modal.student?.lastName}`} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {criteria.map(c => (
                        <div key={c.name} className="p-3 rounded-xl bg-surface-50">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-surface-700">{c.name}</label>
                                <span className="text-sm font-bold" style={{ color: '#8b5cf6' }}>{scores[c.name] || 0}/{c.maxScore}</span>
                            </div>
                            <input type="range" min="0" max={c.maxScore} value={scores[c.name] || 0} onChange={e => setScores({ ...scores, [c.name]: e.target.value })}
                                className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                        </div>
                    ))}
                    <div className="p-3 rounded-xl border-2 border-purple-100 text-center" style={{ background: 'rgba(139,92,246,0.04)' }}>
                        <p className="text-sm text-surface-500">คะแนนรวม</p>
                        <p className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>{totalScore}/100</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5">ความคิดเห็น</label>
                        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-sm" />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModal({ open: false, student: null })} className="px-5 py-2.5 bg-surface-100 text-surface-600 rounded-xl text-sm font-medium hover:bg-surface-200 transition-colors">ยกเลิก</button>
                        <button type="submit" className="px-6 py-2.5 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}>บันทึกประเมิน</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

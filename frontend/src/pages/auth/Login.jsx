import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Rocket, GraduationCap, Building2, ClipboardCheck, BarChart3, ShieldCheck, Users } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(username, password);
            navigate(`/${user.role}/dashboard`);
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = async (uname, pwd) => {
        setUsername(uname);
        setPassword(pwd);
        setError('');
        setLoading(true);
        try {
            const user = await login(uname, pwd);
            navigate(`/${user.role}/dashboard`);
        } catch (err) {
            setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: GraduationCap, title: 'ติดตามนักศึกษา', desc: 'ติดตามสถานะการฝึกงานแบบเรียลไทม์' },
        { icon: Building2, title: 'จัดการสถานประกอบการ', desc: 'เชื่อมต่อกับบริษัทคู่สัญญา MOU' },
        { icon: ClipboardCheck, title: 'บันทึกกิจกรรม', desc: 'ระบบบันทึกรายวัน รายสัปดาห์ อัตโนมัติ' },
        { icon: BarChart3, title: 'รายงานอัจฉริยะ', desc: 'วิเคราะห์ข้อมูลและสร้างรายงานสรุป' },
    ];

    return (
        <div className="min-h-screen flex bg-space-void selection:bg-cyan-500/30 selection:text-white">

            {/* ===== Background Stars (covers entire page) ===== */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(60)].map((_, i) => (
                    <div key={i} className="absolute rounded-full bg-white animate-twinkle shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                        style={{
                            width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
                            top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`, animationDuration: `${Math.random() * 3 + 2}s`,
                            opacity: Math.random() * 0.7 + 0.3
                        }} />
                ))}
                <div className="shooting-star" style={{ top: '12%', left: '15%' }}></div>
                <div className="shooting-star" style={{ top: '55%', left: '65%', animationDelay: '4s' }}></div>
            </div>

            {/* ===== LEFT PANEL — Website Info ===== */}
            <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-center items-center p-12 xl:p-16 overflow-hidden">

                {/* Nebula glows */}
                <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/25 blur-[140px]"></div>
                <div className="absolute bottom-[-15%] right-[-5%] w-[50%] h-[50%] rounded-full bg-cyan-500/15 blur-[120px]"></div>

                {/* Floating Moon */}
                <div className="absolute top-16 right-20 w-28 h-28 rounded-full bg-gradient-to-br from-[#ffebd2] to-[#ffb2dd] shadow-[0_0_80px_rgba(255,235,210,0.5)] animate-float opacity-60" style={{ animationDuration: '7s' }}></div>

                {/* Content */}
                <div className="relative z-10 max-w-lg animate-fade-in-up">
                    {/* Logo */}
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/15">
                            <Rocket className="w-9 h-9 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight leading-none">Smart Intern</h1>
                            <p className="text-[11px] font-bold text-cyan-400 tracking-[0.2em] uppercase mt-0.5">Tracking System</p>
                        </div>
                    </div>

                    {/* Tagline */}
                    <h2 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
                        ระบบจัดการ<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">นักศึกษาฝึกงาน</span><br />
                        อัจฉริยะ
                    </h2>
                    <p className="text-gray-400 text-base leading-relaxed mb-10 max-w-md">
                        แพลตฟอร์มครบวงจรสำหรับติดตามและประเมินผลการฝึกงานของนักศึกษา
                        ใช้งานง่าย ครอบคลุมทุกขั้นตอน ตั้งแต่บันทึกรายวันจนถึงการประเมินผล
                    </p>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 group">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-400/20 flex items-center justify-center border border-white/10 group-hover:from-purple-500/30 group-hover:to-cyan-400/30 transition-all">
                                    <f.icon className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <p className="text-white text-sm font-bold leading-tight">{f.title}</p>
                                    <p className="text-gray-500 text-[11px] mt-1 leading-snug">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8 mt-10 pt-8 border-t border-white/[0.06]">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-400" />
                            <span className="text-white text-sm font-bold">4 บทบาท</span>
                            <span className="text-gray-500 text-[11px]">ผู้ใช้งาน</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-white text-sm font-bold">ปลอดภัย</span>
                            <span className="text-gray-500 text-[11px]">JWT Auth</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== RIGHT PANEL — Login Form (White) ===== */}
            <div className="w-full lg:w-[45%] flex items-center justify-center px-6 py-10 relative bg-white">

                <div className="relative z-10 w-full max-w-[400px] animate-scale-up" style={{ animationDuration: '0.5s' }}>

                    {/* Mobile-only branding */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="flex justify-center mb-3">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#0f0f23] border border-gray-700">
                                <Rocket className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900">Smart Intern</h1>
                        <p className="text-[10px] font-bold text-purple-600 tracking-[0.2em] uppercase mt-1">Tracking System</p>
                    </div>

                    {/* Card Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">ยินดีต้อนรับ</h2>
                        <p className="text-gray-400 text-sm mt-2">เข้าสู่ระบบเพื่อใช้งาน</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-5 p-3.5 rounded-xl text-sm font-medium animate-slide-down bg-red-50 text-red-600 border border-red-200 flex items-center justify-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">ชื่อผู้ใช้</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full py-3 px-5 rounded-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                                placeholder="Username"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">รหัสผ่าน</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full py-3 px-5 rounded-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                                placeholder="Password"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between pt-1 pb-2">
                            <label className="flex items-center gap-2 cursor-pointer group/cb">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-400 cursor-pointer" />
                                <span className="text-[12px] font-medium text-gray-500 group-hover/cb:text-gray-900 transition-colors">จดจำฉัน</span>
                            </label>
                            <a href="#" className="text-[12px] font-medium text-purple-600 hover:text-purple-800 hover:underline transition-colors">
                                ลืมรหัสผ่าน?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 font-bold tracking-wide text-base text-white rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 hover:shadow-lg hover:shadow-purple-200 transition-all duration-300 active:scale-[0.98]"
                        >
                            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                        </button>
                    </form>

                    {/* Demo Accounts */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-[0.15em] mb-4">ทดลองใช้งาน</p>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button type="button" onClick={() => quickLogin('admin', 'admin123')} className="py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all flex items-center justify-center gap-2 group">
                                <span className="text-base group-hover:scale-110 transition-transform">👑</span> Admin
                            </button>
                            <button type="button" onClick={() => quickLogin('teacher01', 'teacher123')} className="py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all flex items-center justify-center gap-2 group">
                                <span className="text-base group-hover:scale-110 transition-transform">👩‍🏫</span> Teacher
                            </button>
                            <button type="button" onClick={() => quickLogin('mentor01', 'mentor123')} className="py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all flex items-center justify-center gap-2 group">
                                <span className="text-base group-hover:scale-110 transition-transform">🏢</span> Mentor
                            </button>
                            <button type="button" onClick={() => quickLogin('student01', 'student123')} className="py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 transition-all flex items-center justify-center gap-2 group">
                                <span className="text-base group-hover:scale-110 transition-transform">🎓</span> Student
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-[11px] text-gray-300 mt-8">
                        © 2026 Smart Intern Tracking System
                    </p>
                </div>
            </div>
        </div>
    );
}

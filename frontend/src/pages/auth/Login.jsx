import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Eye, EyeOff, Rocket } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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

    return (
        <div className="min-h-screen flex" style={{ background: '#0a0b14' }}>
            {/* Left - Space Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0d0e1a 0%, #13132b 40%, #1a0f30 100%)' }}>
                {/* Nebula effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 rounded-full blur-3xl" style={{ background: 'rgba(109, 62, 242, 0.15)' }} />
                    <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl" style={{ background: 'rgba(6, 182, 212, 0.1)' }} />
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full blur-2xl" style={{ background: 'rgba(109, 62, 242, 0.08)' }} />
                    {/* Stars */}
                    {[...Array(30)].map((_, i) => (
                        <div key={i} className="absolute rounded-full animate-twinkle"
                            style={{
                                width: `${Math.random() * 2 + 1}px`,
                                height: `${Math.random() * 2 + 1}px`,
                                background: 'white',
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                opacity: Math.random() * 0.5 + 0.2
                            }} />
                    ))}
                </div>

                <div className="relative z-10 flex flex-col justify-center px-16" style={{ color: '#fff' }}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-float"
                            style={{ background: 'linear-gradient(135deg, rgba(109, 62, 242, 0.3), rgba(6, 182, 212, 0.2))', boxShadow: '0 0 30px rgba(109, 62, 242, 0.3)' }}>
                            <Rocket className="w-8 h-8" style={{ color: '#fff' }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold" style={{ color: '#fff' }}>Smart Intern</h1>
                            <p className="text-sm" style={{ color: '#7c5cf7' }}>Tracking System</p>
                        </div>
                    </div>
                    <p className="text-lg leading-relaxed mb-12 max-w-md" style={{ color: '#a3a8c4' }}>
                        ระบบติดตามการฝึกงานอัจฉริยะ จัดการข้อมูลนักศึกษาฝึกงาน ลงเวลา ประเมินผลได้อย่างครบวงจร
                    </p>
                    <div className="space-y-4">
                        {[
                            { emoji: '🛰️', text: 'ลงเวลาเข้า-ออกงานด้วย GPS' },
                            { emoji: '📡', text: 'ติดตามความก้าวหน้าแบบ Real-time' },
                            { emoji: '⭐', text: 'ประเมินผลจากครูนิเทศก์และพี่เลี้ยง' },
                            { emoji: '🌍', text: 'ใช้งานได้ทุกอุปกรณ์' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3" style={{ color: '#8b90b0' }}>
                                <span className="text-xl">{f.emoji}</span>
                                <span className="text-sm">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #f8f9fc 0%, #eef1f8 50%, #f0ecf9 100%)' }}>
                {/* Subtle decorative circles */}
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(109, 62, 242, 0.06)' }} />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(34, 211, 238, 0.06)' }} />

                <div className="w-full max-w-md relative z-10">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)' }}>
                            <Rocket className="w-6 h-6" style={{ color: '#fff' }} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-surface-900">Smart Intern</h1>
                            <p className="text-xs" style={{ color: '#7c5cf7' }}>Tracking System</p>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-3xl shadow-xl border border-surface-100/80 overflow-hidden"
                        style={{ boxShadow: '0 8px 40px rgba(109, 62, 242, 0.08), 0 2px 12px rgba(0,0,0,0.04)' }}>
                        {/* Gradient accent bar */}
                        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #6d3ef2, #22d3ee, #6d3ef2)' }} />

                        <div className="px-8 pt-8 pb-6">
                            <div className="text-center mb-8">
                                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, rgba(109,62,242,0.1), rgba(34,211,238,0.1))' }}>
                                    <LogIn className="w-7 h-7" style={{ color: '#6d3ef2' }} />
                                </div>
                                <h2 className="text-2xl font-bold text-surface-900">เข้าสู่ระบบ</h2>
                                <p className="text-sm mt-1 text-surface-400">กรอกชื่อผู้ใช้และรหัสผ่าน</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl text-sm animate-slide-down bg-red-50 text-red-700 border border-red-200">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-surface-700">ชื่อผู้ใช้</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl transition-all text-sm bg-surface-50/80 border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
                                        placeholder="กรอกชื่อผู้ใช้"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 text-surface-700">รหัสผ่าน</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl transition-all text-sm pr-12 bg-surface-50/80 border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 focus:bg-white"
                                            placeholder="กรอกรหัสผ่าน"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                                    style={{
                                        background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)',
                                        color: '#fff',
                                        boxShadow: '0 4px 15px rgba(109, 62, 242, 0.3)'
                                    }}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5" />
                                            เข้าสู่ระบบ
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Quick Login Buttons */}
                        <div className="px-8 pb-8 pt-4 border-t border-surface-100" style={{ background: 'rgba(248,249,252,0.5)' }}>
                            <p className="text-xs text-center mb-3 text-surface-400">บัญชีทดสอบ</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: '👨‍💼 Admin', user: 'admin', pass: 'admin123' },
                                    { label: '👨‍🏫 Teacher', user: 'teacher01', pass: 'teacher123' },
                                    { label: '👨‍🎓 Student', user: 'student01', pass: 'student123' },
                                    { label: '👨‍🔧 Mentor', user: 'mentor01', pass: 'mentor123' },
                                ].map((acc) => (
                                    <button
                                        key={acc.user}
                                        onClick={() => quickLogin(acc.user, acc.pass)}
                                        disabled={loading}
                                        className="py-2.5 px-3 rounded-xl text-xs font-medium transition-all disabled:opacity-50 bg-white border border-surface-200 text-surface-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50/50 hover:shadow-sm"
                                    >
                                        {acc.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

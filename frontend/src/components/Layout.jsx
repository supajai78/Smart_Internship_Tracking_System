import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Calendar, Search, Bell, Settings, LogOut } from 'lucide-react';

export default function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = new Intl.DateTimeFormat('th-TH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(currentTime);

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#f4f6fb]">
            {/* Ambient Dimensional Background Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vh] rounded-full blur-[120px] pointer-events-none" style={{ background: 'rgba(109, 62, 242, 0.15)' }} />
            <div className="fixed bottom-[-10%] right-[-5%] w-[35vw] h-[35vh] rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(34, 211, 238, 0.12)' }} />
            <div className="fixed top-[40%] left-[60%] w-[25vw] h-[25vh] rounded-full blur-[90px] pointer-events-none" style={{ background: 'rgba(139, 92, 246, 0.1)' }} />

            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

            {/* Main Content */}
            <div className={`transition-all duration-300 relative z-10 ml-0 ${collapsed ? 'md:ml-20' : 'md:ml-64'} pb-24 md:pb-0`}>
                {/* Top Header - Floating Glass */}
                <header className="sticky top-4 z-20 mx-6 mb-6 px-6 py-4 glass-panel rounded-2xl">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <div className="flex items-center gap-4">
                            {/* Mobile Hamburger Menu replaced by Mobile Top Info/Logout */}
                            <div className="md:hidden flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                                    style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)' }}>
                                    {user?.firstName?.charAt(0) || 'U'}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-surface-900 leading-none">{user?.firstName}</span>
                                    <span className="text-[10px] text-primary-500 font-semibold">{user?.role}</span>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl bg-white/50 border border-surface-200/50" style={{ color: '#6d3ef2' }}>
                                <Calendar className="w-4 h-4 opacity-70" />
                                <span>{formattedDate}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-5">
                            {/* Action Icons */}
                            <div className="hidden sm:flex items-center gap-2">
                                <button className="p-2 rounded-xl text-surface-400 hover:text-primary-500 hover:bg-white hover:shadow-sm transition-all relative">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 border border-white"></span>
                                </button>
                                <button className="p-2 rounded-xl text-surface-400 hover:text-primary-500 hover:bg-white hover:shadow-sm transition-all">
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="h-8 w-px bg-surface-200 hidden sm:block"></div>

                            {/* Profile Info in Navbar */}
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-bold text-surface-900 tracking-tight">
                                    {user?.firstName} {user?.lastName}
                                </span>
                                <span className="text-xs font-semibold" style={{ color: '#6d3ef2' }}>
                                    {user?.role === 'admin' ? 'ผู้ดูแลระบบ' :
                                        user?.role === 'teacher' ? 'ครูนิเทศก์' :
                                            user?.role === 'mentor' ? 'พี่เลี้ยงประจำอู่' : 'นักศึกษาฝึกงาน'}
                                </span>
                            </div>
                            <div className="w-10 h-10 rounded-xl text-white hidden sm:flex items-center justify-center font-bold text-base border-2 border-white shadow-sm"
                                style={{
                                    background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)',
                                    boxShadow: '0 4px 15px rgba(109, 62, 242, 0.25)'
                                }}>
                                {user?.firstName?.charAt(0) || 'U'}
                            </div>

                            {/* Mobile Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="md:hidden p-2 rounded-xl text-red-500 hover:bg-red-50 transition-all bg-white/50 border border-red-100"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="text-center py-6 text-xs text-surface-400 font-medium">
                    © 2024 Smart Internship Tracking System · 💎 Premium Glass Edition
                </footer>
            </div>
        </div>
    );
}

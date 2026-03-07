import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard, Users, Building2, GraduationCap, BookOpen,
    Layers, FolderTree, Briefcase, Calendar, ClipboardCheck,
    FileText, Clock, LogOut, ChevronLeft, Star, MapPin, Send, Rocket
} from 'lucide-react';

const menuByRole = {
    admin: [
        { label: 'แดชบอร์ด', icon: LayoutDashboard, path: '/admin/dashboard' },
        { type: 'divider', label: 'ภาพรวม' },
        { label: 'ปีการศึกษา', icon: Calendar, path: '/admin/academic-years' },
        { type: 'divider', label: 'จัดการข้อมูล' },
        { label: 'แผนกวิชา', icon: Building2, path: '/admin/departments' },
        { label: 'สาขาวิชา', icon: FolderTree, path: '/admin/majors' },
        { label: 'ห้องเรียน', icon: Layers, path: '/admin/sections' },
        { label: 'สถานประกอบการ', icon: Briefcase, path: '/admin/companies' },
        { label: 'ผู้ใช้งาน', icon: Users, path: '/admin/users' },
    ],
    teacher: [
        { label: 'แดชบอร์ด', icon: LayoutDashboard, path: '/teacher/dashboard' },
        { type: 'divider', label: 'นักศึกษา' },
        { label: 'นักศึกษา', icon: GraduationCap, path: '/teacher/students' },
        { type: 'divider', label: 'การดำเนินงาน' },
        { label: 'บันทึกนิเทศ', icon: MapPin, path: '/teacher/supervisions' },
        { label: 'ตรวจรายงาน', icon: FileText, path: '/teacher/weekly-reports' },
        { label: 'ประเมินผล', icon: Star, path: '/teacher/evaluations' },
    ],
    student: [
        { label: 'แดชบอร์ด', icon: LayoutDashboard, path: '/student/dashboard' },
        { type: 'divider', label: 'การฝึกงาน' },
        { label: 'ลงเวลา', icon: Clock, path: '/student/attendance' },
        { label: 'บันทึกรายวัน', icon: FileText, path: '/student/daily-logs' },
        { label: 'รายงานรายสัปดาห์', icon: Send, path: '/student/weekly-reports' },
        { label: 'ใบลา', icon: ClipboardCheck, path: '/student/leave-requests' },
    ],
    mentor: [
        { label: 'แดชบอร์ด', icon: LayoutDashboard, path: '/mentor/dashboard' },
        { type: 'divider', label: 'นักศึกษา' },
        { label: 'นักศึกษา', icon: GraduationCap, path: '/mentor/students' },
        { label: 'ใบลา', icon: ClipboardCheck, path: '/mentor/leave-requests' },
        { label: 'ประเมินผล', icon: Star, path: '/mentor/evaluations' },
    ],
};

const roleLabels = {
    admin: 'ผู้ดูแลระบบ',
    teacher: 'ครูนิเทศก์',
    student: 'นักศึกษา',
    mentor: 'พี่เลี้ยง',
};

export default function Sidebar({ collapsed, onToggle }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const menu = menuByRole[user?.role] || [];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside className={`max-md:hidden fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 glass-sidebar shadow-2xl ${collapsed ? 'w-20' : 'w-64'}`}>

                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-6" style={{ borderBottom: '1px solid rgba(109, 62, 242, 0.12)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 animate-float"
                        style={{ background: 'linear-gradient(135deg, rgba(109, 62, 242, 0.3), rgba(6, 182, 212, 0.2))', boxShadow: '0 0 15px rgba(109, 62, 242, 0.2)' }}>
                        🚀
                    </div>
                    {!collapsed && (
                        <div className="animate-fade-in">
                            <h1 className="font-bold text-sm leading-tight text-white">Smart Intern</h1>
                            <p className="text-[10px] uppercase tracking-wider" style={{ color: '#7c5cf7' }}>Tracking System</p>
                        </div>
                    )}
                </div>

                {/* Menu */}
                <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-3">
                    {menu.map((item, i) => {
                        if (item.type === 'divider') {
                            return !collapsed ? (
                                <div key={i} className="pt-4 pb-1 px-3">
                                    <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(124, 92, 247, 0.5)' }}>{item.label}</span>
                                </div>
                            ) : <div key={i} className="pt-2" />;
                        }

                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group ${collapsed ? 'justify-center' : ''}`
                                }
                                style={({ isActive }) => isActive ? {
                                    background: 'linear-gradient(135deg, rgba(109, 62, 242, 0.8), rgba(6, 182, 212, 0.6))',
                                    color: '#fff',
                                    boxShadow: '0 4px 15px rgba(109, 62, 242, 0.4), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    transform: 'translateY(-1px)'
                                } : {
                                    color: '#a3a8c4',
                                    background: 'transparent',
                                    border: '1px solid transparent'
                                }}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User Profile + Collapse */}
                <div className="p-3 space-y-2" style={{ borderTop: '1px solid rgba(109, 62, 242, 0.12)' }}>
                    {!collapsed && user && (
                        <div className="flex items-center gap-3 px-3 py-2">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                                style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 0 12px rgba(109, 62, 242, 0.3)' }}>
                                {user.firstName?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold truncate text-white">{user.firstName}</p>
                                <p className="text-[10px] uppercase" style={{ color: '#22d3ee' }}>{roleLabels[user.role]}</p>
                            </div>
                        </div>
                    )}

                    <div className={`flex ${collapsed ? 'flex-col' : ''} gap-1`}>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all w-full hover:text-white"
                            style={{ color: '#8b90b0' }}
                            onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
                            onMouseLeave={e => e.target.style.background = 'transparent'}
                        >
                            <LogOut className="w-4 h-4" />
                            {!collapsed && <span>ออกจากระบบ</span>}
                        </button>
                        <button
                            onClick={onToggle}
                            className="flex items-center justify-center p-2 rounded-xl transition-all hover:text-white"
                            style={{ color: '#6b7194' }}
                        >
                            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </aside>

            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 px-2 flex overflow-x-auto items-center h-[84px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] gap-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
                {menu.filter(item => item.type !== 'divider').map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-[76px] h-full shrink-0 transition-all duration-300 ${isActive ? 'translate-y-[-2px]' : 'opacity-60 hover:opacity-100'}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`flex items-center justify-center w-14 h-9 rounded-[14px] transition-all duration-300 ${isActive ? 'bg-gradient-to-tr from-[#6d3ef2] to-[#22d3ee] shadow-[0_4px_15px_rgba(109,62,242,0.4)] text-white scale-110' : 'bg-transparent text-[#a3a8c4] scale-100'}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-[10px] font-bold tracking-wide whitespace-nowrap mt-1.5 transition-all duration-300 ${isActive ? 'text-[#6d3ef2]' : 'text-[#a3a8c4]'}`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </>
    );
}

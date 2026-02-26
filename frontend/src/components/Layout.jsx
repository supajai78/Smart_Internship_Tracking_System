import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Menu } from 'lucide-react';

export default function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAuth();

    return (
        <div className="min-h-screen" style={{ background: '#f0f2f7' }}>
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

            {/* Main Content */}
            <div className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
                {/* Top Header */}
                <header className="sticky top-0 z-20 px-6 py-4 bg-white/80 backdrop-blur-lg border-b border-surface-200/50">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="lg:hidden p-2 rounded-lg text-surface-500 hover:bg-surface-100"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-sm"
                                style={{
                                    background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)',
                                    boxShadow: '0 2px 10px rgba(109, 62, 242, 0.25)'
                                }}>
                                {user?.firstName?.charAt(0) || 'U'}
                            </div>
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
                <footer className="text-center py-4 text-xs text-surface-400">
                    © 2024 Smart Internship Tracking System · 🚀 Space Edition
                </footer>
            </div>
        </div>
    );
}

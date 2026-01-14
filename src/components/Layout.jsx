import React from 'react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children, activePage, setActivePage }) => {
    const { user, login } = useAuth();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                                AG
                            </div>
                            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                                Anti Gravity Intelligence
                            </span>
                        </div>

                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {['Dashboard', 'Bookings', 'Capacity', 'Exceptions'].map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setActivePage(page)}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activePage === page
                                            ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-sm text-right hidden sm:block">
                                <div className="text-gray-200 font-medium">{user?.name}</div>
                                <div className="text-xs text-gray-500 uppercase tracking-wider">{user?.role}</div>
                            </div>
                            <select
                                className="bg-white/5 border border-white/10 rounded-md text-xs px-2 py-1 text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={user?.role}
                                onChange={(e) => login(e.target.value)}
                            >
                                <option value="admin">Admin View</option>
                                <option value="vendor">Vendor View</option>
                            </select>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;

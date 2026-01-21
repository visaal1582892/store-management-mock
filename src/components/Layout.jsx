import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
    const { user, login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    // Helper to check active state
    const isActive = (path) => location.pathname === path;

    const navItems = (() => {
        if (user?.role === 'vendor') return [{ name: 'Bookings', path: '/bookings', icon: '📅' }];
        if (user?.role === 'warehouse_employee') return [
            { name: 'Vehicle Monitoring', path: '/live-operations', icon: '⚡' },
            { name: 'Bookings', path: '/warehouse-ops', icon: '📋' },
            { name: 'Capacity', path: '/capacity', icon: '🏗️' },
        ];
        return [
            { name: 'Dashboard', path: '/dashboard', icon: '📊' },
            { name: 'Capacity', path: '/capacity', icon: '🏗️' }
        ];
    })();

    return (
        <div className="min-h-screen bg-gray-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">

            {/* Top Header - Full Width & Fixed */}
            <header className="fixed top-0 inset-x-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-300 shadow-sm transition-all">
                <div className="flex items-center gap-3">
                    {/* Mobile Logo / Text */}
                    <div className="flex items-center gap-2 font-bold text-slate-900 md:hidden">
                        <span className="bg-indigo-600 text-white p-1 rounded">VS</span> Vehicle Slot Mgmt
                    </div>
                    {/* Desktop Logo / Text */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/20 shrink-0">
                            VS
                        </div>
                        <div className="font-bold text-lg text-slate-900 tracking-tight">
                            Vehicle Slot Management
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:block text-sm text-slate-500">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="hidden md:block h-4 w-px bg-gray-300"></div>

                    {/* Mobile Role Switcher */}
                    <select
                        className="md:hidden bg-white border border-gray-300 rounded text-xs px-2 py-1"
                        value={user?.role}
                        onChange={(e) => {
                            const newRole = e.target.value;
                            login(newRole);
                            if (newRole === 'vendor') {
                                navigate('/bookings');
                            } else if (newRole === 'warehouse_employee') {
                                navigate('/live-operations');
                            } else {
                                navigate('/dashboard');
                            }
                        }}
                    >
                        <option value="admin">Admin</option>
                        <option value="vendor">Vendor</option>
                        <option value="warehouse_employee">Warehouse</option>
                    </select>

                    <div className="hidden md:block text-sm font-medium text-slate-700">
                        {user?.name}
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <div className="flex pt-16 min-h-screen">

                {/* Sidebar - Below Header - Compact */}
                <aside
                    className={`fixed left-0 top-16 bottom-0 z-50 hidden md:flex flex-col bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out z-100 ${isHovered ? 'w-56' : 'w-16'}`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Navigation */}
                    <nav className="flex-1 px-2 py-6 space-y-1 overflow-hidden">
                        {navItems.map((page) => (
                            <button
                                key={page.name}
                                onClick={() => navigate(page.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive(page.path)
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-gray-50'
                                    }`}
                                title={!isHovered ? page.name : ''}
                            >
                                <span className="text-lg shrink-0 text-center w-5 flex justify-center">{page.icon}</span>
                                <span className={`whitespace-nowrap transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 hidden lg:block'}`}>
                                    {page.name}
                                </span>
                            </button>
                        ))}
                    </nav>

                    {/* User Footer - Compact */}
                    <div className="p-3 border-t border-gray-100 bg-gray-50/50 overflow-hidden whitespace-nowrap">
                        <div className="flex items-center gap-3 mb-3 min-w-max">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                                {user?.role === 'admin' ? 'AD' : user?.role === 'vendor' ? 'VN' : 'WH'}
                            </div>
                            <div className={`overflow-hidden transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="text-xs font-semibold text-slate-900 truncate">{user?.name}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</div>
                            </div>
                        </div>

                        <select
                            className={`w-full bg-white border border-gray-300 rounded-md text-[10px] px-1 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            value={user?.role}
                            onChange={(e) => {
                                const newRole = e.target.value;
                                login(newRole);
                                if (newRole === 'vendor') {
                                    navigate('/bookings');
                                } else if (newRole === 'warehouse_employee') {
                                    navigate('/live-operations');
                                } else {
                                    navigate('/dashboard');
                                }
                            }}
                        >
                            <option value="admin">Switch Admin</option>
                            <option value="vendor">Switch Vendor</option>
                            <option value="warehouse_employee">Switch Warehouse</option>
                        </select>
                    </div>
                </aside>

                {/* Content Wrapper */}
                <div className="flex-1 md:ml-16 transition-all duration-300 min-w-0">
                    <main className="p-4 sm:p-6 w-full max-w-full">
                        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                            <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-indigo-50/40 blur-[120px]" />
                            <div className="absolute bottom-0 left-64 w-[40%] h-[40%] rounded-full bg-blue-50/40 blur-[120px]" />
                        </div>
                        {children}
                    </main>
                </div>

            </div>
        </div>
    );
};

export default Layout;

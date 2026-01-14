import React from 'react';
import { useLogistics } from '../context/LogisticsContext';

const Dashboard = () => {
    const { bookings, warehouses } = useLogistics();

    // Metrics Logic
    const activeBookings = bookings.filter(b => ['Confirmed'].includes(b.status));

    const criticalDelays = bookings.filter(b => b.status === 'Delayed').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Network Overview</h1>
                <p className="text-slate-500 mt-1">Real-time capacity and logistics monitoring</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Active Bookings', value: activeBookings.length, color: 'text-indigo-600', sub: 'Inbound', bg: 'bg-indigo-50 border-indigo-100' },

                    { label: 'Vehicle Slot Breaches', value: '0', color: 'text-emerald-600', sub: 'No violations', bg: 'bg-emerald-50 border-emerald-100' },
                    { label: 'Critical Delays', value: criticalDelays, color: 'text-rose-600', sub: 'Immediate attention', bg: 'bg-rose-50 border-rose-100' },
                ].map((stat, i) => (
                    <div key={i} className={`border rounded-xl p-6 transition-all shadow-sm ${stat.bg}`}>
                        <h3 className="text-slate-600 text-sm font-medium">{stat.label}</h3>
                        <div className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="mt-1 text-xs text-slate-500">{stat.sub}</div>
                    </div>
                ))}
            </div>

            {/* Map & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Alerts Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-semibold text-slate-800">Live Operations Feed</h3>
                            <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full border border-emerald-200 font-medium">System Online</span>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {bookings.slice().reverse().map((bkg, i) => (
                                <div key={i} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-start gap-4 group">
                                    <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${bkg.status === 'Delayed' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}
                                        }`} />
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-slate-800">
                                            {bkg.status === 'Confirmed' && `New Booking: ${bkg.vendorName}`}
                                            {bkg.status === 'Delayed' && `Delay Reported: ${bkg.vehicleNumber}`}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5 group-hover:text-slate-700">
                                            {warehouses.find(w => w.id === bkg.warehouseId)?.name || bkg.warehouseId} • {new Date(bkg.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-slate-600 font-medium border border-gray-200">
                                        {bkg.status}
                                    </div>
                                </div>
                            ))}
                            {bookings.length === 0 && (
                                <div className="p-12 text-center text-slate-400 text-sm">No recent activity</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Capacity Map (Simplified List for now) */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-semibold text-slate-800">Hub Capacity Status</h3>
                        </div>
                        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {warehouses.slice(0, 15).map((wh, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors cursor-default">
                                    <div className="truncate w-[70%]">
                                        <div className="text-sm text-slate-700 font-medium truncate" title={wh.name}>{wh.name}</div>
                                        <div className="text-xs text-slate-400">{wh.city}, {wh.code}</div>
                                    </div>
                                    <div className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">2/3 Open</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

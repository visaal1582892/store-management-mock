import React from 'react';
import { useLogistics } from '../context/LogisticsContext';

const Dashboard = () => {
    const { bookings, warehouses } = useLogistics();

    // Metrics Logic
    const activeBookings = bookings.filter(b => ['Confirmed', 'Exception Approved'].includes(b.status));
    const exceptions = bookings.filter(b => ['Exception Requested', 'Delayed'].includes(b.status));
    const criticalDelays = bookings.filter(b => b.status === 'Delayed').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Network Overview</h1>
                <p className="text-gray-400 mt-1">Real-time capacity and logistics monitoring</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Bookings', value: activeBookings.length, color: 'text-blue-400', sub: 'Inbound' },
                    { label: 'Pending Exceptions', value: exceptions.length, color: 'text-amber-400', sub: 'Action required' },
                    { label: 'Vehicle Slot Breaches', value: '0', color: 'text-emerald-400', sub: 'No violations' },
                    { label: 'Critical Delays', value: criticalDelays, color: 'text-rose-400', sub: 'Immediate attention' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <div className={`mt-2 text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="mt-1 text-xs text-gray-400">{stat.sub}</div>
                    </div>
                ))}
            </div>

            {/* Map & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Alerts Feed */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-semibold text-white">Live Operations Feed</h3>
                            <span className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">System Online</span>
                        </div>
                        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {bookings.slice().reverse().map((bkg, i) => (
                                <div key={i} className="px-6 py-4 hover:bg-white/5 transition-colors flex items-start gap-4">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full ${bkg.status.includes('Exception') || bkg.status === 'Delayed' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'
                                        }`} />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white">
                                            {bkg.status === 'Confirmed' && `New Booking: ${bkg.vendorName}`}
                                            {bkg.status === 'Delayed' && `Delay Reported: ${bkg.vehicleNumber}`}
                                            {bkg.status === 'Exception Requested' && `Exception Request: ${bkg.vendorName}`}
                                            {bkg.status === 'Exception Approved' && `Exception Approved: ${bkg.vehicleNumber}`}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5">
                                            {warehouses.find(w => w.id === bkg.warehouseId)?.name || bkg.warehouseId} • {new Date(bkg.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-xs px-2 py-1 rounded bg-white/5 text-gray-300 border border-white/10">
                                        {bkg.status}
                                    </div>
                                </div>
                            ))}
                            {bookings.length === 0 && (
                                <div className="p-8 text-center text-gray-500 text-sm">No recent activity</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Capacity Map (Simplified List for now) */}
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                        <div className="px-6 py-4 border-b border-white/10">
                            <h3 className="font-semibold text-white">Hub Capacity Status</h3>
                        </div>
                        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {warehouses.slice(0, 15).map((wh, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
                                    <div className="truncate w-[70%]">
                                        <div className="text-sm text-gray-200 truncate" title={wh.name}>{wh.name}</div>
                                        <div className="text-xs text-gray-500">{wh.city}, {wh.code}</div>
                                    </div>
                                    <div className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">2/3 Open</div>
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

import React, { useState } from 'react';
import { useLogistics } from '../context/LogisticsContext';

const SlotGrid = () => {
    const { warehouses, slots } = useLogistics();
    const [filterState, setFilterState] = useState('');

    const filteredWarehouses = filterState
        ? warehouses.filter(w => w.state === filterState)
        : warehouses;

    // Get unique states for filter
    const states = [...new Set(warehouses.map(w => w.state))];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Capacity Management</h2>
                    <p className="text-gray-400 text-sm mt-1">Monitor slot utilization across all regional hubs.</p>
                </div>
                <div className="flex gap-4">
                    <select
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">All Regions</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                        Upload Excel Schedule
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="min-w-[1000px] border border-white/5 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-white/5 text-gray-200 font-medium uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Warehouse</th>
                                <th className="px-6 py-4">State</th>
                                {/* Generate Headers for next 7 days */}
                                {[...Array(7)].map((_, i) => {
                                    const d = new Date();
                                    d.setDate(d.getDate() + i);
                                    return (
                                        <th key={i} className="px-4 py-4 text-center">
                                            {d.toLocaleDateString('en-US', { weekday: 'short' })}<br />
                                            <span className="text-xs opacity-60">{d.getDate()}</span>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-black/20">
                            {filteredWarehouses.map((wh) => (
                                <tr key={wh.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{wh.name}</td>
                                    <td className="px-6 py-4 text-xs">{wh.state}</td>

                                    {[...Array(7)].map((_, i) => {
                                        const d = new Date();
                                        d.setDate(d.getDate() + i);
                                        const dateKey = d.toISOString().split('T')[0];
                                        const slot = slots[wh.id]?.[dateKey];

                                        // Sunday Check
                                        if (d.getDay() === 0) {
                                            return (
                                                <td key={i} className="px-4 py-4 text-center bg-white/5">
                                                    <span className="text-xs text-gray-600 font-mono">HOLIDAY</span>
                                                </td>
                                            );
                                        }

                                        if (!slot) return <td key={i} className="px-4 py-4 text-center">-</td>;

                                        const percentage = (slot.booked / slot.total) * 100;
                                        const color = percentage >= 100 ? 'bg-rose-500' : percentage > 50 ? 'bg-amber-500' : 'bg-emerald-500';

                                        return (
                                            <td key={i} className="px-4 py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className={`w-8 h-1 rounded-full ${color}/20 overflow-hidden`}>
                                                        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
                                                    </div>
                                                    <span className={`text-xs font-mono ${percentage >= 100 ? 'text-rose-400' : 'text-gray-400'}`}>
                                                        {slot.booked}/{slot.total}
                                                    </span>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SlotGrid;

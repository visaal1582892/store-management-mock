import React, { useState } from 'react';
import { useLogistics } from '../context/LogisticsContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SlotGrid = () => {
    const { warehouses, slots } = useLogistics();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filterState, setFilterState] = useState('');

    const isEmployee = user?.role === 'warehouse_employee';

    // Default range: Today + next 6 days (7 days total)
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 6);
        return d.toISOString().split('T')[0];
    });

    // Generate 3 static slots for the day
    const getSlotTimings = (date) => {
        const d = new Date(date);
        if (d.getDay() === 0) return null; // Sunday

        return [
            { id: 1, time: '09:00 - 12:00' },
            { id: 2, time: '13:00 - 16:00' },
            { id: 3, time: '16:00 - 19:00' }
        ];
    };

    const filteredWarehouses = isEmployee
        ? warehouses.filter(w => w.id === user.warehouseId)
        : (filterState ? warehouses.filter(w => w.state === filterState) : warehouses);

    const states = isEmployee ? [] : [...new Set(warehouses.map(w => w.state))];

    const getDateRange = (start, end) => {
        const dateArray = [];
        let currentDate = new Date(start);
        const stopDate = new Date(end);

        while (currentDate <= stopDate) {
            dateArray.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dateArray;
    };

    const dateRange = getDateRange(startDate, endDate);

    // --- EMPLOYEE VIEW RENDER ---
    if (isEmployee) {
        const warehouse = filteredWarehouses[0]; // Should only be one
        if (!warehouse) return <div className="p-4">No warehouse assigned.</div>;

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Capacity Schedule</h2>
                        <p className="text-slate-500 text-sm mt-1">{warehouse.name} ({warehouse.id})</p>
                    </div>
                    <button
                        onClick={() => navigate('/upload-schedule')}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload Schedule
                    </button>
                </div>

                {/* Date Controls */}
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm w-fit">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Range:</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent text-slate-700 outline-none w-32 cursor-pointer text-xs sm:text-sm"
                    />
                    <span className="text-slate-400">→</span>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent text-slate-700 outline-none w-32 cursor-pointer text-xs sm:text-sm"
                    />
                </div>

                <div className="w-full overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
                    <div className="overflow-x-auto custom-scrollbar pb-2">
                        <table className="w-full text-left text-sm text-slate-600 min-w-max">
                            <thead className="bg-gray-50 text-slate-800 font-semibold border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 sticky left-0 bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Date</th>
                                    <th className="px-6 py-4 text-center">Slot 1</th>
                                    <th className="px-6 py-4 text-center">Slot 2</th>
                                    <th className="px-6 py-4 text-center">Slot 3</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dateRange.map((d) => {
                                    const dateKey = d.toISOString().split('T')[0];
                                    const isSunday = d.getDay() === 0;
                                    const slotTimings = getSlotTimings(dateKey);

                                    return (
                                        <tr key={dateKey} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-gray-50 z-20 font-medium text-slate-900 border-r border-gray-100">
                                                {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </td>

                                            {isSunday ? (
                                                <td colSpan="3" className="px-6 py-4 text-center bg-gray-50/50">
                                                    <span className="text-xs text-slate-400 font-bold tracking-wider">WEEKLY HOLIDAY (SUNDAY)</span>
                                                </td>
                                            ) : (
                                                <>
                                                    {slotTimings?.map(slot => (
                                                        <td key={slot.id} className="px-6 py-4 text-center">
                                                            <span className={`text-sm ${slot.time === '-' ? 'text-slate-300' : 'text-slate-600'}`}>
                                                                {slot.time}
                                                            </span>
                                                        </td>
                                                    ))}
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // --- ADMIN VIEW RENDER ---
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Capacity Management</h2>
                    <p className="text-slate-500 text-sm mt-1">Monitor slot utilization across all regional hubs.</p>
                </div>
                <div className="flex flex-wrap gap-4 items-center">

                    {/* Date Range Picker */}
                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Range:</span>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-slate-700 outline-none w-32 cursor-pointer text-xs sm:text-sm"
                        />
                        <span className="text-slate-400">→</span>
                        <input
                            type="date"
                            value={endDate}
                            min={startDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-slate-700 outline-none w-32 cursor-pointer text-xs sm:text-sm"
                        />
                    </div>

                    <select
                        value={filterState}
                        onChange={(e) => setFilterState(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    >
                        <option value="">All Regions</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="w-full overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm">
                <div className="overflow-x-auto custom-scrollbar pb-2">
                    <table className="w-full text-left text-sm text-slate-600 min-w-max">
                        <thead className="bg-gray-50 text-slate-800 font-semibold border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 sticky left-0 bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Warehouse</th>
                                <th className="px-6 py-4">State</th>
                                {/* Generate Headers from Date Range */}
                                {dateRange.map((d, i) => (
                                    <th key={i} className="px-4 py-4 text-center text-slate-500 font-medium min-w-[100px]">
                                        {d.toLocaleDateString('en-US', { weekday: 'short' })}<br />
                                        <span className="text-xs opacity-70 font-normal">{d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredWarehouses.map((wh) => (
                                <tr key={wh.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-gray-50 transition-colors z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-900 line-clamp-1 whitespace-nowrap" title={wh.name}>{wh.name}</span>
                                            <span className="text-xs text-slate-400 font-mono mt-0.5">{wh.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">{wh.state}</td>

                                    {dateRange.map((d, i) => {
                                        const dateKey = d.toISOString().split('T')[0];
                                        const slot = slots[wh.id]?.[dateKey];

                                        // Sunday Check
                                        if (d.getDay() === 0) {
                                            return (
                                                <td key={i} className="px-4 py-4 text-center bg-gray-50/50">
                                                    <span className="text-[10px] text-slate-400 font-bold tracking-wider">SUNDAY</span>
                                                </td>
                                            );
                                        }

                                        if (!slot) return <td key={i} className="px-4 py-4 text-center text-slate-300">-</td>;

                                        const percentage = (slot.booked / slot.total) * 100;
                                        const color = percentage >= 100 ? 'bg-rose-500' : percentage > 50 ? 'bg-amber-500' : 'bg-emerald-500';
                                        const textColor = percentage >= 100 ? 'text-rose-600' : percentage > 50 ? 'text-amber-600' : 'text-emerald-600';

                                        return (
                                            <td key={i} className="px-4 py-4 text-center">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className={`w-10 h-1.5 rounded-full ${color}/20 overflow-hidden`}>
                                                        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
                                                    </div>
                                                    <span className={`text-xs font-mono font-medium ${textColor}`}>
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

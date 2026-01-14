import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Generate initial data for a date
const generateDailyData = (date) => {
    const today = new Date().toISOString().split('T')[0];
    const isPast = date < today;
    const isFuture = date > today;

    // MAX 3 Slots as per new requirement
    const timeSlots = [
        '09:00 - 12:00',
        '13:00 - 16:00',
        '16:00 - 19:00'
    ];

    const data = {};

    timeSlots.forEach((time, index) => {
        // Randomly simulate empty slots
        const isBooked = Math.random() > 0.3;
        const bookings = [];

        if (isBooked) {
            let status = 'Booked';
            let unloadingStatus;
            let entryTime = '-';
            let exitTime = '-';

            if (isPast) {
                // Past: Mostly Completed, rarely Delayed
                unloadingStatus = Math.random() > 0.1 ? 'Completed' : 'Delayed';
                entryTime = '09:15';
                if (unloadingStatus === 'Completed') {
                    exitTime = '11:45';
                }
            } else if (isFuture) {
                // Future: Always Pending
                unloadingStatus = 'Pending';
            } else {
                // Today: Mixed states
                const rand = Math.random();
                unloadingStatus = rand > 0.6 ? 'Pending' : (rand > 0.3 ? 'In-Progress' : 'Completed');

                if (unloadingStatus !== 'Pending') entryTime = '09:15';
                if (unloadingStatus === 'Completed') exitTime = '11:30';
            }

            bookings.push({
                id: `BK-${date.replace(/-/g, '')}-${index}`,
                slotTime: time,
                status: status,
                vendor: `Vendor ${Math.floor(Math.random() * 100)}`,
                vendorId: `VND-${Math.floor(Math.random() * 10000)}`,
                entryTime: entryTime,
                exitTime: exitTime,
                unloadingStatus: unloadingStatus,
                driverName: 'Rajesh Kumar',
                vehicleNo: `TS0${Math.floor(Math.random() * 9)} UB ${Math.floor(1000 + Math.random() * 9000)}`,
                contact: '9876543210'
            });
        } else {
            bookings.push({
                id: `BK-${date.replace(/-/g, '')}-${index}`,
                slotTime: time,
                status: 'Empty',
                vendor: '-',
                vendorId: '-',
                entryTime: '-',
                exitTime: '-',
                unloadingStatus: '-',
                driverName: '-',
                vehicleNo: '-',
                contact: '-'
            });
        }

        data[time] = bookings;
    });
    return data;
};

const LiveOperations = () => {
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Filters
    const [statusFilter, setStatusFilter] = useState('All');
    const [vendorSearch, setVendorSearch] = useState('');
    const [unloadingFilter, setUnloadingFilter] = useState('All');

    // Detailed Vendor Modal
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Mock Data State
    const [operationsData, setOperationsData] = useState(() => generateDailyData(new Date().toISOString().split('T')[0]));

    useEffect(() => {
        setOperationsData(generateDailyData(selectedDate));
    }, [selectedDate]);

    // Live Simulation Effect
    useEffect(() => {
        const isToday = selectedDate === new Date().toISOString().split('T')[0];
        if (!isToday) return;

        const interval = setInterval(() => {
            setOperationsData(prev => {
                const newData = { ...prev };
                Object.keys(newData).forEach(slotKey => {
                    newData[slotKey] = newData[slotKey].map(booking => {
                        if (booking.status !== 'Booked') return booking;

                        // Small chance to update status
                        if (Math.random() < 0.05) {
                            let newUnloading = booking.unloadingStatus;
                            let newEntry = booking.entryTime;
                            let newExit = booking.exitTime;

                            if (booking.unloadingStatus === 'Pending' && Math.random() > 0.5) {
                                newUnloading = 'In-Progress';
                                newEntry = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                            } else if (booking.unloadingStatus === 'In-Progress' && Math.random() > 0.5) {
                                newUnloading = 'Completed';
                                newExit = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                            }

                            return {
                                ...booking,
                                unloadingStatus: newUnloading,
                                entryTime: newEntry,
                                exitTime: newExit
                            };
                        }
                        return booking;
                    });
                });
                return newData;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedDate]);

    const getFilteredBookings = (bookings) => {
        return bookings.filter(b => {
            const statusMatch = statusFilter === 'All' || b.status === statusFilter;
            const vendorMatch = !vendorSearch || b.vendor.toLowerCase().includes(vendorSearch.toLowerCase());
            const unloadingMatch = unloadingFilter === 'All' || b.unloadingStatus === unloadingFilter;
            return statusMatch && vendorMatch && unloadingMatch;
        });
    };

    const hasActiveFilters = statusFilter !== 'All' || vendorSearch !== '' || unloadingFilter !== 'All';

    const clearFilters = () => {
        setStatusFilter('All');
        setVendorSearch('');
        setUnloadingFilter('All');
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            {selectedDate === new Date().toISOString().split('T')[0] && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${selectedDate === new Date().toISOString().split('T')[0] ? 'bg-rose-500' : 'bg-slate-400'}`}></span>
                        </span>
                        Live Operations
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Real-time floor tracking • {user?.warehouseId || 'INTGHYD00763'}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Viewing Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-gray-50 border border-gray-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                        />
                    </div>
                </div>
            </div>

            {/* Main Data Grid */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-gray-50 text-slate-800 font-semibold border-b border-gray-200">
                            {/* Column Headers */}
                            <tr>
                                <th className="px-6 py-4 w-48 bg-gray-50">Time Slot</th>
                                <th className="px-6 py-4 bg-gray-50">Booking Status</th>
                                <th className="px-6 py-4 bg-gray-50">Vendor</th>
                                <th className="px-6 py-4 bg-gray-50">Vehicle Entry</th>
                                <th className="px-6 py-4 bg-gray-50">Vehicle Exit</th>
                                <th className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                                    Unloading Status
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-[10px] bg-rose-50 text-rose-600 px-2 py-1 rounded-full border border-rose-100 hover:bg-rose-100 transition-colors uppercase font-bold tracking-wide shadow-sm"
                                        >
                                            Clear Filters
                                        </button>
                                    )}
                                </th>
                            </tr>
                            {/* Column Filters Row */}
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-2">
                                    {/* No filter for Time Slot */}
                                    <div className="h-8"></div>
                                </th>
                                <th className="px-6 py-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Booked">Booked</option>
                                        <option value="Empty">Empty</option>
                                    </select>
                                </th>
                                <th className="px-6 py-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={vendorSearch}
                                        onChange={(e) => setVendorSearch(e.target.value)}
                                        className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                    />
                                </th>
                                <th className="px-6 py-2"></th>
                                <th className="px-6 py-2"></th>
                                <th className="px-6 py-2">
                                    <select
                                        value={unloadingFilter}
                                        onChange={(e) => setUnloadingFilter(e.target.value)}
                                        className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                    >
                                        <option value="All">All Phases</option>
                                        <option value="Pending">Pending</option>
                                        <option value="In-Progress">In-Progress</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Delayed">Delayed</option>
                                    </select>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Object.entries(operationsData).map(([slotTime, bookings]) => {
                                const filtered = getFilteredBookings(bookings);
                                if (filtered.length === 0) return null;

                                return (
                                    <React.Fragment key={slotTime}>
                                        {filtered.map((booking) => (
                                            <tr key={booking.id} className="hover:bg-indigo-50/30 transition-colors group">
                                                {/* Simple Time Slot Column */}
                                                <td className="px-6 py-4 text-slate-900 font-medium bg-white border-r border-gray-50 align-top">
                                                    <span className="font-mono text-indigo-900 bg-indigo-50 px-2 py-1 rounded text-xs">
                                                        {slotTime}
                                                    </span>
                                                </td>

                                                {/* Data Columns */}
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${booking.status === 'Booked'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-slate-50 text-slate-400 border-slate-200 dashed'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {booking.status === 'Booked' ? (
                                                        <button
                                                            onClick={() => setSelectedBooking(booking)}
                                                            className="font-medium text-slate-700 hover:text-indigo-600 hover:underline flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                                                        >
                                                            {booking.vendor}
                                                            <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-300 font-light italic text-xs">Available</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-600">
                                                    {booking.entryTime !== '-' ? booking.entryTime : <span className="text-slate-300">-</span>}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-600">
                                                    {booking.exitTime !== '-' ? booking.exitTime : <span className="text-slate-300">-</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {booking.status === 'Booked' ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className={`h-2.5 w-2.5 rounded-full border border-white shadow-sm ${booking.unloadingStatus === 'Completed' ? 'bg-emerald-500' :
                                                                    booking.unloadingStatus === 'In-Progress' ? 'bg-amber-500 animate-pulse' :
                                                                        'bg-slate-300'
                                                                }`}></div>
                                                            <span className="text-sm text-slate-700 font-medium">{booking.unloadingStatus}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                    {Object.values(operationsData).every(g => getFilteredBookings(g).length === 0) && (
                        <div className="p-12 text-center">
                            <div className="text-slate-400 mb-2">No slots matched your active filters.</div>
                            <button onClick={clearFilters} className="text-indigo-600 text-sm font-medium hover:underline">Clear all filters</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Vendor Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-500 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-black/5 animate-fade-in-up">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </span>
                                Shipment Details
                            </h3>
                            <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-full p-1 hover:bg-rose-50">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                    {selectedBooking.vendor.charAt(7)}
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-slate-900">{selectedBooking.vendor}</div>
                                    <div className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded inline-block">{selectedBooking.vendorId}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver</label>
                                    <div className="text-sm font-semibold text-slate-800">{selectedBooking.driverName}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle No</label>
                                    <div className="text-sm font-semibold text-slate-800 font-mono tracking-tight">{selectedBooking.vehicleNo}</div>
                                </div>
                            </div>

                            <div className="space-y-1 px-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</label>
                                <div className="text-sm text-slate-600 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {selectedBooking.contact}
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:shadow-indigo-300"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveOperations;

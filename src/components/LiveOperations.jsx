import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLogistics } from '../context/LogisticsContext';
import { Link } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateYYYYMMDD } from '../utils/dateUtils';
import DocumentViewerModal from './DocumentViewerModal';

const LiveOperations = () => {
    const { user } = useAuth();
    const { bookings, slots, warehouses, markVehicleEntered, markVehicleLeft } = useLogistics();

    // Date Range State
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [viewingDoc, setViewingDoc] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        vendor: '',
        vehicle: '',
        schedStatus: ''
    });

    // Detailed Vendor Modal
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Derive Operations Data from Context
    const warehouseId = user?.warehouseId || 'INTGHYD00763';

    // Filter Logic
    const filteredBookings = bookings.filter(b => {
        // Warehouse Check
        if (b.warehouseId !== warehouseId) return false;

        // Status Check (Show only relevant statuses for monitoring)
        if (['Approval Pending', 'Rejected', 'Cancelled'].includes(b.status)) return false;

        // Date Range Filter
        let dateMatch = true;
        if (startDate && endDate) {
            const bDateStr = b.date;
            const startStr = formatDateYYYYMMDD(startDate);
            const endStr = formatDateYYYYMMDD(endDate);
            dateMatch = bDateStr >= startStr && bDateStr <= endStr;
        }

        // Other Filters
        const vendorMatch = !filters.vendor || b.vendorName.toLowerCase().includes(filters.vendor.toLowerCase()) || b.vendorId.toLowerCase().includes(filters.vendor.toLowerCase());
        const vehicleMatch = !filters.vehicle || b.vehicleNumber.toLowerCase().includes(filters.vehicle.toLowerCase());
        const schedMatch = !filters.schedStatus || (b.scheduleStatus && b.scheduleStatus === filters.schedStatus);

        return dateMatch && vendorMatch && vehicleMatch && schedMatch;
        // Sort by Date then Time
    }).sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.slot.split(' - ')[0]}`);
        const dateB = new Date(`${b.date}T${b.slot.split(' - ')[0]}`);
        return dateA - dateB;
    });

    const clearFilters = () => {
        setStartDate(null);
        setEndDate(null);
        setFilters({ vendor: '', vehicle: '', schedStatus: '' });
    };

    return (
        <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                        </span>
                        Vehicle Monitoring
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Live tracking of vehicle entry and exit • {warehouseId}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1 z-30 relative">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date Range</label>
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => {
                                const [start, end] = update;
                                setStartDate(start);
                                setEndDate(end);
                            }}
                            className="bg-gray-50 border border-gray-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-60 p-2 font-medium"
                            dateFormat="MMM d, yyyy"
                            placeholderText="All Dates"
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
                                <th className="px-6 py-4 w-48 bg-gray-50">Date & Time</th>
                                <th className="px-6 py-4 bg-gray-50">Vendor Name</th>
                                <th className="px-6 py-4 bg-gray-50">Vehicle No</th>
                                <th className="px-6 py-4 bg-gray-50 text-center">Documents</th>
                                <th className="px-6 py-4 bg-gray-50 text-center">Schedule Status</th>
                                <th className="px-6 py-4 bg-gray-50 text-center">Entry Date & Time</th>
                                <th className="px-6 py-4 bg-gray-50 text-center">Exit Date & Time</th>
                                <th className="px-6 py-4 bg-gray-50 text-right">Actions</th>
                            </tr>

                            {/* Filter Row */}
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-2"></th>
                                <th className="px-6 py-2">
                                    <input
                                        type="text"
                                        placeholder="Search Vendor..."
                                        className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                        value={filters.vendor}
                                        onChange={e => setFilters({ ...filters, vendor: e.target.value })}
                                    />
                                </th>
                                <th className="px-6 py-2">
                                    <input
                                        type="text"
                                        placeholder="Search Vehicle..."
                                        className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                        value={filters.vehicle}
                                        onChange={e => setFilters({ ...filters, vehicle: e.target.value })}
                                    />
                                </th>
                                <th className="px-6 py-2">
                                    <select
                                        className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                        value={filters.schedStatus}
                                        onChange={e => setFilters({ ...filters, schedStatus: e.target.value })}
                                    >
                                        <option value="">All</option>
                                        <option value="On time">On time</option>
                                        <option value="Entry delayed">Entry delayed</option>
                                        <option value="Exit delayed">Exit delayed</option>
                                    </select>
                                </th>
                                <th className="px-6 py-2"></th>
                                <th className="px-6 py-2"></th>
                                <th className="px-6 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-indigo-50/50 transition-colors group even:bg-slate-50/50 border-b border-gray-100 last:border-0">
                                    {/* Date & Time */}
                                    <td className="px-6 py-4 bg-white border-r border-gray-50 align-top">
                                        <div className="font-bold text-slate-900">{booking.date}</div>
                                        <span className="font-mono text-indigo-900 bg-indigo-50 px-2 py-1 rounded text-xs mt-1 inline-block">
                                            {booking.slot}
                                        </span>
                                    </td>

                                    {/* Vendor Name (Clickable) */}
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedBooking(booking)}
                                            className="font-medium text-slate-700 hover:text-indigo-600 hover:underline flex items-center gap-2 group-hover:translate-x-1 transition-transform text-left"
                                        >
                                            {booking.vendorName}
                                            <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </button>
                                    </td>

                                    {/* Vehicle No */}
                                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-700">
                                        {booking.vehicleNumber}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setViewingDoc(booking)}
                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-center gap-1 mx-auto"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View Docs
                                        </button>
                                    </td>

                                    {/* Schedule Status */}
                                    <td className="px-6 py-4 text-center">
                                        {booking.scheduleStatus === 'On time' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                                On time
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 animate-pulse">
                                                {booking.scheduleStatus}
                                            </span>
                                        )}
                                    </td>

                                    {/* Entry Date & Time */}
                                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-600">
                                        {booking.entryTime ? (
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-slate-700">{new Date(booking.entryTime).toLocaleDateString()}</span>
                                                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 mt-1">
                                                    {new Date(booking.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>

                                    {/* Exit Date & Time */}
                                    <td className="px-6 py-4 text-center font-mono text-xs text-slate-600">
                                        {booking.exitTime ? (
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-slate-700">{new Date(booking.exitTime).toLocaleDateString()}</span>
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 mt-1">
                                                    {new Date(booking.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300">-</span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        {!booking.entryTime && (
                                            (() => {
                                                const [startStr] = booking.slot.split(' - ');
                                                // Create Date object for slot start
                                                const slotStart = new Date(`${booking.date}T${startStr}:00`);
                                                const now = new Date();
                                                // 30 mins before start
                                                const allowEntryTime = new Date(slotStart);
                                                allowEntryTime.setMinutes(allowEntryTime.getMinutes() - 30);

                                                const isTooEarly = now < allowEntryTime;

                                                return (
                                                    <div className="relative group/btn inline-block">
                                                        <button
                                                            onClick={() => markVehicleEntered(booking.id)}
                                                            disabled={isTooEarly}
                                                            className={`px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all
                                                                ${isTooEarly
                                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-200 hover:-translate-y-0.5'
                                                                }`}
                                                        >
                                                            Vehicle Entered
                                                        </button>
                                                        {isTooEarly && (
                                                            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover/btn:opacity-100 transition-opacity z-10 pointer-events-none text-center">
                                                                Entry allowed from {allowEntryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()
                                        )}
                                        {booking.entryTime && !booking.exitTime && (
                                            <button
                                                onClick={() => markVehicleLeft(booking.id)}
                                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold shadow-sm transition-all hover:shadow-rose-200 hover:-translate-y-0.5"
                                            >
                                                Vehicle Exited
                                            </button>
                                        )}
                                        {booking.exitTime && (
                                            <span className="text-xs font-bold text-slate-400 italic">Completed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Empty State */}
                    {filteredBookings.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="bg-slate-50 p-4 rounded-full mb-4">
                                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">No Active Operations</h3>
                            <p className="text-slate-500 max-w-sm">
                                No approved bookings found for the selected criteria.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Document Viewer Modal */}
            <DocumentViewerModal
                isOpen={!!viewingDoc}
                onClose={() => setViewingDoc(null)}
                booking={viewingDoc}
            />

            {/* Vendor Details Modal */}
            {
                selectedBooking && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-black/5 animate-fade-in-up">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </span>
                                    Vendor Details
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
                                        {selectedBooking.vendorName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-slate-900">{selectedBooking.vendorName}</div>
                                        <div className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded inline-block">{selectedBooking.vendorId}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver Contact Number</label>
                                        <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {selectedBooking.driverContact || selectedBooking.contact || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vehicle Number</label>
                                        <div className="text-sm font-mono text-slate-700">{selectedBooking.vehicleNumber}</div>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end">
                                    <button
                                        onClick={() => setSelectedBooking(null)}
                                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:shadow-indigo-300"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default LiveOperations;

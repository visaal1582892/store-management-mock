import React, { useState } from 'react';
import { useLogistics } from '../context/LogisticsContext';
import { useAuth } from '../context/AuthContext';
import { formatDateYYYYMMDD } from '../utils/dateUtils';
import { BOOKING_STATUS } from '../utils/constants';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import DocumentViewerModal from './DocumentViewerModal';

const WarehouseOps = () => {
    const { bookings, approveBooking, rejectBooking } = useLogistics();
    const { user } = useAuth();

    // Date Range State
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Document Viewer State
    const [viewDocBooking, setViewDocBooking] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        vendor: '',
        vehicle: '',
        items: '',
        status: ''
    });

    const filteredBookings = bookings.filter(b => {
        // Administrative visibility check
        const whMatch = user.role === 'admin' || b.warehouseId === user.warehouseId;

        // Date Range Filter
        let dateMatch = true;
        if (startDate && endDate) {
            // Compare YYYY-MM-DD strings for reliability
            const bDateStr = b.date; // string 'YYYY-MM-DD'
            const startStr = formatDateYYYYMMDD(startDate);
            const endStr = formatDateYYYYMMDD(endDate);

            dateMatch = bDateStr >= startStr && bDateStr <= endStr;
        }

        // Column Filters
        const vendorMatch = !filters.vendor ||
            b.vendorName.toLowerCase().includes(filters.vendor.toLowerCase()) ||
            b.vendorId.toLowerCase().includes(filters.vendor.toLowerCase());
        const vehicleMatch = !filters.vehicle || b.vehicleNumber.toLowerCase().includes(filters.vehicle.toLowerCase());
        const itemsMatch = !filters.items || b.items.toLowerCase().includes(filters.items.toLowerCase());
        const statusMatch = !filters.status || b.status === filters.status;

        return whMatch && dateMatch && vendorMatch && vehicleMatch && itemsMatch && statusMatch;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    const handleAction = (action, id) => {
        if (action === 'approve') {
            if (window.confirm('Approve this booking?')) approveBooking(id);
        } else if (action === 'reject') {
            if (window.confirm('Reject this booking?')) rejectBooking(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Bookings</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage incoming shipments and approvals</p>
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
                            placeholderText="Select date range"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-gray-50 text-slate-800 font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Vehicle No</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4 text-center">Boxes</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Documents</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                            {/* Filter Row */}
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-2">
                                    {/* Date Column - No Filter */}
                                </th>
                                <th className="px-6 py-2">
                                    <input
                                        type="text"
                                        placeholder="Search Vendor..."
                                        className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                        onChange={e => setFilters({ ...filters, vendor: e.target.value })}
                                    />
                                </th>
                                <th className="px-6 py-2">
                                    <input
                                        type="text"
                                        placeholder="Search Vehicle..."
                                        className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                        onChange={e => setFilters({ ...filters, vehicle: e.target.value })}
                                    />
                                </th>
                                <th className="px-6 py-2">
                                    <input
                                        type="text"
                                        placeholder="Search Product..."
                                        className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                        onChange={e => setFilters({ ...filters, items: e.target.value })}
                                    />
                                </th>
                                <th className="px-6 py-2"></th>
                                <th className="px-6 py-2">
                                    <select
                                        className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                        onChange={e => setFilters({ ...filters, status: e.target.value })}
                                    >
                                        <option value="">All</option>
                                        {Object.values(BOOKING_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </th>
                                <th className="px-6 py-2"></th>
                                <th className="px-6 py-2"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredBookings.map(booking => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{booking.date}</div>
                                        <div className="text-xs text-slate-500">{booking.slotTime}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-indigo-900">{booking.vendorName}</div>
                                        <div className="text-xs text-slate-400">{booking.vendorId}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs font-semibold">
                                        {booking.vehicleNumber}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate" title={booking.items}>
                                        {booking.items}
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono font-medium">
                                        {booking.boxes || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide
                                            ${booking.status === BOOKING_STATUS.PENDING ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                booking.status === BOOKING_STATUS.BOOKED ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-rose-50 text-rose-700 border-rose-200'}
                                        `}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setViewDocBooking(booking)}
                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-center gap-1 mx-auto"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View Documents
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {booking.status === BOOKING_STATUS.PENDING && (
                                                <>
                                                    <button onClick={() => handleAction('approve', booking.id)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-sm transition-all">Approve</button>
                                                    <button onClick={() => handleAction('reject', booking.id)} className="px-3 py-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded text-xs font-bold shadow-sm transition-all">Reject</button>
                                                </>
                                            )}
                                            {/* No actions for Booked items here, handled in Vehicle Monitoring */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr><td colSpan="8" className="p-8 text-center text-slate-400">No bookings found matching filters</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Document Viewer Modal */}
            <DocumentViewerModal
                isOpen={!!viewDocBooking}
                booking={viewDocBooking}
                onClose={() => setViewDocBooking(null)}
            />
        </div>
    );
};

export default WarehouseOps;

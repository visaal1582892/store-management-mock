import React, { useState, useEffect } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLogistics } from '../context/LogisticsContext';
import { formatDateYYYYMMDD } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BOOKING_STATUS } from '../utils/constants';
import DocumentViewerModal from './DocumentViewerModal';

const ScheduleModal = ({ isOpen, onClose, initialDate, warehouseId, slots, onSave, onDelete, blockedDates = [], isEditing = false }) => {
    const [selectedDate, setSelectedDate] = useState(initialDate);

    // Reset date when modal opens
    useEffect(() => {
        if (isOpen) setSelectedDate(initialDate);
    }, [isOpen, initialDate]);

    const existingSchedule = slots[warehouseId]?.[selectedDate];
    const isDateBlocked = !isEditing && blockedDates.includes(selectedDate);

    // Dynamic Slot Logic
    const [dynamicSlots, setDynamicSlots] = useState([]);
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('12:00');

    // Load existing slots on edit
    useEffect(() => {
        if (existingSchedule) {
            setDynamicSlots(Object.keys(existingSchedule.slotDetails));
        } else {
            setDynamicSlots([]); // Start empty for new
        }
    }, [existingSchedule, selectedDate, isOpen]);

    const handleAddSlot = () => {
        if (!startTime || !endTime) return;
        if (startTime >= endTime) {
            alert("Start time must be before end time");
            return;
        }

        // Check for collisions
        const hasCollision = dynamicSlots.some(slot => {
            const [existingStart, existingEnd] = slot.split(' - ');
            // Overlap condition: (StartA < EndB) && (EndA > StartB)
            // Since we use 24h HH:MM format, string comparison works correctly
            return startTime < existingEnd && endTime > existingStart;
        });

        if (hasCollision) {
            alert("Time slot overlaps with an existing slot");
            return;
        }

        const timeString = `${startTime} - ${endTime}`;
        if (dynamicSlots.includes(timeString)) {
            alert("Slot already exists");
            return;
        }
        setDynamicSlots(prev => [...prev, timeString].sort());
    };

    const handleRemoveSlot = (slotToRemove) => {
        setDynamicSlots(prev => prev.filter(s => s !== slotToRemove));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900">
                        {isEditing ? 'Edit Schedule' : 'Add Capacity'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>

                <div className="space-y-4 mb-6">
                    {/* Date Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            disabled={isEditing}
                            onChange={(e) => {
                                const newDate = e.target.value;
                                if (!isEditing && blockedDates.includes(newDate)) {
                                    alert("Schedule already exists for this date. Please choose a date without an active schedule.");
                                    return;
                                }
                                setSelectedDate(newDate);
                            }}
                            min={!isEditing ? initialDate : undefined}
                            className={`w-full border rounded-lg px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 ${isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-300'}`}
                        />
                        {isDateBlocked && (
                            <p className="text-xs text-rose-500 mt-1">
                                ● Schedule already exists for this date.
                            </p>
                        )}
                    </div>

                    {!isDateBlocked && (
                        <>
                            {/* Slot Builder */}
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Build Slots</label>
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <label className="block text-[10px] text-slate-500 mb-1">Start</label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] text-slate-500 mb-1">End</label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddSlot}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-medium h-[34px]"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Slot List */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-2">Scheduled Slots ({dynamicSlots.length})</label>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {dynamicSlots.length === 0 ? (
                                        <p className="text-sm text-slate-400 italic">No slots added yet.</p>
                                    ) : (
                                        dynamicSlots.map(slot => (
                                            <div key={slot} className="flex justify-between items-center p-2.5 border rounded-lg bg-white">
                                                <span className="text-sm font-medium text-slate-700">{slot}</span>
                                                <button
                                                    onClick={() => handleRemoveSlot(slot)}
                                                    className="text-rose-500 hover:bg-rose-50 p-1 rounded transition-colors"
                                                    title="Remove Slot"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex gap-3 pt-2 border-t border-gray-100">
                    <div className="flex-1"></div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { onSave(selectedDate, dynamicSlots); onClose(); }}
                        disabled={isDateBlocked || dynamicSlots.length === 0}
                        className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${isDateBlocked || dynamicSlots.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        {isEditing ? 'Update Schedule' : 'Create Schedule'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BookingDetailsModal = ({ isOpen, onClose, data }) => {
    const [viewingDoc, setViewingDoc] = useState(null);

    if (!isOpen || !data) return null;

    const { warehouseName, date, bookings } = data;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden ring-1 ring-black/5 animate-fade-in-up">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                    <div>
                        <h3 className="font-bold text-slate-900">Slot Details</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{warehouseName} • {date}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-full p-1 hover:bg-rose-50">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-0 overflow-y-auto max-h-[60vh]">
                    {bookings.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 italic">No bookings found for this slot.</div>
                    ) : (
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-gray-50 text-slate-700 font-semibold border-b border-gray-200 sticky top-0">
                                <tr>
                                    <th className="px-4 py-3">Time Slot</th>
                                    <th className="px-4 py-3">Vendor</th>
                                    <th className="px-4 py-3">Vehicle</th>
                                    <th className="px-4 py-3 text-center">Documents</th>
                                    <th className="px-4 py-3 text-center">Schedule Status</th>
                                    <th className="px-4 py-3">Booking Status</th>
                                    <th className="px-4 py-3 text-right">Boxes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.sort((a, b) => a.slot.localeCompare(b.slot)).map(b => (
                                    <tr key={b.id} className="hover:bg-indigo-50/50 transition-colors even:bg-slate-50/50">
                                        <td className="px-4 py-3 font-mono text-xs">{b.slot}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{b.vendorName}</div>
                                            <div className="text-[10px] text-slate-400">{b.vendorId}</div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">{b.vehicleNumber}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => setViewingDoc(b)}
                                                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-center gap-1 mx-auto"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View Docs
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {b.scheduleStatus === 'On time' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                                                    On time
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-100 text-rose-800 animate-pulse whitespace-nowrap">
                                                    {b.scheduleStatus}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide
                                                ${b.status === 'Booked' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    b.status === 'Approval Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        b.status === 'Vehicle Reached' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                            b.status === 'Vehicle Exited' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                                'bg-gray-50 text-gray-600 border-gray-200'}
                                            `}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">{b.boxes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                        Close
                    </button>
                </div>
            </div>

            <DocumentViewerModal
                isOpen={!!viewingDoc}
                onClose={() => setViewingDoc(null)}
                booking={viewingDoc}
            />
        </div>
    );
};

const SlotGrid = () => {
    const { warehouses, slots, bookings, updateSchedule, removeSchedule } = useLogistics();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [filterState, setFilterState] = useState('');

    const isEmployee = user?.role === 'warehouse_employee';

    // Default range: Today + next 6 days (7 days total)
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 6);
        return d;
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDate, setModalDate] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Derived state for modal
    const employeeWarehouseId = isEmployee ? user.warehouseId : null;

    // View Details Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewModalData, setViewModalData] = useState(null);

    const handleViewDetails = (warehouseName, dateKey, bookingIds) => {
        const relatedBookings = bookings.filter(b => bookingIds.includes(b.id));
        setViewModalData({
            warehouseName,
            date: new Date(dateKey).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            bookings: relatedBookings
        });
        setViewModalOpen(true);
    };

    // Get occupied dates for better UX
    const occupiedDates = employeeWarehouseId ? Object.keys(slots[employeeWarehouseId] || {}) : [];

    // Find next available date (not today, but first future date without schedule)
    const getNextAvailableDate = () => {
        let d = new Date();
        // Check next 60 days to find a gap after long scheduled periods
        for (let i = 0; i < 60; i++) {
            const checkDate = formatDateYYYYMMDD(d);
            if (d.getDay() !== 0 && !occupiedDates.includes(checkDate)) { // Skip Sundays and occupied
                return checkDate;
            }
            d.setDate(d.getDate() + 1);
        }
        return formatDateYYYYMMDD(new Date()); // Fallback to today
    };

    const handleOpenAddModal = () => {
        setModalDate(getNextAvailableDate());
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (date) => {
        setModalDate(date);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSaveSchedule = (date, selectedSlots) => {
        if (employeeWarehouseId) {
            updateSchedule(employeeWarehouseId, date, selectedSlots);
        }
    };

    const handleDeleteSchedule = (date) => {
        if (employeeWarehouseId && date) {
            if (window.confirm('Are you sure you want to delete the schedule for ' + date + '?')) {
                removeSchedule(employeeWarehouseId, date);
            }
        }
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

    const dateRange = (startDate && endDate) ? getDateRange(startDate, endDate) : (startDate ? [startDate] : []);

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
                    <div className="flex gap-3">
                        <button
                            onClick={handleOpenAddModal}
                            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <span className="text-lg leading-none">+</span>
                            Add Schedule
                        </button>
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
                </div>

                {/* Date Controls */}
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm w-fit z-30 relative">
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Range:</span>
                    <DatePicker
                        selectsRange={true}
                        startDate={startDate}
                        endDate={endDate}
                        onChange={(update) => {
                            const [start, end] = update;
                            setStartDate(start);
                            setEndDate(end);
                        }}
                        className="bg-transparent text-slate-700 outline-none w-52 cursor-pointer text-sm font-medium text-center"
                        dateFormat="MMM d, yyyy"
                        placeholderText="Select date range"
                    />
                </div>

                <div className="w-fit max-w-full mx-auto overflow-hidden border border-gray-200 rounded-xl bg-white shadow-sm ring-1 ring-gray-950/5">
                    <div className="overflow-x-auto custom-scrollbar pb-2">
                        <table className="w-auto text-left text-sm text-slate-600">
                            <thead className="bg-gray-50 text-slate-800 font-semibold border-b border-gray-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 sticky left-0 bg-gray-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] w-40 whitespace-nowrap">Date</th>
                                    <th className="px-6 py-4 whitespace-nowrap">Scheduled Slots</th>
                                    <th className="px-6 py-4 text-center w-32 whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dateRange.map((d) => {
                                    const dateKey = formatDateYYYYMMDD(d);
                                    const isSunday = d.getDay() === 0;
                                    const daySlots = slots[warehouse.id]?.[dateKey]; // Use actual data
                                    // With dynamic slots, we map the keys
                                    const slotDetails = daySlots?.slotDetails || {};
                                    const slotTimes = Object.keys(slotDetails).sort();

                                    return (
                                        <tr key={dateKey} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-gray-50 z-20 font-medium text-slate-900 border-r border-gray-100 align-top">
                                                {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                            </td>

                                            {isSunday ? (
                                                <>
                                                    <td className="px-6 py-4 text-center bg-gray-50/50">
                                                        <span className="text-xs text-slate-400 font-bold tracking-wider">WEEKLY HOLIDAY (SUNDAY)</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center bg-gray-50/50"></td>
                                                </>
                                            ) : !daySlots ? (
                                                <>
                                                    <td className="px-6 py-4 text-slate-400 italic">
                                                        No schedule added
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-slate-300">-</span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4">
                                                        {/* No wrap: Width depends on number of slots */}
                                                        <div className="flex gap-2">
                                                            {slotTimes.length === 0 ? (
                                                                <span className="text-slate-400 italic text-xs">No active slots</span>
                                                            ) : (
                                                                slotTimes.map(time => {
                                                                    return (
                                                                        <div key={time} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border bg-slate-50 border-slate-200 whitespace-nowrap">
                                                                            <span className="text-xs font-medium text-slate-700">
                                                                                {time}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center align-top">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleOpenEditModal(dateKey)}
                                                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                                title="Edit Schedule"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSchedule(dateKey)}
                                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                                title="Delete Schedule"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <ScheduleModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    initialDate={modalDate}
                    warehouseId={warehouse.id}
                    slots={slots}
                    blockedDates={occupiedDates}
                    isEditing={isEditing}
                    onSave={handleSaveSchedule}
                    onDelete={() => { }} // Modal delete not needed as we have row delete, but keeping prop if needed
                />
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
                    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm z-30 relative">
                        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Range:</span>
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => {
                                const [start, end] = update;
                                setStartDate(start);
                                setEndDate(end);
                            }}
                            className="bg-transparent text-slate-700 outline-none w-52 cursor-pointer text-sm font-medium text-center"
                            dateFormat="MMM d, yyyy"
                            placeholderText="Select date range"
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
                                        const dateKey = formatDateYYYYMMDD(d);
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

                                        // Filter for Admin View: Only count Active/Confirmed bookings
                                        const relevantBookingIds = slot.bookingIds.filter(id => {
                                            const b = bookings.find(bk => bk.id === id);
                                            return b && [BOOKING_STATUS.BOOKED, BOOKING_STATUS.VEHICLE_REACHED, BOOKING_STATUS.VEHICLE_LEFT].includes(b.status);
                                        });

                                        const bookedCount = relevantBookingIds.length;
                                        const percentage = (bookedCount / slot.total) * 100;
                                        const color = percentage >= 100 ? 'bg-rose-500' : percentage > 50 ? 'bg-amber-500' : 'bg-emerald-500';
                                        const textColor = percentage >= 100 ? 'text-rose-600' : percentage > 50 ? 'text-amber-600' : 'text-emerald-600';

                                        return (
                                            <td
                                                key={i}
                                                className="px-4 py-4 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                                                onClick={() => handleViewDetails(wh.name, dateKey, relevantBookingIds)}
                                            >
                                                <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                                                    <div className={`w-10 h-1.5 rounded-full ${color}/20 overflow-hidden`}>
                                                        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
                                                    </div>
                                                    <span className={`text-xs font-mono font-medium ${textColor}`}>
                                                        {bookedCount}/{slot.total}
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

            <BookingDetailsModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                data={viewModalData}
            />
        </div>
    );
};

export default SlotGrid;

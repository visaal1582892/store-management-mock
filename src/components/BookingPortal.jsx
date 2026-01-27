import React, { useState, useMemo } from 'react';
import { useLogistics } from '../context/LogisticsContext';
import { useAuth } from '../context/AuthContext';
import { BOOKING_STATUS } from '../utils/constants';
import DocumentViewerModal from './DocumentViewerModal';

const BookingPortal = () => {
    const { warehouses, slots, bookings, addBooking, cancelBooking } = useLogistics();
    const { user } = useAuth();

    // View State
    const [viewMode, setViewMode] = useState('new-booking');
    const [viewingDoc, setViewingDoc] = useState(null);

    // Form State
    const [selectedState, setSelectedState] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');

    const [items, setItems] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [driverContact, setDriverContact] = useState('');
    const [boxes, setBoxes] = useState('');
    const [documents, setDocuments] = useState({ coa: null, invoice: null, lr: null });

    // Filter State
    const [filters, setFilters] = useState({
        vehicle: '',
        status: '',
        warehouse: '',
        date: '',
        items: '',
        schedStatus: ''
    });

    // Derived State
    const states = useMemo(() => [...new Set(warehouses.map(w => w.state))].sort(), [warehouses]);
    const filteredWarehouses = useMemo(() => {
        if (!selectedState) return [];
        return warehouses.filter(w => w.state === selectedState);
    }, [selectedState, warehouses]);

    const availableSlotsForDate = useMemo(() => {
        if (!warehouseId || !selectedDate || !slots[warehouseId] || !slots[warehouseId][selectedDate]) return {};
        return slots[warehouseId][selectedDate].slotDetails || {};
    }, [slots, warehouseId, selectedDate]);

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        try {
            if (!documents.coa || !documents.invoice) throw new Error("COA and Invoice are mandatory");

            addBooking({
                vendorName: user.name,
                warehouseId,
                date: selectedDate,
                slotTime: selectedSlot,
                items,
                vehicleNumber,
                driverContact,
                documents
            });
            // Reset and switch view
            setViewMode('my-bookings');
            // Reset Form
            setWarehouseId('');
            setSelectedDate('');
            setSelectedSlot('');
            setDocuments({ coa: null, invoice: null, lr: null });
            setItems('');
            setVehicleNumber('');
            setDriverContact('');
            setBoxes('');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCancel = (booking) => {
        if (window.confirm(`Are you sure you want to CANCEL booking ${booking.id}?`)) {
            cancelBooking(booking.id);
        }
    };

    // My Bookings Data
    const myBookings = bookings.filter(b => b.vendorName === user.name || user.role === 'admin');

    return (
        <div className="space-y-6">
            {/* Header Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setViewMode('new-booking')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                            ${viewMode === 'new-booking'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'}
                        `}
                    >
                        New Booking
                    </button>
                    <button
                        onClick={() => setViewMode('my-bookings')}
                        className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2
                            ${viewMode === 'my-bookings'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-gray-300'}
                        `}
                    >
                        My Bookings
                        <span className={`text-xs px-2 py-0.5 rounded-full ${viewMode === 'my-bookings' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-slate-600'}`}>
                            {myBookings.length}
                        </span>
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl mx-auto">
                {viewMode === 'new-booking' ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-indigo-50 px-4 py-2 rounded-bl-xl border-l border-b border-indigo-100 text-xs font-bold text-indigo-700">
                            ⚠️ MAX 2-3 SLOTS/DAY
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Create New Slot Request</h2>

                        <form onSubmit={handleBookingSubmit} className="space-y-6">
                            {/* Location Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Destination State</label>
                                    <select
                                        value={selectedState}
                                        onChange={(e) => {
                                            setSelectedState(e.target.value);
                                            setWarehouseId('');
                                            setSelectedDate('');
                                        }}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-shadow"
                                        required
                                    >
                                        <option value="">Select State...</option>
                                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm font-semibold mb-2 ${!selectedState ? 'text-slate-400' : 'text-slate-700'}`}>Target Warehouse</label>
                                    <select
                                        value={warehouseId}
                                        onChange={(e) => setWarehouseId(e.target.value)}
                                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-colors ${!selectedState ? 'bg-gray-100 border-gray-200 text-slate-400 cursor-not-allowed' : 'bg-gray-50 border-gray-300 text-slate-900'}`}
                                        required
                                        disabled={!selectedState}
                                    >
                                        <option value="">{selectedState ? 'Select Location...' : 'Select State First'}</option>
                                        {filteredWarehouses.map(wh => (<option key={wh.id} value={wh.id}>{wh.id} - {wh.name}</option>))}
                                    </select>
                                </div>
                            </div>

                            {/* Date Section */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${!warehouseId ? 'text-slate-400' : 'text-slate-700'}`}>Arrival Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setSelectedSlot('');
                                    }}
                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-colors ${!warehouseId ? 'bg-gray-100 border-gray-200 text-slate-400 cursor-not-allowed' : 'bg-gray-50 border-gray-300 text-slate-900'}`}
                                    required
                                    disabled={!warehouseId}
                                />
                            </div>

                            {/* Slot Selection */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${!selectedDate ? 'text-slate-400' : 'text-slate-700'}`}>Time Slot</label>
                                <select
                                    value={selectedSlot}
                                    onChange={(e) => setSelectedSlot(e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition-colors ${!selectedDate ? 'bg-gray-100 border-gray-200 text-slate-400 cursor-not-allowed' : 'bg-gray-50 border-gray-300 text-slate-900'}`}
                                    required
                                    disabled={!selectedDate}
                                >
                                    <option value="">{selectedDate ? 'Select Time Slot...' : 'Select Date First'}</option>
                                    {['09:00 - 12:00', '13:00 - 16:00', '16:00 - 19:00'].map(slot => {
                                        const isAvailable = availableSlotsForDate[slot] === 'Available';
                                        return (
                                            <option key={slot} value={slot} disabled={!isAvailable}>
                                                {slot} {isAvailable ? '(Available)' : '(Booked)'}
                                            </option>
                                        );
                                    })}
                                </select>
                                {selectedDate && Object.values(availableSlotsForDate).every(s => s !== 'Available') && (
                                    <p className="text-xs text-rose-500 mt-1">No slots available for this date.</p>
                                )}
                            </div>

                            {/* Details Section */}
                            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${!selectedDate ? 'opacity-50 pointer-events-none' : ''}`}>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Driver Contact Number</label>
                                    <input type="tel" value={driverContact} onChange={e => setDriverContact(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none" placeholder="10-digit mobile" required disabled={!selectedDate} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Vehicle Number</label>
                                    <input type="text" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none" placeholder="XX-00-XX-0000" required disabled={!selectedDate} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name</label>
                                    <input type="text" value={items} onChange={e => setItems(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none" placeholder="e.g. Pharma Bulk" required disabled={!selectedDate} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Boxes</label>
                                    <input type="number" value={boxes} onChange={e => setBoxes(e.target.value)} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none" placeholder="Qty" required disabled={!selectedDate} />
                                </div>
                            </div>

                            <div className={`bg-gray-50 p-6 rounded-lg border border-gray-200 ${!selectedDate ? 'opacity-50 pointer-events-none' : ''}`}>
                                <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Shipment Documents</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* COA - Mandatory */}
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">COA (Mandatory)</label>
                                        <div className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${documents.coa ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:border-indigo-400 bg-white'}`}>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.png"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={e => setDocuments({ ...documents, coa: e.target.files[0] })}
                                                disabled={!selectedDate}
                                            />
                                            {documents.coa ? (
                                                <div className="flex flex-col items-center text-emerald-700">
                                                    <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="text-[10px] font-bold truncate max-w-full px-2">{documents.coa.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-slate-400">
                                                    <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                    <span className="text-[10px]">Upload PDF/IMG</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Invoice - Mandatory */}
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Invoice (Mandatory)</label>
                                        <div className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${documents.invoice ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:border-indigo-400 bg-white'}`}>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.png"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={e => setDocuments({ ...documents, invoice: e.target.files[0] })}
                                                disabled={!selectedDate}
                                            />
                                            {documents.invoice ? (
                                                <div className="flex flex-col items-center text-emerald-700">
                                                    <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="text-[10px] font-bold truncate max-w-full px-2">{documents.invoice.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-slate-400">
                                                    <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                    <span className="text-[10px]">Upload PDF/IMG</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* LR - Optional */}
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-slate-700 mb-1">LR Copy (Optional)</label>
                                        <div className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${documents.lr ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300 hover:border-indigo-400 bg-white'}`}>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.png"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={e => setDocuments({ ...documents, lr: e.target.files[0] })}
                                                disabled={!selectedDate}
                                            />
                                            {documents.lr ? (
                                                <div className="flex flex-col items-center text-emerald-700">
                                                    <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="text-[10px] font-bold truncate max-w-full px-2">{documents.lr.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-slate-400">
                                                    <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                    <span className="text-[10px]">Optional</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`w-full font-bold py-3.5 rounded-lg shadow-md transition-all ${!selectedDate || !selectedSlot || !documents.coa || !documents.invoice ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-[0.99]'}`}
                                disabled={!selectedDate || !selectedSlot || !documents.coa || !documents.invoice}
                            >
                                Confirm Booking
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Table View with Filters */}
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-gray-50 text-slate-800 font-semibold border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4">Date & Time</th>
                                            <th className="px-6 py-4">Warehouse</th>
                                            <th className="px-6 py-4">Vehicle No</th>
                                            <th className="px-6 py-4">Product</th>
                                            <th className="px-6 py-4 text-center">Boxes</th>
                                            <th className="px-6 py-4 text-center">Schedule Status</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-center">Documents</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                        {/* Filters Row */}
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-6 py-2">
                                                <input
                                                    type="date"
                                                    className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                                    onChange={e => setFilters({ ...filters, date: e.target.value })}
                                                />
                                            </th>
                                            <th className="px-6 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Search Warehouse..."
                                                    className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                                    onChange={e => setFilters({ ...filters, warehouse: e.target.value })}
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
                                                    placeholder="Search Items..."
                                                    className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                                    onChange={e => setFilters({ ...filters, items: e.target.value })}
                                                />
                                            </th>
                                            <th className="px-6 py-2"></th>
                                            <th className="px-6 py-2">
                                                <select
                                                    className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                                    onChange={e => setFilters({ ...filters, schedStatus: e.target.value })}
                                                >
                                                    <option value="">All</option>
                                                    <option value="On time">On time</option>
                                                    <option value="Entry delayed">Entry delayed</option>
                                                    <option value="Exit delayed">Exit delayed</option>
                                                </select>
                                            </th>
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
                                        {myBookings
                                            .filter(b => {
                                                const matchVehicle = !filters.vehicle || b.vehicleNumber.toLowerCase().includes(filters.vehicle.toLowerCase());
                                                const matchStatus = !filters.status || b.status === filters.status;
                                                const matchWarehouse = !filters.warehouse || warehouses.find(w => w.id === b.warehouseId)?.name.toLowerCase().includes(filters.warehouse.toLowerCase());
                                                const matchDate = !filters.date || b.date === filters.date;
                                                const matchItems = !filters.items || b.items.toLowerCase().includes(filters.items.toLowerCase());
                                                const matchSched = !filters.schedStatus || (b.scheduleStatus && b.scheduleStatus === filters.schedStatus);
                                                return matchVehicle && matchStatus && matchWarehouse && matchDate && matchItems && matchSched;
                                            })
                                            .map(bkg => (
                                                <tr key={bkg.id} className="hover:bg-indigo-50/50 transition-colors even:bg-slate-50/50 border-b border-gray-100 last:border-0">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="tabular-nums">{new Date(bkg.date).toLocaleDateString()}</span>
                                                            <span className="text-xs text-slate-500 font-medium">{bkg.slot || 'Pending Slot'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span>{warehouses.find(w => w.id === bkg.warehouseId)?.name}</span>
                                                            <span className="text-xs text-slate-400">{bkg.warehouseId}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">{bkg.vehicleNumber}</td>
                                                    <td className="px-6 py-4 max-w-xs truncate" title={bkg.items}>
                                                        {bkg.items}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-mono font-medium">
                                                        {bkg.boxes || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {bkg.scheduleStatus === 'On time' ? (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                                                                On time
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-rose-100 text-rose-800 animate-pulse whitespace-nowrap">
                                                                {bkg.scheduleStatus}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${bkg.status === BOOKING_STATUS.BOOKED ? 'bg-blue-50 border-blue-100 text-blue-700' :
                                                            bkg.status === BOOKING_STATUS.PENDING ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                                                bkg.status === BOOKING_STATUS.RECEIVED ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                                                    bkg.status === BOOKING_STATUS.REJECTED ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                                                        bkg.status === BOOKING_STATUS.DELAYED ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                                                            bkg.status === BOOKING_STATUS.CANCELLED ? 'bg-gray-100 border-gray-200 text-gray-500 line-through' :
                                                                                'bg-slate-50 border-slate-100 text-slate-700'
                                                            }`}>
                                                            {bkg.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => setViewingDoc(bkg)}
                                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center justify-center gap-1 mx-auto"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            View Docs
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {bkg.status !== BOOKING_STATUS.CANCELLED && bkg.status !== BOOKING_STATUS.REJECTED && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleCancel(bkg)}
                                                                        className="text-xs text-slate-400 hover:text-slate-600 font-medium hover:underline border-l pl-2 border-gray-300"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            )}
                                                            {(bkg.status === BOOKING_STATUS.CANCELLED || bkg.status === BOOKING_STATUS.REJECTED) && <span className="text-xs text-slate-400 italic">{bkg.status === BOOKING_STATUS.CANCELLED ? 'Cancelled' : 'Rejected'}</span>}

                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        {myBookings.length === 0 && (
                                            <tr>
                                                <td colSpan="9" className="p-12 text-center text-slate-400">
                                                    <div className="text-4xl mb-4">🚛</div>
                                                    <h3 className="text-lg font-medium text-slate-900">No shipments found</h3>
                                                    <button onClick={() => setViewMode('new-booking')} className="mt-4 text-indigo-600 font-bold text-sm hover:underline">
                                                        Start Booking &rarr;
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <DocumentViewerModal
                isOpen={!!viewingDoc}
                onClose={() => setViewingDoc(null)}
                booking={viewingDoc}
            />

            {/* Footer / Status Bar */}
            <div className="bg-white border-t border-gray-200 p-4 text-center text-xs text-slate-400">
                Slot Management System v1.2 • Secured by MedPlus Logistics
            </div>
        </div>
    );
};

export default BookingPortal;

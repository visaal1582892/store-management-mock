import React, { useState, useMemo } from 'react';
import { useLogistics } from '../context/LogisticsContext';
import { useAuth } from '../context/AuthContext';


const BookingPortal = () => {
    const { warehouses, slots, bookings, addBooking, markAsDelayed, cancelBooking } = useLogistics();
    const { user } = useAuth();

    // View State: 'new-booking' or 'my-bookings'
    const [viewMode, setViewMode] = useState('new-booking');

    // Form State
    const [selectedState, setSelectedState] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');

    const [items, setItems] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [boxes, setBoxes] = useState('');
    const [documents, setDocuments] = useState({ coa: false, invoice: false, lr: false });

    // Filter State
    const [filters, setFilters] = useState({
        vehicle: '',
        status: '',
        warehouse: '',
        date: '',
        items: ''
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
            if (!documents.coa || !documents.invoice || !documents.lr) throw new Error("Documents mandatory");


            addBooking({
                vendorName: user.name,
                warehouseId,
                date: selectedDate,
                slotTime: selectedSlot,
                items,
                vehicleNumber,
                documents
            });
            // Reset and switch view
            setViewMode('my-bookings');
            // Reset Form excluding State (UX preference) or reset all? Resetting all for clean state.
            setWarehouseId('');
            setSelectedDate('');
            setSelectedSlot('');
            setDocuments({ coa: false, invoice: false, lr: false });
            setItems('');
            setVehicleNumber('');
            setBoxes('');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleMarkDelayed = (booking) => {
        const action = booking.status === 'Delayed' ? 'MARK ON-TIME' : 'DELAY';
        if (window.confirm(`Are you sure you want to ${action} for ${booking.vendorName}?`)) {
            markAsDelayed(booking.id);
        }
    };

    const handleCancel = (booking) => {
        if (window.confirm(`Are you sure you want to CANCEL booking ${booking.id}?`)) {
            cancelBooking(booking.id);
        }
    };

    // My Bookings Data
    const myBookings = bookings.filter(b => b.vendorName === user.name || user.role === 'admin'); // Admin sees all for demo

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

            {/* Main Content Area - Centered & Flexible */}
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
                                            setWarehouseId(''); // Reset warehouse when state changes
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
                                <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Mandatory Attachments</label>
                                <div className="flex gap-4">
                                    {['coa', 'invoice', 'lr'].map(doc => (
                                        <label key={doc} className={`flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer border transition-all ${documents[doc] ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-gray-200 text-slate-500 hover:border-gray-400'}`}>
                                            <input type="checkbox" checked={documents[doc]} onChange={e => setDocuments({ ...documents, [doc]: e.target.checked })} className="hidden" disabled={!selectedDate} />
                                            <span className="text-xs uppercase font-bold">{documents[doc] ? '✓' : '+'} {doc}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`w-full font-bold py-3.5 rounded-lg shadow-md transition-all ${!selectedDate || !selectedSlot || !documents.coa || !documents.invoice || !documents.lr ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-[0.99]'}`}
                                disabled={!selectedDate || !selectedSlot || !documents.coa || !documents.invoice || !documents.lr}
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
                                            <th className="px-6 py-4">Vehicle Number</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Warehouse</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Items</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                        {/* Filters Row */}
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-6 py-2">
                                                <input
                                                    type="text"
                                                    placeholder="Search Vehicle..."
                                                    className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                                    onChange={e => setFilters({ ...filters, vehicle: e.target.value })}
                                                />
                                            </th>
                                            <th className="px-6 py-2">
                                                <select
                                                    className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                                    onChange={e => setFilters({ ...filters, status: e.target.value })}
                                                >
                                                    <option value="">All</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Delayed">Delayed</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
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
                                                    type="date"
                                                    className="w-full text-xs border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5"
                                                    onChange={e => setFilters({ ...filters, date: e.target.value })}
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
                                                return matchVehicle && matchStatus && matchWarehouse && matchDate && matchItems;
                                            })
                                            .map(bkg => (
                                                <tr key={bkg.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-900">{bkg.vehicleNumber}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${bkg.status === 'Confirmed' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                                            bkg.status === 'Delayed' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                                                bkg.status === 'Cancelled' ? 'bg-gray-100 border-gray-200 text-gray-500 line-through' :
                                                                    'bg-amber-50 border-amber-100 text-amber-700'
                                                            }`}>
                                                            {bkg.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span>{warehouses.find(w => w.id === bkg.warehouseId)?.name}</span>
                                                            <span className="text-xs text-slate-400">{bkg.warehouseId}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="tabular-nums">{new Date(bkg.date).toLocaleDateString()}</span>
                                                            <span className="text-xs text-slate-500 font-medium">{bkg.slot || 'Pending Slot'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs truncate" title={bkg.items}>
                                                        {bkg.items}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {bkg.status !== 'Cancelled' && bkg.status !== 'Completed' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleMarkDelayed(bkg)}
                                                                        className={`text-xs font-medium hover:underline ${bkg.status === 'Delayed' ? 'text-emerald-600' : 'text-rose-600'}`}
                                                                    >
                                                                        {bkg.status === 'Delayed' ? 'Mark On-Time' : 'Report Delay'}
                                                                    </button>

                                                                    <button
                                                                        onClick={() => handleCancel(bkg)}
                                                                        className="text-xs text-slate-400 hover:text-slate-600 font-medium hover:underline border-l pl-2 border-gray-300"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            )}
                                                            {bkg.status === 'Cancelled' && <span className="text-xs text-slate-400 italic">Cancelled</span>}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        {myBookings.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="p-12 text-center text-slate-400">
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

            {/* Footer / Status Bar */}
            <div className="bg-white border-t border-gray-200 p-4 text-center text-xs text-slate-400">
                Slot Management System v1.2 • Secured by MedPlus Logistics
            </div>
        </div>
    );
};

export default BookingPortal;

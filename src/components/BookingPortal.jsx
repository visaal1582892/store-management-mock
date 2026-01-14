import React, { useState, useMemo } from 'react';
import { useLogistics } from '../context/LogisticsContext';
import { useAuth } from '../context/AuthContext';
import ExceptionModal from './ExceptionModal';

const BookingPortal = () => {
    const { warehouses, slots, bookings, addBooking, markAsDelayed, check14DayAvailability } = useLogistics();
    const { user } = useAuth();

    // View State: 'new-booking' or 'my-bookings'
    const [viewMode, setViewMode] = useState('new-booking');

    // Form State
    const [selectedDate, setSelectedDate] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [items, setItems] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [boxes, setBoxes] = useState('');
    const [documents, setDocuments] = useState({ coa: false, invoice: false, lr: false });

    // Exception State
    const [showExceptionModal, setShowExceptionModal] = useState(false);
    const [activeDelayHandler, setActiveDelayHandler] = useState(null); // booking ID being delayed
    const [blockAlert, setBlockAlert] = useState(false); // To show "No slots for 14 days"

    const availableDates = useMemo(() => {
        if (!warehouseId || !slots[warehouseId]) return [];
        // Filter out Sundays and full slots
        return Object.keys(slots[warehouseId])
            .filter(d => slots[warehouseId][d].booked < slots[warehouseId][d].total)
            .sort()
            .slice(0, 15);
    }, [slots, warehouseId]);

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        try {
            if (!documents.coa || !documents.invoice || !documents.lr) throw new Error("Documents mandatory");

            addBooking({
                vendorName: user.name,
                warehouseId,
                date: selectedDate,
                items,
                vehicleNumber,
                documents
            });
            // Reset and switch view
            setViewMode('my-bookings');
            setWarehouseId('');
            setSelectedDate('');
            setDocuments({ coa: false, invoice: false, lr: false });
        } catch (err) {
            alert(err.message);
        }
    };

    const handleMarkDelayed = (booking) => {
        // System Check: 14 days availability
        const hasSlots = check14DayAvailability(booking.warehouseId, new Date());

        if (!hasSlots) {
            // Strict Blocking Rule
            setBlockAlert(true);
            setActiveDelayHandler(booking); // Prepare for exception request
        } else {
            // If slots ARE available, typically we'd let them reschedule, but user rule says "No Auto-Reschedule" is the philosophy.
            // "If a vehicle is delayed... auto-rescheduling is blocked."
            // So we likely still force exception or manual intervention even if slots exist?
            // Prompt says: "If no slots found -> Mandatory Vendor UI Response -> Exception Request".
            // We will assume if slots ARE found, they might be able to reschedule manually, but for this strict mock, lets assume strict Exception flow.
            markAsDelayed(booking.id);
        }
    };

    const handleExceptionRequestTrigger = () => {
        setShowExceptionModal(true);
        setBlockAlert(false);
    };

    // My Bookings Data
    const myBookings = bookings.filter(b => b.vendorName === user.name || user.role === 'admin'); // Admin sees all for demo

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* View Switcher Sidebar */}
            <div className="space-y-4">
                <div onClick={() => setViewMode('new-booking')} className={`cursor-pointer p-4 rounded-xl border transition-all ${viewMode === 'new-booking' ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <h3 className="font-bold text-white">New Booking</h3>
                    <p className="text-xs text-indigo-200 mt-1">Book slots 15 days in advance</p>
                </div>
                <div onClick={() => setViewMode('my-bookings')} className={`cursor-pointer p-4 rounded-xl border transition-all ${viewMode === 'my-bookings' ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <h3 className="font-bold text-white">My Shipments</h3>
                    <p className="text-xs text-indigo-200 mt-1">Track status & Report delays</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
                {viewMode === 'new-booking' ? (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-indigo-500/10 px-4 py-2 rounded-bl-xl border-l border-b border-white/10 text-xs font-mono text-indigo-300">
                            ⚠️ MAX 2-3 SLOTS/DAY
                        </div>
                        <h2 className="text-xl font-bold text-white mb-6">Vendor Slot Booking</h2>

                        <form onSubmit={handleBookingSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Target Warehouse</label>
                                    <select
                                        value={warehouseId}
                                        onChange={(e) => setWarehouseId(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-gray-200 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="">Select Location...</option>
                                        {warehouses.map(wh => (<option key={wh.id} value={wh.id}>{wh.name}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Arrival Date</label>
                                    <select
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-gray-200 focus:border-indigo-500"
                                        required
                                        disabled={!warehouseId}
                                    >
                                        <option value="">Select Date...</option>
                                        {availableDates.map(d => (<option key={d} value={d}>{new Date(d).toLocaleDateString()} (Open)</option>))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Vehicle Number</label>
                                    <input type="text" value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-gray-200" placeholder="XX-00-XX-0000" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Product Name</label>
                                    <input type="text" value={items} onChange={e => setItems(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-gray-200" placeholder="e.g. Pharma Bulk" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 mb-1">Number of Boxes</label>
                                    <input type="number" value={boxes} onChange={e => setBoxes(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-gray-200" placeholder="Qty" required />
                                </div>
                            </div>

                            <div className="bg-black/20 p-4 rounded border border-white/5">
                                <label className="block text-xs font-medium text-gray-400 mb-2">Mandatory Attachments</label>
                                <div className="flex gap-4">
                                    {['coa', 'invoice', 'lr'].map(doc => (
                                        <label key={doc} className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer border transition-colors ${documents[doc] ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                            <input type="checkbox" checked={documents[doc]} onChange={e => setDocuments({ ...documents, [doc]: e.target.checked })} className="hidden" />
                                            <span className="text-xs uppercase font-bold">{documents[doc] ? '✓' : '+'} {doc}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded shadow-lg shadow-indigo-500/20">
                                Confirm Booking
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white mb-4">Shipment Tracking</h2>
                        {myBookings.map(bkg => (
                            <div key={bkg.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="font-bold text-white text-lg">{bkg.vehicleNumber}</div>
                                        <div className="text-gray-400 text-sm">{warehouses.find(w => w.id === bkg.warehouseId)?.name}</div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${bkg.status === 'Confirmed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                            bkg.status === 'Delayed' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                                'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                        }`}>
                                        {bkg.status}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-4">
                                    <div><span className="text-gray-500 block text-xs">Slot Date</span>{new Date(bkg.date).toLocaleDateString()}</div>
                                    <div><span className="text-gray-500 block text-xs">Items</span>{bkg.items}</div>
                                </div>
                                {bkg.status === 'Confirmed' && (
                                    <button
                                        onClick={() => handleMarkDelayed(bkg)}
                                        className="w-full bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 text-gray-400 py-2 rounded transition-colors text-sm"
                                    >
                                        Mark as Delayed
                                    </button>
                                )}
                                {bkg.status === 'Delayed' && (
                                    <div className="text-xs text-rose-400 bg-rose-500/5 p-2 rounded border border-rose-500/20">
                                        Delay reported. Awaiting vehicle arrival or exception.
                                    </div>
                                )}
                                {bkg.status === 'Exception Requested' && (
                                    <div className="text-xs text-amber-400 bg-amber-500/5 p-2 rounded border border-amber-500/20">
                                        Pending Approval from Warehouse Ops.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* BLOCK ALERT MODAL */}
            {blockAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                    <div className="relative bg-zinc-900 border border-rose-500/50 rounded-xl w-full max-w-md p-8 shadow-2xl text-center animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                            ⚠️
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Auto-Rescheduling Blocked</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            No slots are available for the next 14 days at this location. Per operational policy, you must submit an Exception Request.
                        </p>
                        <button
                            onClick={handleExceptionRequestTrigger}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-6 rounded-lg w-full"
                        >
                            Request Exception Approval
                        </button>
                    </div>
                </div>
            )}

            {showExceptionModal && activeDelayHandler && (
                <ExceptionModal
                    onClose={() => setShowExceptionModal(false)}
                    booking={activeDelayHandler}
                />
            )}
        </div>
    );
};

export default BookingPortal;

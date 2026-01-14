import React, { useState } from 'react';
import { useLogistics } from '../context/LogisticsContext';

const OperationsPortal = () => {
    const { bookings, processException, warehouses } = useLogistics();
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [remarks, setRemarks] = useState('');

    const exceptionQueue = bookings.filter(b => b.status === 'Exception Requested');


    const handleAction = (action) => {
        if (!selectedBooking || !remarks) {
            alert("Remarks are mandatory for approval/rejection.");
            return;
        }
        processException(selectedBooking.id, action, remarks);
        setSelectedBooking(null);
        setRemarks('');
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Warehouse Operations</h1>
                <p className="text-gray-400 mt-1">Exception approvals and daily slot execution.</p>
            </div>

            {/* Exception Approval Queue */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-amber-500/10">
                    <h3 className="font-semibold text-amber-200">Exception Approval Queue</h3>
                    <span className="text-xs text-amber-500 font-mono font-bold">{exceptionQueue.length} Pending</span>
                </div>

                {exceptionQueue.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No pending exceptions.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="text-xs uppercase bg-black/20 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">Vendor / Warehouse</th>
                                    <th className="px-6 py-3">Delay Details</th>
                                    <th className="px-6 py-3">Reason</th>
                                    <th className="px-6 py-3">Documents</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {exceptionQueue.map((bkg) => (
                                    <tr key={bkg.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{bkg.vendorName}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{warehouses.find(w => w.id === bkg.warehouseId)?.name}</div>
                                            <div className="text-xs text-indigo-400 mt-1">{bkg.vehicleNumber}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-400">Original: <span className="text-gray-300">{new Date(bkg.originalDate).toLocaleDateString()}</span></div>
                                            <div className="text-xs text-amber-400 mt-1">Requested: <span className="font-bold">{new Date(bkg.exceptionDetails.date).toLocaleDateString()}</span></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                                                {bkg.exceptionDetails.type}
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1 italic">"{bkg.exceptionDetails.reason}"</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-blue-400 underline cursor-pointer">
                                            View Attachments
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedBooking(bkg)}
                                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-xs font-medium transition-colors"
                                            >
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Day-of-Arrival Operations (Placeholder for now, focusing on Exception Queue) */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="px-6 py-4 border-b border-white/10 bg-emerald-500/10">
                    <h3 className="font-semibold text-emerald-200">Authorized Arrivals (Today)</h3>
                </div>
                <div className="p-8 text-center text-gray-500 text-sm">
                    No vehicles currently gated in.
                </div>
            </div>

            {/* Approval Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
                    <div className="relative bg-zinc-900 border border-white/10 rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-white mb-4">Review Exception Request</h3>

                        <div className="bg-black/40 rounded p-4 mb-4 text-sm space-y-2 border border-white/5">
                            <div className="flex justify-between"><span className="text-gray-500">Vendor:</span> <span className="text-gray-200">{selectedBooking.vendorName}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Vehicle:</span> <span className="text-gray-200">{selectedBooking.vehicleNumber}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Reason:</span> <span className="text-amber-400">{selectedBooking.exceptionDetails.reason}</span></div>
                        </div>

                        <label className="block text-sm font-medium text-gray-300 mb-2">Mandatory Remarks</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 h-24 resize-none mb-6"
                            placeholder="Enter approval/rejection notes..."
                        ></textarea>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleAction('Reject')}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/50 py-3 rounded-lg font-medium transition-colors"
                            >
                                Reject Request
                            </button>
                            <button
                                onClick={() => handleAction('Approve')}
                                className="bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-lg font-bold shadow-lg shadow-emerald-500/20 transition-all"
                            >
                                Approve Exception
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OperationsPortal;

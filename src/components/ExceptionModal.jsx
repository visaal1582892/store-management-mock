import React, { useState } from 'react';
import { useLogistics } from '../context/LogisticsContext';

const ExceptionModal = ({ onClose, booking }) => {
    const { requestException } = useLogistics();
    const [reason, setReason] = useState('');
    const [revisedDate, setRevisedDate] = useState('');
    const [status, setStatus] = useState('idle'); // idle, submitting, success

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('submitting');

        // Mock API call
        setTimeout(() => {
            requestException(booking.id, {
                reason,
                date: revisedDate,
                type: 'Delayed > 14 Days (No Slots)'
            });
            setStatus('success');
            setTimeout(onClose, 2000);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-zinc-900 border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white"
                >
                    ✕
                </button>

                <div className="mb-6">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Exception Request</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        Vehicle: <span className="text-white font-mono">{booking?.vehicleNumber}</span>
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="text-center py-8">
                        <div className="text-emerald-400 text-lg font-medium mb-2">Request Submitted</div>
                        <p className="text-gray-500 text-sm">Approvals typically processed within 4 hours.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Revised Expected Arrival</label>
                            <input
                                type="date"
                                value={revisedDate}
                                onChange={(e) => setRevisedDate(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Reason for Delay</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                                required
                            >
                                <option value="">Select Reason...</option>
                                <option value="Vehicle Breakdown">Vehicle Breakdown</option>
                                <option value="Driver Unwell/Fatigue">Driver Unwell/Fatigue</option>
                                <option value="Festival/Holiday Delay">Festival/Holiday Delay</option>
                                <option value="Route Blocking/Traffic">Route Blocking/Traffic</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Supporting Attachment (Optional)</label>
                            <input type="file" className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20" />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {status === 'submitting' ? 'Submitting...' : 'Submit Exception Request'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ExceptionModal;

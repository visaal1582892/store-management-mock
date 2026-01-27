import React, { useState } from 'react';

const DocumentViewerModal = ({ isOpen, onClose, booking }) => {
    if (!isOpen || !booking) return null;

    const [activeTab, setActiveTab] = useState('coa');

    const docs = [
        { id: 'coa', label: 'COA', required: true },
        { id: 'invoice', label: 'Invoice', required: true },
        { id: 'lr', label: 'LR', required: false },
    ];

    const hasDoc = (id) => booking.documents && booking.documents[id];

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-bold text-slate-900">Shipment Documents</h3>
                        <p className="text-xs text-slate-500">Booking ID: {booking.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {docs.map(doc => (
                        <button
                            key={doc.id}
                            onClick={() => setActiveTab(doc.id)}
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === doc.id ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-gray-50'}`}
                        >
                            {doc.label}
                            {/* Status Dot */}
                            {hasDoc(doc.id) ? (
                                <span className="ml-2 inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                            ) : (
                                doc.required && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-rose-400"></span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 min-h-[400px]">
                    {hasDoc(activeTab) ? (
                        <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-red-50 rounded text-red-600">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{docs.find(d => d.id === activeTab).label}.pdf</h4>
                                        <p className="text-xs text-slate-500">Uploaded on {new Date(booking.date).toLocaleDateString()}</p>
                                    </div>
                                    <button className="ml-auto text-xs text-indigo-600 font-bold hover:underline">Download</button>
                                </div>
                                {/* Dummy Preview */}
                                <div className="aspect-[3/4] bg-slate-100 rounded border-2 border-dashed border-slate-200 flex items-center justify-center">
                                    <div className="text-center text-slate-400">
                                        <p className="font-medium text-sm">Document Preview</p>
                                        <p className="text-xs mt-1">Mock content for {activeTab.toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                            <svg className="w-12 h-12 mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm">No {docs.find(d => d.id === activeTab).label} document uploaded.</p>
                            {!docs.find(d => d.id === activeTab).required && <p className="text-xs mt-1 text-slate-400">(Optional)</p>}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-white border-t border-gray-200 text-right">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors">
                        Close Viewer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentViewerModal;

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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
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
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === doc.id ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-gray-50'}`}
                        >
                            <span>{doc.label}</span>
                            {/* Status Dot */}
                            {hasDoc(doc.id) ? (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            ) : (
                                doc.required && <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 min-h-[400px]">
                    {hasDoc(activeTab) ? (
                        <div className="max-w-lg mx-auto w-full animate-in zoom-in-95 duration-200">
                            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
                                <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-100">
                                    <div className="p-3 bg-red-50 rounded-lg text-red-600">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base font-bold text-slate-900 truncate">{docs.find(d => d.id === activeTab).label}.pdf</h4>
                                        <p className="text-xs text-slate-500 mt-1">Uploaded on {new Date(booking.date).toLocaleDateString()}</p>
                                    </div>
                                    <button className="px-3 py-1.5 text-xs text-indigo-600 font-bold hover:bg-indigo-50 rounded-md border border-indigo-100 transition-colors">Download</button>
                                </div>
                                {/* Dummy Preview */}
                                <div className="aspect-[4/5] bg-slate-100 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/20"></div>
                                    <div className="relative z-10 text-center p-8">
                                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="font-bold text-slate-600">Document Preview</p>
                                        <p className="text-xs text-slate-500 mt-1">This is a mock visualization of the {docs.find(d => d.id === activeTab).label} document.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-300">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-slate-600 mb-1">Missing Document</h4>
                            <p className="text-sm text-slate-400 max-w-xs">The {docs.find(d => d.id === activeTab).label} document has not been uploaded for this booking yet.</p>
                            {!docs.find(d => d.id === activeTab).required && <p className="mt-4 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-100">Optional Document</p>}
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

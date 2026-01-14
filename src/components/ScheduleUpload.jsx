import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useLogistics } from '../context/LogisticsContext';

const ScheduleUpload = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { warehouses } = useLogistics();

    // Get context if employee
    const employeeWarehouse = user?.role === 'warehouse_employee'
        ? warehouses.find(w => w.id === user.warehouseId)
        : null;

    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error'

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setUploadStatus(null);
        }
    };

    const handleDownloadTemplate = () => {
        // Create sample data with dynamic dates
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 2);

        const formatDate = (date) => date.toISOString().split('T')[0];

        const csvContent = [
            ['WarehouseID', 'Date', 'TotalSlots'],
            ['INTGHYD00763', formatDate(tomorrow), '15'],
            ['INTGBLR00124', formatDate(tomorrow), '12'],
            ['INTGMUM00992', formatDate(nextDay), '10']
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "slot_schedule_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleUpload = () => {
        if (!file) return;

        setIsUploading(true);
        // Simulate API call / Processing
        setTimeout(() => {
            setIsUploading(false);
            setUploadStatus('success');
            // Here you would typically parse the file and update the LogisticsContext
        }, 2000);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/capacity')}
                    className="p-2 hover:bg-gray-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
                >
                    ← Back
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Upload Capacity Schedule</h1>
                    {employeeWarehouse && (
                        <p className="text-sm text-indigo-600 font-medium mt-1">
                            Updating for: {employeeWarehouse.name} ({employeeWarehouse.id})
                        </p>
                    )}
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Import Steps</h3>
                    <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
                        <li>Download the <span onClick={handleDownloadTemplate} className="text-indigo-600 cursor-pointer hover:underline font-medium">standard template (CSV)</span>.</li>
                        <li>Fill in the slot capacities for each warehouse and date.</li>
                        <li>Upload the completed file below.</li>
                    </ol>
                </div>

                <div
                    className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${file ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                        }`}
                >
                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        disabled={isUploading || uploadStatus === 'success'}
                    />

                    {!file ? (
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                            <span className="text-4xl">📤</span>
                            <span className="font-medium text-slate-700">Click to upload or drag file here</span>
                            <span className="text-xs text-slate-400">Supported formats: .xlsx, .xls, .csv</span>
                        </label>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-4xl">📄</span>
                            <span className="font-semibold text-slate-900">{file.name}</span>
                            <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</span>

                            {uploadStatus !== 'success' && !isUploading && (
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-xs text-rose-600 hover:underline mt-2"
                                >
                                    Remove File
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {uploadStatus === 'success' ? (
                    <div className="mt-8 bg-emerald-50 border border-emerald-100 rounded-lg p-6 text-center animate-in fade-in zoom-in duration-300">
                        <div className="text-4xl mb-3">✅</div>
                        <h4 className="text-lg font-bold text-emerald-800 mb-1">Schedule Updated Successfully</h4>
                        <p className="text-sm text-emerald-600 mb-4">The capacity data has been refreshed across all regions.</p>
                        <button
                            onClick={() => navigate('/capacity')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all"
                        >
                            Return to Capacity Grid
                        </button>
                    </div>
                ) : (
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold shadow-md transition-all ${!file || isUploading
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-[0.99]'
                                }`}
                        >
                            {isUploading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                "Process Schedule"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheduleUpload;

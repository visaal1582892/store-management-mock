import React, { createContext, useContext, useState } from 'react';
import { getAllWarehouses } from '../data/warehouses';

const LogisticsContext = createContext();

export const useLogistics = () => useContext(LogisticsContext);

export const LogisticsProvider = ({ children }) => {
    // Initialize warehouses and slots directly in useState to avoid useEffect setState
    const [warehouses] = useState(() => getAllWarehouses());
    const [bookings, setBookings] = useState([]); // Array of booking objects
    // bookings structure: { id, vendorName, warehouseId, originalDate, revisedDate, slot, vehicleNumber, items, totalBoxes, documents, status, dropItems }
    // Statuses: 'Confirmed', 'Delayed', 'Exception Requested', 'Exception Approved', 'Exception Rejected', 'Completed', 'Cancelled'

    const generateInitialSlots = (warehousesList) => {
        const today = new Date();
        const newSlots = {};

        warehousesList.forEach(wh => {
            newSlots[wh.id] = {};
            for (let i = 0; i < 30; i++) { // Generate for 30 days to cover 14-day check
                const date = new Date(today);
                date.setDate(today.getDate() + i);

                // Skip Sundays
                if (date.getDay() === 0) continue;

                const dateString = date.toISOString().split('T')[0];

                // Strict capacity between 2 and 3
                const totalCapacity = Math.floor(Math.random() * 2) + 2;

                newSlots[wh.id][dateString] = {
                    total: totalCapacity,
                    booked: 0,
                    bookingIds: []
                };
            }
        });
        return newSlots;
    };

    const [slots, setSlots] = useState(() => generateInitialSlots(getAllWarehouses()));

    const addBooking = (newBooking) => {
        const { warehouseId, date } = newBooking;

        if (!slots[warehouseId] || !slots[warehouseId][date]) {
            throw new Error("Invalid slot or date (Sundays closed)");
        }

        const slotInfo = slots[warehouseId][date];
        if (slotInfo.booked >= slotInfo.total) {
            throw new Error("Slot capacity reached");
        }

        const bookingId = `BKG-${Math.floor(Math.random() * 10000)}`;
        const bookingWithId = {
            ...newBooking,
            id: bookingId,
            status: 'Confirmed',
            originalDate: date,
            history: [{ status: 'Confirmed', timestamp: new Date().toISOString() }]
        };

        setBookings(prev => [...prev, bookingWithId]);
        setSlots(prev => ({
            ...prev,
            [warehouseId]: {
                ...prev[warehouseId],
                [date]: {
                    ...prev[warehouseId][date],
                    booked: prev[warehouseId][date].booked + 1,
                    bookingIds: [...prev[warehouseId][date].bookingIds, bookingId]
                }
            }
        }));
        return bookingWithId;
    };

    const markAsDelayed = (bookingId) => {
        setBookings(prev => prev.map(b => {
            if (b.id === bookingId) {
                return {
                    ...b,
                    status: 'Delayed',
                    history: [...b.history, { status: 'Delayed', timestamp: new Date().toISOString() }]
                };
            }
            return b;
        }));
    };

    const requestException = (bookingId, exceptionData) => {
        setBookings(prev => prev.map(b => {
            if (b.id === bookingId) {
                return {
                    ...b,
                    status: 'Exception Requested',
                    exceptionDetails: exceptionData,
                    history: [...b.history, { status: 'Exception Requested', timestamp: new Date().toISOString() }]
                };
            }
            return b;
        }));
    };

    const processException = (bookingId, action, remarks) => { // action: 'Approve' or 'Reject'
        setBookings(prev => prev.map(b => {
            if (b.id === bookingId) {
                const newStatus = action === 'Approve' ? 'Exception Approved' : 'Exception Rejected';
                return {
                    ...b,
                    status: newStatus,
                    warehouseRemarks: remarks,
                    history: [...b.history, { status: newStatus, timestamp: new Date().toISOString(), remarks }]
                };
            }
            return b;
        }));
    };

    // Helper to check next 14 days availability
    const check14DayAvailability = (warehouseId, fromDate) => {
        const start = new Date(fromDate);
        let available = false;

        for (let i = 1; i <= 14; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];

            if (slots[warehouseId]?.[dateStr]) {
                const slot = slots[warehouseId][dateStr];
                if (slot.booked < slot.total) { // simplistic check
                    available = true;
                    break;
                }
            }
        }
        return available;
    };

    const value = {
        warehouses,
        bookings,
        slots,
        addBooking,
        markAsDelayed,
        requestException,
        processException,
        check14DayAvailability
    };

    return (
        <LogisticsContext.Provider value={value}>
            {children}
        </LogisticsContext.Provider>
    );
};

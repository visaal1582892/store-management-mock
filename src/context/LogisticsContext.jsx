import React, { createContext, useContext, useState } from 'react';
import { getAllWarehouses } from '../data/warehouses';

const LogisticsContext = createContext();

export const useLogistics = () => useContext(LogisticsContext);

export const LogisticsProvider = ({ children }) => {
    // Initialize warehouses and slots directly in useState to avoid useEffect setState
    const [warehouses] = useState(() => getAllWarehouses());
    const [bookings, setBookings] = useState([]); // Array of booking objects
    // bookings structure: { id, vendorName, warehouseId, originalDate, revisedDate, slot, vehicleNumber, items, totalBoxes, documents, status, dropItems }
    // Statuses: 'Confirmed', 'Delayed', 'Completed', 'Cancelled'

    const generateInitialSlots = (warehousesList) => {
        const today = new Date();
        const newSlots = {};
        const TIME_SLOTS = ['09:00 - 12:00', '13:00 - 16:00', '16:00 - 19:00'];

        warehousesList.forEach(wh => {
            newSlots[wh.id] = {};
            for (let i = 0; i < 30; i++) { // Generate for 30 days
                const date = new Date(today);
                date.setDate(today.getDate() + i);

                // Skip Sundays
                if (date.getDay() === 0) continue;

                const dateString = date.toISOString().split('T')[0];

                // Initialize all 3 slots as Available
                const slotDetails = {};
                TIME_SLOTS.forEach(ts => slotDetails[ts] = 'Available');

                newSlots[wh.id][dateString] = {
                    total: 3,
                    booked: 0,
                    bookingIds: [],
                    slotDetails: slotDetails
                };
            }
        });
        return newSlots;
    };

    const [slots, setSlots] = useState(() => generateInitialSlots(getAllWarehouses()));

    const addBooking = (newBooking) => {
        const { warehouseId, date, slotTime } = newBooking;

        if (!slots[warehouseId] || !slots[warehouseId][date]) {
            throw new Error("Invalid slot or date (Sundays closed)");
        }

        const slotInfo = slots[warehouseId][date];
        if (slotInfo.slotDetails[slotTime] !== 'Available') {
            throw new Error("Selected time slot is already booked");
        }

        const bookingId = `BKG-${Math.floor(Math.random() * 10000)}`;
        const bookingWithId = {
            ...newBooking,
            id: bookingId,
            status: 'Confirmed',
            originalDate: date,
            slot: slotTime, // Persist slot time
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
                    bookingIds: [...prev[warehouseId][date].bookingIds, bookingId],
                    slotDetails: {
                        ...prev[warehouseId][date].slotDetails,
                        [slotTime]: 'Booked'
                    }
                }
            }
        }));
        return bookingWithId;
    };

    const cancelBooking = (bookingId) => {
        setBookings(prev => prev.map(b => {
            if (b.id === bookingId) {
                return { ...b, status: 'Cancelled', history: [...b.history, { status: 'Cancelled', timestamp: new Date().toISOString() }] };
            }
            return b;
        }));

        // Restore slot availability
        const booking = bookings.find(b => b.id === bookingId);
        if (booking && booking.status !== 'Cancelled') {
            const { warehouseId, originalDate, slot } = booking;
            setSlots(prev => ({
                ...prev,
                [warehouseId]: {
                    ...prev[warehouseId],
                    [originalDate]: {
                        ...prev[warehouseId][originalDate],
                        booked: Math.max(0, prev[warehouseId][originalDate].booked - 1),
                        slotDetails: {
                            ...prev[warehouseId][originalDate].slotDetails,
                            [slot]: 'Available'
                        }
                    }
                }
            }));
        }
    };

    const markAsDelayed = (bookingId) => {
        setBookings(prev => prev.map(b => {
            if (b.id === bookingId) {
                // Toggle Logic: If already delayed, revert to Confirmed. Else mark Delayed.
                const newStatus = b.status === 'Delayed' ? 'Confirmed' : 'Delayed';
                return {
                    ...b,
                    status: newStatus,
                    history: [...b.history, { status: newStatus, timestamp: new Date().toISOString() }]
                };
            }
            return b;
        }));
    };



    const value = {
        warehouses,
        bookings,
        slots,
        addBooking,
        markAsDelayed,
        cancelBooking
    };

    return (
        <LogisticsContext.Provider value={value}>
            {children}
        </LogisticsContext.Provider>
    );
};

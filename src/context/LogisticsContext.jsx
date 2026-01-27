import { createContext, useState, useContext } from 'react';
import { generateInitialData } from './initialData';
import { getAllWarehouses } from '../data/warehouses';
import { BOOKING_STATUS } from '../utils/constants';
import { calculateScheduleStatus } from '../utils/dateUtils';

const LogisticsContext = createContext
    ();

export const useLogistics = () => useContext(LogisticsContext);

export const LogisticsProvider = ({ children }) => {
    // Initialize warehouses and slots directly in useState to avoid useEffect setState
    const [warehouses] = useState(() => getAllWarehouses());

    // Use centralized generator
    const [initialData] = useState(() => generateInitialData());

    const [bookings, setBookings] = useState(initialData.bookings);
    const [slots, setSlots] = useState(initialData.slots);

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
            status: BOOKING_STATUS.PENDING, // Default for new
            boxes: newBooking.boxes || 0,
            originalDate: date,
            slot: slotTime, // Persist slot time
            history: [{ status: BOOKING_STATUS.PENDING, timestamp: new Date().toISOString() }]
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
                return { ...b, status: BOOKING_STATUS.CANCELLED, history: [...b.history, { status: BOOKING_STATUS.CANCELLED, timestamp: new Date().toISOString() }] };
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



    const approveBooking = (bookingId) => {
        setBookings(prev => prev.map(b => {
            if (b.id === bookingId) {
                return {
                    ...b,
                    status: BOOKING_STATUS.BOOKED,
                    history: [...b.history, { status: BOOKING_STATUS.BOOKED, timestamp: new Date().toISOString() }]
                };
            }
            return b;
        }));
    };

    const rejectBooking = (bookingId) => {
        setBookings(prev => prev.map(b => {
            if (b.id === bookingId) {
                return {
                    ...b,
                    status: BOOKING_STATUS.REJECTED,
                    history: [...b.history, { status: BOOKING_STATUS.REJECTED, timestamp: new Date().toISOString() }]
                };
            }
            return b;
        })); // Note: We do NOT free up the slot immediately in this mock logic 
        // to keep history visible, but in real app we might.
        // For now, let's keep it 'Booked' in the slot map but 'Rejected' in booking list.
    };



    const markVehicleEntered = (bookingId) => {
        setBookings(prev => prev.map(b => {
            if (b.id === bookingId) {
                // SIMULATED TIME LOGIC:
                // Instead of "now", we set it to Slot Start Time + Random (5-20 mins)
                // This mimics a realistic "On Time" or slightly "Late" arrival relative to the slot.
                // NOTE: If you want to force a DELAY, we can tweak this logic or user manual override.
                // For this mock, let's assume "Action clicked" = "Vehicle arrived reasonably near slot start".

                const [startStr] = b.slot.split(' - ');
                const simulatedEntry = new Date(`${b.date}T${startStr}:00`);
                // Random delay 5 to 25 minutes
                simulatedEntry.setMinutes(simulatedEntry.getMinutes() + 5 + Math.floor(Math.random() * 20));

                const entryIso = simulatedEntry.toISOString();

                return {
                    ...b,
                    status: BOOKING_STATUS.VEHICLE_REACHED,
                    entryTime: entryIso,
                    unloadingStatus: 'In-Progress',
                    history: [...b.history, { status: BOOKING_STATUS.VEHICLE_REACHED, timestamp: new Date().toISOString() }], // History timestamp is actual action time
                    scheduleStatus: calculateScheduleStatus(b.date, b.slot, entryIso, b.exitTime)
                };
            }
            return b;
        }));
    };

    const markVehicleLeft = (bookingId) => {
        setBookings(prev => prev.map(b => {
            if (b.id === bookingId) {
                // SIMULATED TIME LOGIC:
                // Exit time = Entry Time + Random (45 - 90 mins) processing time
                const entryDate = b.entryTime ? new Date(b.entryTime) : new Date(); // Fallback if no entry (shouldn't happen)

                const simulatedExit = new Date(entryDate);
                simulatedExit.setMinutes(simulatedExit.getMinutes() + 45 + Math.floor(Math.random() * 45));

                const exitIso = simulatedExit.toISOString();

                return {
                    ...b,
                    status: BOOKING_STATUS.VEHICLE_LEFT,
                    exitTime: exitIso,
                    unloadingStatus: 'Completed',
                    history: [...b.history, { status: BOOKING_STATUS.VEHICLE_LEFT, timestamp: new Date().toISOString() }],
                    scheduleStatus: calculateScheduleStatus(b.date, b.slot, b.entryTime, exitIso)
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
        approveBooking,
        rejectBooking,
        markVehicleEntered,
        markVehicleLeft,
        updateSchedule: (warehouseId, date, activeSlots) => {
            setSlots(prev => {
                const currentDay = prev[warehouseId]?.[date];
                const currentDetails = currentDay?.slotDetails || {};

                const newDetails = {};
                let newBookedCount = 0;
                let newBookingIds = currentDay?.bookingIds || [];

                activeSlots.forEach(time => {
                    if (currentDetails[time]) {
                        newDetails[time] = currentDetails[time]; // Keep existing state (Booked/Available)
                        if (currentDetails[time] === 'Booked') newBookedCount++;
                    } else {
                        newDetails[time] = 'Available'; // New slot
                    }
                });

                return {
                    ...prev,
                    [warehouseId]: {
                        ...prev[warehouseId],
                        [date]: {
                            total: activeSlots.length,
                            booked: newBookedCount,
                            bookingIds: newBookingIds,
                            slotDetails: newDetails
                        }
                    }
                };
            });
        },
        removeSchedule: (warehouseId, date) => {
            setSlots(prev => {
                const newWh = { ...prev[warehouseId] };
                delete newWh[date];
                return { ...prev, [warehouseId]: newWh };
            });
        }
    };

    return (
        <LogisticsContext.Provider value={value}>
            {children}
        </LogisticsContext.Provider>
    );
};

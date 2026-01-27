import { getAllWarehouses } from '../data/warehouses';
import { formatDateYYYYMMDD, calculateScheduleStatus } from '../utils/dateUtils';
import { BOOKING_STATUS } from '../utils/constants';
import { VENDORS, DRIVERS, ITEMS, DEMO_SCENARIO, DEMO_WAREHOUSE_ID } from '../data/mockDb';

const generateVehicleNo = () => `TS0${Math.floor(Math.random() * 9)} UB ${Math.floor(1000 + Math.random() * 9000)}`;

export const generateInitialData = () => {
    const warehouses = getAllWarehouses();
    const today = new Date();
    const slots = {};
    const bookings = [];
    const TIME_SLOTS = ['09:00 - 12:00', '13:00 - 16:00', '16:00 - 19:00'];

    // Helper to Convert HH:MM to ISO for Today
    const toIsoForToday = (timeStr) => {
        if (!timeStr || timeStr === '-') return null;
        const [hours, minutes] = timeStr.split(':');
        const d = new Date(today);
        d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return d.toISOString();
    };



    warehouses.forEach(wh => {
        slots[wh.id] = {};

        // Generate data until March 31, 2026
        const targetDate = new Date('2026-03-31');

        // Loop using day offset 'i' to preserve existing logic structure
        for (let i = 0; ; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Stop if we exceed the target date
            if (date > targetDate) break;

            // Skip Sundays
            if (date.getDay() === 0) continue;

            const dateString = formatDateYYYYMMDD(date);
            const isToday = i === 0;

            const slotDetails = {};
            let bookedCount = 0;
            const dailyBookingIds = [];

            // Check if we should use the Demo Scenario (Today + Specific Warehouse)
            const useDemoScenario = isToday && wh.id === DEMO_WAREHOUSE_ID;

            TIME_SLOTS.forEach((time, slotIndex) => {
                let isBooked = false;
                let demoSlotData = null;

                if (useDemoScenario) {
                    // Find matching slot in demo scenario
                    demoSlotData = DEMO_SCENARIO.find(s => s.slotTime === time);
                    if (demoSlotData && demoSlotData.status === 'Booked') {
                        isBooked = true;
                    }
                } else {
                    // Random generation for other days/warehouses
                    // Approx 40% chance
                    isBooked = Math.random() < 0.4;
                }

                if (isBooked) {
                    slotDetails[time] = 'Booked';
                    bookedCount++;

                    // Create Booking Data
                    const bookingId = `BKG-${dateString.replace(/-/g, '')}-${wh.id.substring(8)}-${slotIndex}`;

                    let booking;

                    if (useDemoScenario && demoSlotData) {
                        // Use Static Demo Data
                        const vendorObj = VENDORS.find(v => v.id === demoSlotData.vendorId);
                        const entryIso = toIsoForToday(demoSlotData.entryTime);
                        const exitIso = toIsoForToday(demoSlotData.exitTime);

                        booking = {
                            id: bookingId,
                            warehouseId: wh.id,
                            vendorName: vendorObj ? vendorObj.name : "Unknown Vendor",
                            vendorId: demoSlotData.vendorId,
                            date: dateString,
                            originalDate: dateString,
                            slot: time,
                            slotTime: time,
                            status: 'Booked',
                            items: demoSlotData.item,
                            boxes: demoSlotData.boxes || 100,
                            documents: { coa: true, invoice: true, lr: true },
                            dropItems: [wh.id],
                            inTime: null,
                            outTime: null,
                            history: [{ status: 'Booked', timestamp: new Date().toISOString() }],

                            // Live Ops Fields - from DB
                            vehicleNumber: demoSlotData.vehicleNo,
                            contact: demoSlotData.contact,
                            driverContact: '9848012345',
                            unloadingStatus: demoSlotData.unloadingStatus,
                            entryTime: entryIso,
                            exitTime: exitIso,
                            scheduleStatus: calculateScheduleStatus(dateString, time, entryIso, exitIso)
                        };
                    } else {
                        // Random Data
                        const vendor = VENDORS[Math.floor(Math.random() * VENDORS.length)];
                        const driver = DRIVERS[Math.floor(Math.random() * DRIVERS.length)];

                        // Parse Slot Start/End for randomized times
                        const [startHour, startMin] = time.split(' - ')[0].split(':').map(Number);
                        const [endHour, endMin] = time.split(' - ')[1].split(':').map(Number);

                        const slotStart = new Date(date);
                        slotStart.setHours(startHour, startMin, 0, 0);

                        const slotEnd = new Date(date);
                        slotEnd.setHours(endHour, endMin, 0, 0);

                        booking = {
                            id: bookingId,
                            warehouseId: wh.id,
                            vendorName: vendor.name,
                            vendorId: vendor.id,
                            date: dateString,
                            originalDate: dateString,
                            slot: time,
                            slotTime: time,
                            // Randomize status for variety in 'All Bookings'
                            status: (() => {
                                const rand = Math.random();
                                if (rand < 0.3) return BOOKING_STATUS.PENDING;
                                if (rand < 0.6) return BOOKING_STATUS.BOOKED;
                                if (rand < 0.8) return BOOKING_STATUS.VEHICLE_REACHED;
                                return BOOKING_STATUS.VEHICLE_LEFT;
                            })(),
                            items: ITEMS[Math.floor(Math.random() * ITEMS.length)],
                            boxes: Math.floor(50 + Math.random() * 450),
                            documents: { coa: true, invoice: true, lr: true },
                            dropItems: [wh.id],
                            inTime: null,
                            outTime: null,
                            history: [{ status: 'Generated', timestamp: new Date().toISOString() }],

                            // Live Ops Fields - Default/Random
                            vehicleNumber: generateVehicleNo(),
                            contact: driver.contact,
                            driverContact: driver.contact,
                            unloadingStatus: 'Pending',
                            entryTime: null,
                            exitTime: null,
                            scheduleStatus: 'On time'
                        };

                        // If status implies activity, generate times that might be delayed
                        if ([BOOKING_STATUS.VEHICLE_REACHED, BOOKING_STATUS.VEHICLE_LEFT].includes(booking.status)) {
                            // 30% chance of being late
                            const isLateEntry = Math.random() < 0.3;
                            const entryDelayMinutes = isLateEntry ? Math.floor(35 + Math.random() * 60) : Math.floor(Math.random() * 20); // Late > 30m, else < 20m

                            const actualEntryTime = new Date(slotStart);
                            actualEntryTime.setMinutes(actualEntryTime.getMinutes() + entryDelayMinutes);
                            booking.entryTime = actualEntryTime.toISOString();
                            booking.inTime = actualEntryTime.toISOString(); // Legacy field sync

                            if (booking.status === BOOKING_STATUS.VEHICLE_LEFT) {
                                const isLateExit = Math.random() < 0.3;
                                const durationMinutes = 60 + Math.random() * 60; // 1-2 hours duration

                                // To force exit delay, we can push it past slotEnd + 30
                                let actualExitTime = new Date(actualEntryTime);
                                actualExitTime.setMinutes(actualExitTime.getMinutes() + durationMinutes);

                                if (isLateExit) {
                                    // Ensure it's late compared to slotEnd
                                    const minExitForDelay = new Date(slotEnd);
                                    minExitForDelay.setMinutes(minExitForDelay.getMinutes() + 35);
                                    if (actualExitTime < minExitForDelay) {
                                        actualExitTime = minExitForDelay;
                                    }
                                }

                                booking.exitTime = actualExitTime.toISOString();
                                booking.outTime = actualExitTime.toISOString(); // Legacy
                                booking.unloadingStatus = 'Completed';
                            } else {
                                booking.unloadingStatus = 'In-Progress';
                            }

                            // Recalculate status based on these generated times
                            booking.scheduleStatus = calculateScheduleStatus(dateString, time, booking.entryTime, booking.exitTime);
                        }
                    }

                    bookings.push(booking);
                    dailyBookingIds.push(bookingId);

                } else {
                    slotDetails[time] = 'Available';
                }
            });

            slots[wh.id][dateString] = {
                total: TIME_SLOTS.length, // Ensure total is based on slots present
                booked: bookedCount,
                bookingIds: dailyBookingIds,
                slotDetails: slotDetails
            };
        }
    });

    return { slots, bookings };
};

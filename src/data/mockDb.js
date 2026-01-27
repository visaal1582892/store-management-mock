// centralized mock database
// This file acts as the source of truth for the "Demo Day" scenario.

export const DEMO_WAREHOUSE_ID = 'INTGHYD00763'; // Hyderabad
// We will dynamically determine the "Demo Date" as Today in the generator, 
// but here we define the static data structure.

export const VENDORS = [
    { name: "Alpha Pharma", id: "VND-1001" },
    { name: "Beta Logistics", id: "VND-1002" },
    { name: "Gamma Supply", id: "VND-1003" },
    { name: "Delta Meds", id: "VND-1004" },
    { name: "Vendor Partner", id: "VND-PARTNER" } // Current User
];

export const ITEMS = ["Paracetamol Bulk", "Syringes", "Antibiotics", "Saline Bottles", "Cotton Bales"];

export const DRIVERS = [
    { contact: "9876543210" },
    { contact: "8877665544" },
    { contact: "9123456780" },
    { contact: "7766554433" }
];

// The Demo Scenario: Specific slots and their exact states
export const DEMO_SCENARIO = [
    {
        slotTime: '09:00 - 12:00',
        status: 'Vehicle Exited',
        vendorId: 'VND-1001', // Alpha Pharma
        item: "Paracetamol Bulk",
        boxes: 45,
        contact: "9876543210",
        vehicleNo: "TS09 UB 1234",
        entryTime: "09:15",
        exitTime: "11:30",
        unloadingStatus: "Completed"
    },
    {
        slotTime: '13:00 - 16:00',
        status: 'Booked',
        vendorId: 'VND-PARTNER', // Vendor Partner (Active Demo)
        item: "Cotton Bales",
        boxes: 120,
        contact: "9123456780",
        vehicleNo: "TS08 UA 5678",
        entryTime: "13:10",
        exitTime: null,
        unloadingStatus: "In-Progress"
    },
    {
        slotTime: '16:00 - 19:00',
        status: 'Approval Pending', // New Request for demo
        vendorId: 'VND-1002', // Beta Logistics
        item: "Syringes",
        boxes: 30,
        contact: "8877665544",
        vehicleNo: "AP16 TV 9988",
        // No live ops data yet
    }
];

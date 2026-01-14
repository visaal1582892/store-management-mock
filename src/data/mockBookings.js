export const MOCK_BOOKINGS = [
    {
        id: "BKG-1001",
        vendorName: "Alpha Pharma",
        warehouseId: "tg-hyderabad-hyderabad-hub-1",
        date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], // 2 days from now
        status: "Confirmed",
        items: "Paracetamol Bulk",
        documents: { coa: true, invoice: true, lr: true },
        dropItems: ["tg-hyderabad-hyderabad-hub-1"],
        inTime: null,
        outTime: null,
    },
    {
        id: "BKG-1002",
        vendorName: "Beta Logistics",
        warehouseId: "mh-pune-pune-hub",
        date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0], // 3 days from now
        status: "Pending Documents",
        items: "Syringes",
        documents: { coa: true, invoice: false, lr: true },
        dropItems: ["mh-pune-pune-hub", "tg-medchal-medchal-hub"],
        inTime: null,
        outTime: null,
    },
];

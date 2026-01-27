export const formatDateYYYYMMDD = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const calculateScheduleStatus = (dateStr, slotTime, entryIso, exitIso) => {
    if (!slotTime || !dateStr) return 'On time';

    try {
        const [startStr, endStr] = slotTime.split(' - ');

        // Construct Scheduled Dates
        // append default seconds to ensure valid time parsing if needed, but Txx:xx:00 works
        const scheduledStart = new Date(`${dateStr}T${startStr}:00`);
        const scheduledEnd = new Date(`${dateStr}T${endStr}:00`);

        // Checks
        if (entryIso) {
            const entryDate = new Date(entryIso);
            const diffMs = entryDate - scheduledStart;
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins > 30) return 'Entry delayed';
        }

        if (exitIso) {
            const exitDate = new Date(exitIso);
            const diffMs = exitDate - scheduledEnd;
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins > 30) return 'Exit delayed';
        }

        return 'On time';
    } catch (e) {
        console.error("Error calculating schedule status", e);
        return 'On time';
    }
};

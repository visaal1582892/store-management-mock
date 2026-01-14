export const WAREHOUSE_DATA = [
    {
        state: "Andhra Pradesh",
        code: "AP",
        locations: [
            { city: "Vijayawada", warehouses: [{ id: "INAPBZA00022", name: "OHS AUTONAGAR VIJAYAWADA" }] },
            { city: "Vizag", warehouses: [{ id: "INAPVSK00107", name: "VIZAG WAREHOUSE" }] },
        ],
    },
    {
        state: "Karnataka",
        code: "KA",
        locations: [
            {
                city: "Bangalore", warehouses: [
                    { id: "INKABLR00255", name: "OHS FMCG BENGALURU INVENTORY" },
                    { id: "INKABLR00174", name: "PBTA-OHS-BENGALURU-INVENTORY" },
                    { id: "INKABLR00701", name: "ADKAMARANAHALLI FMCG PRIVATE LABEL WAREHOUSE" }
                ]
            },
            { city: "Hubli", warehouses: [{ id: "INKAHBL00055", name: "HUBLI WAREHOUSE" }] },
        ],
    },
    {
        state: "Maharashtra",
        code: "MH",
        locations: [
            { city: "Pune", warehouses: [{ id: "INMHPNQ00087", name: "PBTA-OHS-PUNE-NEW INVENTORY PNQ" }] },
            { city: "Mumbai", warehouses: [{ id: "INMHMUM00007", name: "OHS WAREHOUSE MUMBAI MUM" }] },
            { city: "Bhiwandi", warehouses: [{ id: "INMHMUM00053", name: "OHS BHIWANDI WAREHOUSE MUMBAI MUM" }] },
            { city: "Nagpur", warehouses: [{ id: "INMHNAG00066", name: "OHS NAGPUR WAREHOUSE NAG" }] },
        ],
    },
    {
        state: "Odisha",
        code: "OD",
        locations: [
            {
                city: "Bhubaneswar", warehouses: [
                    { id: "INORBBI00011", name: "OHS NEW BHUBANESWAR OR pharma" },
                    { id: "INORBBI00090", name: "OGALAPADA WAREHOUSE ODISHA OR general" }
                ]
            },
        ],
    },
    {
        state: "West Bengal",
        code: "WB",
        locations: [
            { city: "Kolkata", warehouses: [{ id: "INWBCCU00250", name: "OHS NILGUNGE WAREHOUSE KOLKATA" }] },
            { city: "Hoogly", warehouses: [{ id: "INWBHGY00031", name: "HOOGLY WAREHOUSE" }] },
        ],
    },
    {
        state: "Tamil Nadu",
        code: "TN",
        locations: [
            {
                city: "Chennai", warehouses: [
                    { id: "INTNMAS00120", name: "OHS FMCG INVENTORY CHENNAI" },
                    { id: "INTNMAS00103", name: "PBTA-OHS-CHENNAI-INVENTORY" }
                ]
            },
            { city: "Kovur", warehouses: [{ id: "INTNMAS00389", name: "OHS FMCG WAREHOUSE KOVUR" }] },
            { city: "Vellavedu", warehouses: [{ id: "INTNMAS00560", name: "OHS VELLAVEDU NEW WARE HOUSE" }] },
            { city: "Madurai", warehouses: [{ id: "INTNIXM00083", name: "MADURAI WAREHOUSE" }] },
        ],
    },
    {
        state: "Telangana",
        code: "TG",
        locations: [
            {
                city: "Hyderabad", warehouses: [
                    { id: "INAPHYD00384", name: "PBTA-OHS-HYD-INVENTORY" },
                    { id: "INTGHYD00763", name: "OPTIVAL NSP WAREHOUSE" }
                ]
            },
            {
                city: "Medchal", warehouses: [
                    { id: "INTGMDC00005", name: "OHS MEDICINE WAREHOUSE SOMARAM HYDERABAD" },
                    { id: "INTGHYD00545", name: "OHS MEDCHAL INVENTORY" }
                ]
            },
            { city: "Shamirpet", warehouses: [{ id: "INTGHYD01044", name: "OHS SHAMIRPET WAREHOUSE" }] },
        ],
    },
];

export const getAllWarehouses = () => {
    let warehouses = [];
    WAREHOUSE_DATA.forEach((state) => {
        state.locations.forEach((loc) => {
            loc.warehouses.forEach((wh) => {
                warehouses.push({
                    id: wh.id,
                    name: wh.name,
                    city: loc.city,
                    state: state.state,
                });
            });
        });
    });
    return warehouses;
};

import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Initialize from localStorage or default to 'admin'
    const [user, setUser] = useState(() => {
        const savedRole = localStorage.getItem('ag_user_role');
        const role = savedRole || 'admin';

        let name = 'Warehouse Admin';
        let warehouseId = null;

        if (role === 'vendor') name = 'Vendor Partner';
        if (role === 'warehouse_employee') {
            name = 'Warehouse Ops';
            warehouseId = 'INTGHYD00763'; // Mock assignment for Hyderabad Central
        }

        return { name, role, warehouseId };
    });

    const login = (role) => {
        let name = 'Warehouse Admin';
        let warehouseId = null;

        if (role === 'vendor') name = 'Vendor Partner';
        if (role === 'warehouse_employee') {
            name = 'Warehouse Ops';
            warehouseId = 'INTGHYD00763'; // Mock assignment
        }

        const newUser = { name, role, warehouseId };
        setUser(newUser);
        localStorage.setItem('ag_user_role', role);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ag_user_role');
    };

    const value = {
        user,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

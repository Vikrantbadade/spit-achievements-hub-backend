import { createContext, useContext, useState, useEffect } from 'react';
import api from '../../lib/api';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('adminUserInfo');
        const token = localStorage.getItem('adminToken');

        if (userInfo && token) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/signin', { email, password });

        // Check if user is Admin
        if (data.role !== 'Admin') {
            throw new Error('Access Denied: Admin only');
        }

        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUserInfo', JSON.stringify(data.user));
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUserInfo');
        setUser(null);
        window.location.href = '/admin/login';
    };

    return (
        <AdminAuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => useContext(AdminAuthContext);

import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function Layout() {
    const { user } = useAdminAuth();

    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 bg-muted/40 p-8">
                <Outlet />
            </main>
        </div>
    );
}

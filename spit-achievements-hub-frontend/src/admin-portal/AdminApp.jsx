import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';
import RolesAndPermissions from './pages/Roles';
import AdminReports from './pages/AdminReports';
import AdminAchievements from './pages/AdminAchievements';

export default function AdminApp() {
    return (
        <AdminAuthProvider>
            <Routes>
                <Route path="login" element={<Login />} />
                <Route element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="roles" element={<RolesAndPermissions />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="achievements" element={<AdminAchievements />} />
                    <Route path="logs" element={<AuditLogs />} />
                </Route>
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </AdminAuthProvider>
    );
}

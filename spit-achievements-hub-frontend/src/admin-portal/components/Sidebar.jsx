import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, FileText, LogOut } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { cn } from '../lib/utils';

export default function Sidebar() {
    const { logout } = useAdminAuth();

    const links = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/admin/users', icon: Users, label: 'User Management' },
        { to: '/admin/roles', icon: Shield, label: 'Roles & Permissions' },
        { to: '/admin/logs', icon: FileText, label: 'Audit Logs' },
    ];

    return (
        <div className="flex  w-64 flex-col border-r bg-card h-screen sticky top-0">
            <div className="flex h-14 items-center border-b px-4 font-bold text-xl text-primary">
                SPIT Admin
            </div>
            <div className="flex-1 py-4">
                <nav className="space-y-1 px-2">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                                    isActive ? "bg-muted text-foreground ring-1 ring-border" : "text-muted-foreground"
                                )
                            }
                        >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
            <div className="p-4 border-t">
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </button>
            </div>
        </div>
    );
}

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Shield, FileText, LogOut, BarChart3, CheckSquare, Activity } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { cn } from '../lib/utils';

export default function Sidebar() {
    const { logout } = useAdminAuth();

    const links = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
        { to: '/admin/users', icon: Users, label: 'User Management' },
        { to: '/admin/roles', icon: Shield, label: 'Roles & Permissions' },
        { to: '/admin/reports', icon: BarChart3, label: 'Faculty Reports' },
        { to: '/admin/achievements', icon: CheckSquare, label: 'Manage Approvals' },
        { to: '/admin/health', icon: Activity, label: 'System Health' },
        { to: '/admin/logs', icon: FileText, label: 'Audit Logs' },
    ];

    return (
        <div className="flex w-64 flex-col h-screen sticky top-0" style={{ background: 'var(--gradient-primary)', color: 'var(--sidebar-foreground)' }}>
            <div className="flex h-16 items-center px-6 font-bold text-xl tracking-wide border-b border-[hsl(348,50%,35%)] shadow-sm backdrop-blur-sm bg-white/5">
                <span className="text-white">SPIT Admin</span>
            </div>

            <div className="flex-1 py-6 px-3">
                <nav className="space-y-1.5">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-white/10 text-white shadow-lg backdrop-blur-md border border-white/10"
                                        : "text-white/70 hover:bg-white/5 hover:text-white"
                                )
                            }
                        >
                            <link.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                            <span className="relative z-10">{link.label}</span>
                            {/* Subtle glow effect for active state */}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-[hsl(348,50%,35%)] bg-black/10">
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/80 transition-all hover:bg-red-500/20 hover:text-red-200 border border-transparent hover:border-red-500/20"
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}

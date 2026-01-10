import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Users, Building2, GraduationCap, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../lib/utils';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="flex h-[50vh] items-center justify-center text-muted-foreground">Loading statistics...</div>;

    const chartData = [
        { name: 'Faculty', value: stats?.counts.faculty || 0, color: '#881337' }, // Ruby 900 (Maroon-ish)
        { name: 'HOD', value: stats?.counts.hod || 0, color: '#ca8a04' }, // Yellow 600 (Gold-ish)
        { name: 'Principal', value: stats?.counts.principal || 0, color: '#334155' }, // Slate 700
        { name: 'Admin', value: stats?.counts.admin || 0, color: '#475569' }, // Slate 600
    ];

    return (
        <div className="space-y-8 p-8">
            <div>
                <h2 className="text-4xl font-bold tracking-tight text-primary font-display">Dashboard</h2>
                <p className="text-muted-foreground mt-2 text-lg">Overview of the institute's achievements and statistics.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats?.counts.total}
                    icon={Users}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
                    iconClassName="text-blue-600"
                />
                <StatCard
                    title="Departments"
                    value={stats?.counts.departments}
                    icon={Building2}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"
                    iconClassName="text-amber-600"
                />
                <StatCard
                    title="Faculty"
                    value={stats?.counts.faculty}
                    icon={GraduationCap}
                    className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100"
                    iconClassName="text-rose-600"
                />
                <StatCard
                    title="Admins"
                    value={stats?.counts.admin}
                    icon={ShieldAlert}
                    className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200"
                    iconClassName="text-slate-700"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-6 flex flex-col space-y-1.5 border-b bg-muted/20">
                        <h3 className="font-semibold text-lg leading-none tracking-tight text-primary">User Distribution</h3>
                        <p className="text-sm text-muted-foreground">Breakdown of users by role</p>
                    </div>
                    <div className="p-6">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        className="text-xs font-medium"
                                        tick={{ fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        className="text-xs font-medium"
                                        tick={{ fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="rounded-lg border bg-background p-3 shadow-xl">
                                                        <p className="text-sm font-semibold">{payload[0].payload.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Count: <span className="font-bold text-foreground">{payload[0].value}</span>
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-span-3 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-6 flex flex-col space-y-1.5 border-b bg-muted/20">
                        <h3 className="font-semibold text-lg leading-none tracking-tight text-primary">Recent Activity</h3>
                        <p className="text-sm text-muted-foreground">Latest actions across the system</p>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            {stats?.recentLogs.slice(0, 5).map((log, i) => (
                                <div key={log._id} className="flex relative pb-1">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${i === 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                                        }`} />
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none text-foreground">{log.action}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="font-semibold text-primary">{log.actor?.name || 'Unknown'}</span>
                                            <span>•</span>
                                            <span>{new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {stats?.recentLogs.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <ShieldAlert className="h-8 w-8 mb-2 opacity-20" />
                                    <p>No recent activity recorded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const StatCard = ({ title, value, icon: Icon, className, iconClassName }) => (
    <div className={cn("rounded-xl border p-6 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md", className)}>
        <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <div className={cn("p-2 rounded-full bg-white/50", iconClassName && iconClassName.replace('text-', 'bg-').replace('600', '100'))}>
                <Icon className={cn("h-4 w-4", iconClassName)} />
            </div>
        </div>
        <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
);

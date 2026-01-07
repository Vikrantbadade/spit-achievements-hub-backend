import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { Users, Building2, GraduationCap, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div className="text-2xl font-bold">{value}</div>
    </div>
);

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

    if (loading) return <div>Loading...</div>;

    const chartData = [
        { name: 'Faculty', value: stats?.counts.faculty || 0, color: '#003366' }, // SPIT Navy
        { name: 'HOD', value: stats?.counts.hod || 0, color: '#0099CC' }, // SPIT Cyan
        { name: 'Principal', value: stats?.counts.principal || 0, color: '#334155' }, // Slate 700
        { name: 'Admin', value: stats?.counts.admin || 0, color: '#991b1b' }, // Red 800
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#003366]">Dashboard</h2>
                <p className="text-muted-foreground">Overview of the system statistics.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Users" value={stats?.counts.total} icon={Users} color="text-[#003366]" />
                <StatCard title="Departments" value={stats?.counts.departments} icon={Building2} color="text-[#0099CC]" />
                <StatCard title="Faculty" value={stats?.counts.faculty} icon={GraduationCap} color="text-[#003366]" />
                <StatCard title="Admins" value={stats?.counts.admin} icon={ShieldAlert} color="text-red-700" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-col space-y-1.5">
                        <h3 className="font-semibold leading-none tracking-tight text-[#003366]">User Distribution</h3>
                    </div>
                    <div className="p-6 pt-0 pl-1">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="name" className="text-xs text-muted-foreground" />
                                    <YAxis className="text-xs text-muted-foreground" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ccc' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 flex flex-col space-y-1.5">
                        <h3 className="font-semibold leading-none tracking-tight text-[#003366]">Recent Activity</h3>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="space-y-4">
                            {stats?.recentLogs.map((log) => (
                                <div key={log._id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none text-[#003366]">{log.action}</p>
                                        <p className="text-sm text-muted-foreground">
                                            by {log.actor?.name || 'Unknown'} at {new Date(log.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {stats?.recentLogs.length === 0 && <div className="text-muted-foreground text-sm">No recent activity</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

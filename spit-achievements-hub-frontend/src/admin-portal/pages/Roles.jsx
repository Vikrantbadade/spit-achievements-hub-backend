import { Shield, Check, X as XIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RolesAndPermissions() {
    const roles = [
        {
            name: 'Admin',
            description: 'Full system access. Can manage users, roles, and view all data.',
            permissions: { userMgmt: true, sysLogs: true, deptMgmt: true, viewAll: true }
        },
        {
            name: 'Principal',
            description: 'Can view institute-wide data and create departments.',
            permissions: { userMgmt: false, sysLogs: false, deptMgmt: true, viewAll: true }
        },
        {
            name: 'HOD',
            description: 'Manage departmental faculty and view department data.',
            permissions: { userMgmt: false, sysLogs: false, deptMgmt: false, viewAll: false }
        },
        {
            name: 'Faculty',
            description: 'Basic access to manage own profile and achievements.',
            permissions: { userMgmt: false, sysLogs: false, deptMgmt: false, viewAll: false }
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#003366]">Roles & Permissions</h2>
                <p className="text-muted-foreground">Overview of system roles and their access levels.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {roles.map((role) => (
                    <div key={role.name} className="rounded-xl border bg-card p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className={`h-5 w-5 ${role.name === 'Admin' ? 'text-red-600' : 'text-[#003366]'}`} />
                            <h3 className="font-bold text-lg">{role.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 h-12">
                            {role.description}
                        </p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span>User Management</span>
                                {role.permissions.userMgmt ? <Check className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <div className="flex justify-between items-center">
                                <span>System Logs</span>
                                {role.permissions.sysLogs ? <Check className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Dept Management</span>
                                {role.permissions.deptMgmt ? <Check className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <div className="flex justify-between items-center">
                                <span>View All Data</span>
                                {role.permissions.viewAll ? <Check className="h-4 w-4 text-green-500" /> : <XIcon className="h-4 w-4 text-muted-foreground" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-900 border border-blue-200">
                <strong>Note:</strong> Permissions are currently defined by system policies. To change a user's role, please visit the <Link to="/admin/users" className="underline hover:text-blue-700">User Management</Link> page.
            </div>
        </div>
    );
}

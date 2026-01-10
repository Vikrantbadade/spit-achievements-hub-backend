// TITLE: User Management Page (Admin Portal)
// Allows Admins to Create, Read, Update, and Delete users.
// UPDATED: Displays Plain Text Password and Hash for verification purposes.
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [departments, setDepartments] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Faculty',
        department: ''
    });

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const { data } = await api.get('/departments');
            setDepartments(data);
        } catch (error) {
            console.error('Failed to fetch departments', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            department: user.department?._id || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Basic validation for Faculty/HOD
            if ((formData.role === 'Faculty' || formData.role === 'HOD') && !formData.department) {
                alert('Department is required for Faculty/HOD');
                return;
            }

            const payload = { ...formData };
            if (payload.department === '') payload.department = null;

            if (editingUser) {
                const { data } = await api.put(`/admin/users/${editingUser._id}`, payload);
                setUsers(users.map(u => u._id === editingUser._id ? {
                    ...u,
                    ...data,
                    department: departments.find(d => d._id === payload.department) || { name: 'Updated' }
                } : u));
                fetchUsers();
            } else {
                await api.post('/admin/users', payload);
                fetchUsers();
            }
            closeModal();
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed');
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'Faculty', department: '' });
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole ? user.role === selectedRole : true;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
                    <p className="text-muted-foreground">Manage faculty, HODs, and principals.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" /> Add User
                </button>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-9 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="h-9 w-[180px] rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                >
                    <option value="">All Roles</option>
                    <option value="Faculty">Faculty</option>
                    <option value="HOD">HOD</option>
                    <option value="Principal">Principal</option>
                    <option value="Admin">Admin</option>
                </select>
            </div>

            <div className="rounded-md border bg-card">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Password</th>
                            <th className="p-4 font-medium">Role</th>
                            <th className="p-4 font-medium">Department</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="5" className="p-4 text-center text-muted-foreground">No users found</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user._id} className="border-t hover:bg-muted/50 transition-colors">
                                    <td className="p-4 font-medium">{user.name}</td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">
                                        <div className="font-mono text-sm">
                                            {user.plainPassword || (
                                                <span className="text-muted-foreground text-xs italic">
                                                    (Reset to view)
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                ${user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                                                user.role === 'Principal' ? 'bg-yellow-100 text-yellow-800' :
                                                    user.role === 'HOD' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                            `}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">{user.department?.name || '-'}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(user)} className="text-blue-500 hover:text-blue-700">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">{editingUser ? 'Edit User' : 'Add User'}</h3>
                            <button onClick={closeModal}><X className="h-5 w-5 hover:text-red-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input type="text" required className="w-full rounded-md border p-2 text-sm"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" required className="w-full rounded-md border p-2 text-sm"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password {editingUser && '(Leave blank to keep current)'}</label>
                                <input type="password" className="w-full rounded-md border p-2 text-sm"
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Role</label>
                                    <select className="w-full rounded-md border p-2 text-sm"
                                        value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Faculty">Faculty</option>
                                        <option value="HOD">HOD</option>
                                        <option value="Principal">Principal</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Department</label>
                                    <select
                                        className="w-full rounded-md border p-2 text-sm"
                                        value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        disabled={formData.role === 'Principal' || formData.role === 'Admin'}
                                    >
                                        <option value="">Select Dept</option>
                                        {departments.map(dept => (
                                            <option key={dept._id} value={dept._id}>{dept.code}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 mt-4">
                                {editingUser ? 'Update' : 'Create'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

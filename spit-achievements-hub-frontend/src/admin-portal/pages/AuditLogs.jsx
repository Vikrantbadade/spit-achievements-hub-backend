import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const fetchLogs = async (pageNumber) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/logs?pageNumber=${pageNumber}`);
            setLogs(data.logs);
            setPage(data.page);
            setTotalPages(data.pages);
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-[#003366]">Audit Logs</h2>
                <p className="text-muted-foreground">View system activities and security logs.</p>
            </div>

            <div className="rounded-md border bg-card">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="p-4 font-medium">Action</th>
                            <th className="p-4 font-medium">Actor</th>
                            <th className="p-4 font-medium">Target</th>
                            <th className="p-4 font-medium">Details</th>
                            <th className="p-4 font-medium">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="5" className="p-4 text-center text-muted-foreground">No logs found</td></tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id} className="border-t hover:bg-muted/50 transition-colors">
                                    <td className="p-4 font-medium text-[#003366]">{log.action}</td>
                                    <td className="p-4">
                                        <div className="font-medium">{log.actor?.name || 'Unknown'}</div>
                                        <div className="text-xs text-muted-foreground">{log.actor?.email}</div>
                                    </td>
                                    <td className="p-4 text-muted-foreground font-mono text-xs">
                                        {log.targetUser ? log.targetUser.toString().slice(-6) : '-'}
                                    </td>
                                    <td className="p-4 text-xs max-w-xs truncate" title={JSON.stringify(log.details)}>
                                        {JSON.stringify(log.details)}
                                    </td>
                                    <td className="p-4 text-muted-foreground">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border rounded hover:bg-muted disabled:opacity-50"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm">Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border rounded hover:bg-muted disabled:opacity-50"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

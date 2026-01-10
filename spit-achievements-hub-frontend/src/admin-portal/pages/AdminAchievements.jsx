import { useState, useEffect } from "react";
import api from "../../lib/api";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Check, X, AlertCircle } from "lucide-react";

const AdminAchievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [departments, setDepartments] = useState([]);

    const [rejectId, setRejectId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isRejectOpen, setIsRejectOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [achRes, deptRes] = await Promise.all([
                    api.get('/admin/achievements'),
                    api.get('/departments')
                ]);
                setAchievements(achRes.data);
                setDepartments(deptRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/achievements/${id}/approve`);
            setAchievements(prev => prev.map(a =>
                a._id === id ? { ...a, status: 'Approved' } : a
            ));
        } catch (error) {
            console.error("Failed to approve", error);
            alert("Failed to approve");
        }
    };

    const handleReject = async () => {
        if (!rejectId || !rejectReason) return;
        try {
            await api.put(`/admin/achievements/${rejectId}/reject`, { reason: rejectReason });
            setAchievements(prev => prev.map(a =>
                a._id === rejectId ? { ...a, status: 'Rejected', rejectionReason: rejectReason } : a
            ));
            setIsRejectOpen(false);
            setRejectReason("");
            setRejectId(null);
        } catch (error) {
            console.error("Failed to reject", error);
            alert("Failed to reject");
        }
    };

    const openRejectDialog = (id) => {
        setRejectId(id);
        setIsRejectOpen(true);
    };

    const filteredAchievements = achievements.filter((achievement) => {
        const facultyName = achievement.faculty?.name || 'Unknown';
        const deptId = achievement.faculty?.department?._id || achievement.faculty?.department || '';

        const matchesSearch =
            achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            facultyName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
            filterCategory === "all" ||
            achievement.category?.toLowerCase() === filterCategory.toLowerCase();

        // Check strict department filtering
        const matchesDepartment =
            filterDepartment === "all" ||
            deptId === filterDepartment;

        return matchesSearch && matchesCategory && matchesDepartment;
    });

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                    Manage Achievements
                </h1>
                <p className="text-muted-foreground mt-2">
                    Verify and approve faculty achievements across all departments.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search title or faculty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                            <SelectItem key={dept._id} value={dept._id}>
                                {dept.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="publication">Publication</SelectItem>
                        <SelectItem value="patent">Patent</SelectItem>
                        <SelectItem value="award">Award</SelectItem>
                        <SelectItem value="fdp">FDP</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Faculty</TableHead>
                            <TableHead>Dept</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Proof</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAchievements.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                                    No achievements found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAchievements.map((achievement) => (
                                <TableRow key={achievement._id}>
                                    <TableCell className="font-medium">
                                        {achievement.faculty?.name || 'Unknown'}
                                    </TableCell>
                                    <TableCell>
                                        {achievement.faculty?.department?.code || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{achievement.title}</span>
                                            {achievement.status === 'Rejected' && (
                                                <span className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> {achievement.rejectionReason}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{achievement.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            achievement.status === 'Approved' ? 'success' :
                                                achievement.status === 'Rejected' ? 'destructive' : 'outline'
                                        } className={
                                            achievement.status === 'Approved' ? "bg-green-100 text-green-800 hover:bg-green-100" :
                                                achievement.status === 'Rejected' ? "bg-red-100 text-red-800 hover:bg-red-100" :
                                                    "bg-yellow-100 text-yellow-800 hover:bg-yellow-800"
                                        }>
                                            {achievement.status || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(achievement.achievementDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {achievement.proof ? (
                                            <a
                                                href={`http://localhost:5000/${achievement.proof.replace(/\\/g, '/')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline text-sm"
                                            >
                                                View Proof
                                            </a>
                                        ) : (
                                            "-"
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {(!achievement.status || achievement.status === 'Pending') && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
                                                    onClick={() => handleApprove(achievement._id)}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => openRejectDialog(achievement._id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Achievement</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Please provide a reason for rejecting this achievement.
                        </p>
                        <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject}>Confirm Rejection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminAchievements;

import { useState, useEffect } from "react";
import api from "../lib/axios"; // Use the admin portal axios instance
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "../../components/StatCard";
import {
    Download,
    BookOpen,
    FileText,
    Trophy,
    Award,
    Users,
    Briefcase,
    TrendingUp,
    User,
    Search
} from "lucide-react";
import { generateReportPDF } from "@/utils/pdfGenerator";

export default function AdminReports() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeView, setActiveView] = useState("monthly"); // monthly, semester, yearly
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState("january");
    const [selectedSemester, setSelectedSemester] = useState("odd");
    const [achievements, setAchievements] = useState([]);

    // Fetch Users (Faculty & HOD)
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get("/admin/users");
                // Filter for Faculty and HODs only
                const facultyUsers = data.filter(u => u.role === "Faculty" || u.role === "HOD");
                setUsers(facultyUsers);
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };
        fetchUsers();
    }, []);

    // Fetch Achievements when user or filters change
    useEffect(() => {
        if (!selectedUser) return;

        const fetchAchievements = async () => {
            setLoading(true);
            try {
                // Fetch ALL achievements for the user 
                // We will filter client-side for specific month/semester for smoother UI
                const { data } = await api.get(`/reports/generate?faculty=${selectedUser}`);
                setAchievements(data.reportData || []);
            } catch (error) {
                console.error("Failed to fetch achievements", error);
                setAchievements([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, [selectedUser]);

    // Helper to filter achievements based on current view
    const getFilteredAchievements = () => {
        return achievements.filter(ach => {
            const date = new Date(ach.achievementDate);
            const year = date.getFullYear().toString();

            if (year !== selectedYear) return false;

            if (activeView === "monthly") {
                const month = date.toLocaleString('default', { month: 'long' }).toLowerCase();
                return month === selectedMonth;
            } else if (activeView === "semester") {
                const monthIdx = date.getMonth(); // 0-11
                // Odd: July(6) - Dec(11), Even: Jan(0) - June(5)
                if (selectedSemester === "odd") return monthIdx >= 6;
                return monthIdx <= 5;
            }
            return true; // Yearly
        });
    };

    // Calculate Stats
    const calculateStats = (filteredData) => {
        const stats = {
            publications: 0,
            patents: 0,
            awards: 0,
            fdps: 0,
            fdpsAttended: 0,
            fdpsOrganised: 0,
            workshops: 0,
            projects: 0,
            total: filteredData.length
        };

        filteredData.forEach(ach => {
            const cat = ach.category?.toLowerCase() || '';
            const sub = ach.subCategory?.toLowerCase() || '';

            if (cat.includes("publication")) stats.publications++;
            else if (cat.includes("patent")) stats.patents++;
            else if (cat.includes("award")) stats.awards++;
            else if (cat.includes("fdp")) {
                stats.fdps++;
                if (sub.includes("organised")) stats.fdpsOrganised++;
                else stats.fdpsAttended++;
            }
            else if (cat.includes("workshop")) stats.workshops++;
            else if (cat.includes("project")) stats.projects++;
        });

        return stats;
    };

    const filteredAchievements = getFilteredAchievements();
    const currentStats = calculateStats(filteredAchievements);

    const getCards = (stats) => [
        { title: "Total Achievements", value: stats.total, icon: Trophy },
        { title: "Publications", value: stats.publications, icon: BookOpen },
        { title: "Patents", value: stats.patents, icon: FileText },
        { title: "Awards", value: stats.awards, icon: Award },
        { title: "FDPs/STTPs", value: stats.fdps, icon: Users },
        { title: "Projects", value: stats.projects, icon: Briefcase },
    ];

    const cards = getCards(currentStats);

    const handleExportPDF = () => {
        if (!selectedUser) return;
        const user = users.find(u => u._id === selectedUser);

        let period;
        if (activeView === "monthly") {
            period = `${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)} ${selectedYear}`;
        } else if (activeView === "semester") {
            period = `${selectedSemester.charAt(0).toUpperCase() + selectedSemester.slice(1)} Semester ${selectedYear}`;
        } else {
            period = `Annual Report ${selectedYear}`;
        }

        const reportData = getFilteredAchievements();
        const stats = calculateStats(reportData);

        generateReportPDF(reportData, {
            title: "FACULTY ACHIEVEMENT REPORT",
            period,
            userInfo: {
                name: user?.name || 'Unknown',
                department: user?.department?.name || user?.department?.code || 'Unknown'
            },
            stats
        });
    };

    const monthOptions = [
        "january", "february", "march", "april", "may", "june",
        "july", "august", "september", "october", "november", "december",
    ];

    // Create dynamic year options
    const availableYears = [...new Set([
        new Date().getFullYear().toString(),
        ...achievements.map(a => new Date(a.achievementDate).getFullYear().toString())
    ])].sort((a, b) => b - a);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Faculty Reports</h2>
                    <p className="text-muted-foreground">Generate and view reports for any faculty member.</p>
                </div>

                {/* User Selection */}
                <div className="flex items-center gap-4 bg-card p-4 rounded-lg border">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 max-w-sm">
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Faculty / HOD" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(u => (
                                    <SelectItem key={u._id} value={u._id}>
                                        {u.name} ({u.role}) - {u.department?.code || 'N/A'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedUser && (
                        <div className="text-sm text-muted-foreground ml-auto">
                            Found {achievements.length} total records
                        </div>
                    )}
                </div>
            </div>

            {selectedUser ? (
                <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                        <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
                        <TabsTrigger value="semester">Semester Report</TabsTrigger>
                        <TabsTrigger value="yearly">Yearly Report</TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        <Card className="border-2 shadow-sm">
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <CardTitle className="text-2xl flex items-center gap-2">
                                        <TrendingUp className="h-6 w-6 text-primary" />
                                        {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Performance Report
                                    </CardTitle>

                                    <div className="flex gap-2 flex-wrap">
                                        {activeView === 'monthly' && (
                                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                                <SelectTrigger className="w-[140px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {monthOptions.map((month) => (
                                                        <SelectItem key={month} value={month}>
                                                            {month.charAt(0).toUpperCase() + month.slice(1)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}

                                        {activeView === 'semester' && (
                                            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="odd">Odd Semester (Jul-Dec)</SelectItem>
                                                    <SelectItem value="even">Even Semester (Jan-Jun)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}

                                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                                            <SelectTrigger className="w-[100px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableYears.map(year => (
                                                    <SelectItem key={year} value={year}>{year}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Button size="sm" className="gap-2" onClick={handleExportPDF}>
                                            <Download className="h-4 w-4" />
                                            Export PDF
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="text-center py-10">Loading stats...</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {cards.map((stat) => (
                                            <div key={stat.title} className="relative group">
                                                <StatCard {...stat} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </Tabs>
            ) : (
                <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
                    <Search className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Select a user to view reports</h3>
                    <p className="text-muted-foreground">Choose a faculty member or HOD from the dropdown above.</p>
                </div>
            )}
        </div>
    );
}

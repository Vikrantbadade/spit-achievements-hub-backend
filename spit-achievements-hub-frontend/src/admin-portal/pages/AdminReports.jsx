import { useState, useEffect } from "react";
import api from '../../lib/api'; // Use the admin portal axios instance
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
import { generateReportPDF, generateBulkReportPDF } from "@/utils/pdfGenerator";
import { Building2 } from "lucide-react";

export default function AdminReports() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeView, setActiveView] = useState("monthly"); // monthly, semester, yearly
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState("january");
    const [selectedSemester, setSelectedSemester] = useState("odd");
    const [achievements, setAchievements] = useState([]);

    // Bulk Export State
    const [departments, setDepartments] = useState([]);
    const [selectedBulkDept, setSelectedBulkDept] = useState("");
    const [bulkLoading, setBulkLoading] = useState(false);

    // Fetch Users & Departments on Mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch Users
                const { data: userData } = await api.get("/admin/users");
                const facultyUsers = userData.filter(u => u.role === "Faculty" || u.role === "HOD");
                setUsers(facultyUsers);

                // Fetch Departments
                const { data: deptData } = await api.get("/departments");
                setDepartments(deptData);
            } catch (error) {
                console.error("Failed to fetch initial data", error);
            }
        };
        fetchInitialData();
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

    const handleBulkExport = async () => {
        if (!selectedBulkDept) return;
        setBulkLoading(true);
        try {
            // 1. Fetch all faculty in this department
            // We already have 'users' state which contains all faculty/HODs
            const deptFaculty = users.filter(u => u.department?._id === selectedBulkDept || u.department === selectedBulkDept);

            // 2. Fetch all achievements for this department 
            const { data: deptAchievements } = await api.get(`/admin/achievements?department=${selectedBulkDept}`);

            console.log(`Generating report for ${deptFaculty.length} faculty and ${deptAchievements.length} achievements`);

            // 3. Prepare Report Data
            const reports = deptFaculty.map(faculty => {
                // Filter achievements for this faculty
                // Note: The populated faculty object might be slightly different structure, check _id
                const facultyAchievements = deptAchievements.filter(a => {
                    const fId = a.faculty?._id || a.faculty;
                    return fId === faculty._id;
                });

                const stats = calculateStats(facultyAchievements);

                return {
                    reportData: facultyAchievements,
                    reportConfig: {
                        title: "FACULTY ACHIEVEMENT REPORT",
                        period: `Generated on ${new Date().toLocaleDateString()}`,
                        userInfo: {
                            name: faculty.name,
                            department: faculty.department?.name || faculty.department?.code || 'Unknown'
                        },
                        stats
                    }
                };
            });

            // 4. Generate Bulk PDF
            const deptName = departments.find(d => d._id === selectedBulkDept)?.name || "Department";
            await generateBulkReportPDF(reports, `${deptName}_Full_Report_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error("Bulk export failed", error);
        } finally {
            setBulkLoading(false);
        }
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

            {selectedUser || activeView === 'bulk' ? (
                <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
                    <TabsList className="grid w-full max-w-2xl grid-cols-4">
                        <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
                        <TabsTrigger value="semester">Semester Report</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
                        <TabsTrigger value="semester">Semester Report</TabsTrigger>
                        <TabsTrigger value="yearly">Yearly Report</TabsTrigger>
                        <TabsTrigger value="bulk" className="gap-2">
                            <Building2 className="h-4 w-4" />
                            Department Bulk Report
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bulk" className="mt-6">
                        <Card className="border-2 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Building2 className="h-6 w-6 text-primary" />
                                    Department Bulk Report
                                </CardTitle>
                                <p className="text-muted-foreground">
                                    Generate a single PDF containing detailed reports for ALL faculty members in a department.
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="max-w-md space-y-2">
                                    <label className="text-sm font-medium">Select Department</label>
                                    <Select value={selectedBulkDept} onValueChange={setSelectedBulkDept}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map(dept => (
                                                <SelectItem key={dept._id} value={dept._id}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="p-4 bg-muted rounded-lg border">
                                    <h4 className="font-semibold mb-2">Report Summary</h4>
                                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                                        <li>Includes all faculty members in the selected department.</li>
                                        <li>Each faculty report starts on a new page.</li>
                                        <li>Contains full achievement details (Publications, FDPs, etc.).</li>
                                        <li>Currently generates a comprehensive report of ALL time achievements.</li>
                                    </ul>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto gap-2"
                                    onClick={handleBulkExport}
                                    disabled={!selectedBulkDept || bulkLoading}
                                >
                                    {bulkLoading ? (
                                        <>
                                            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                            Generating Bulk PDF...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-5 w-5" />
                                            Download Complete Department Report
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

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

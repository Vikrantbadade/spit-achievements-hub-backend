import { useMemo, useState, useEffect } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
  User,
  BarChart3,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const monthOptions = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const FacultyReports = () => {
  const [selectedMonth, setSelectedMonth] = useState("december");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString()); // Default to current year
  const [selectedSemester, setSelectedSemester] = useState("odd");
  const [activeView, setActiveView] = useState("monthly");
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const { data } = await api.get('/faculty/achievements');
        setAchievements(data);
      } catch (error) {
        console.error("Failed to fetch achievements", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  // Dynamic Year Options
  const availableYears = useMemo(() => {
    const years = [...new Set([
      new Date().getFullYear().toString(),
      ...achievements.map(a => new Date(a.achievementDate).getFullYear().toString())
    ])];
    return years.sort((a, b) => b - a);
  }, [achievements]);

  // Filter Logic
  const getFilteredData = (view, year, month, semester) => {
    return achievements.filter(ach => {
      const date = new Date(ach.achievementDate);
      const achYear = date.getFullYear().toString();
      if (achYear !== year) return false;

      if (view === "monthly") {
        const achMonth = date.toLocaleString('default', { month: 'long' }).toLowerCase();
        return achMonth === month;
      } else if (view === "semester") {
        const monthIdx = date.getMonth();
        // Odd: Jul(6)-Dec(11), Even: Jan(0)-Jun(5)
        if (semester === "odd") return monthIdx >= 6;
        return monthIdx <= 5;
      }
      return true; // yearly
    });
  };

  // Stats Calculation
  const calculateStats = (data) => {
    const stats = {
      publications: 0, patents: 0, awards: 0, fdps: 0, projects: 0, total: data.length
    };
    data.forEach(ach => {
      const cat = ach.category?.toLowerCase() || '';
      if (cat.includes("publication")) stats.publications++;
      else if (cat.includes("patent")) stats.patents++;
      else if (cat.includes("award")) stats.awards++;
      else if (cat.includes("fdp") || cat.includes("workshop") || cat.includes("sttp")) stats.fdps++;
      else if (cat.includes("project")) stats.projects++;
    });
    return stats;
  };

  const monthlyData = getFilteredData('monthly', selectedYear, selectedMonth, selectedSemester);
  const semesterData = getFilteredData('semester', selectedYear, selectedMonth, selectedSemester);
  const yearlyData = getFilteredData('yearly', selectedYear, selectedMonth, selectedSemester);

  const monthlyStats = calculateStats(monthlyData);
  const semesterStats = calculateStats(semesterData);
  const yearlyStats = calculateStats(yearlyData);

  // Chart Data Preparation
  const categoryComparisonData = useMemo(() => {
    const categories = [
      { key: 'publications', label: 'Publications', color: "hsl(217, 91%, 60%)" },
      { key: 'patents', label: 'Patents', color: "hsl(142, 76%, 36%)" },
      { key: 'awards', label: 'Awards', color: "hsl(24, 95%, 53%)" },
      { key: 'fdps', label: 'FDPs', color: "hsl(262, 83%, 58%)" },
      { key: 'projects', label: 'Projects', color: "hsl(346, 77%, 49%)" }
    ];
    return categories.map(cat => ({
      category: cat.label,
      monthly: monthlyStats[cat.key],
      semester: semesterStats[cat.key],
      year: yearlyStats[cat.key],
      color: cat.color
    }));
  }, [monthlyStats, semesterStats, yearlyStats]);

  const chartConfig = {
    publications: { label: "Publications", color: "hsl(217, 91%, 60%)" },
    patents: { label: "Patents", color: "hsl(142, 76%, 36%)" },
    awards: { label: "Awards", color: "hsl(24, 95%, 53%)" },
    fdps: { label: "FDPs", color: "hsl(262, 83%, 58%)" },
    projects: { label: "Projects", color: "hsl(346, 77%, 49%)" },
  };

  const getCards = (stats) => [
    { title: "Total Achievements", value: stats.total, icon: Trophy },
    { title: "Publications", value: stats.publications, icon: BookOpen },
    { title: "Patents", value: stats.patents, icon: FileText },
    { title: "Awards", value: stats.awards, icon: Award },
    { title: "FDPs", value: stats.fdps, icon: Users },
    { title: "Projects", value: stats.projects, icon: Briefcase },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const isMonthly = activeView === "monthly";
    const isSemester = activeView === "semester";

    let stats, period;
    if (isMonthly) {
      stats = monthlyStats;
      period = `${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)} ${selectedYear}`;
    } else if (isSemester) {
      stats = semesterStats;
      period = `${selectedSemester.charAt(0).toUpperCase() + selectedSemester.slice(1)} Semester ${selectedYear}`;
    } else {
      stats = yearlyStats;
      period = `Annual Report ${selectedYear}`;
    }

    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("DEPARTMENTAL FACULTY ACHIEVEMENT REPORT", 20, 20);
    doc.setFontSize(12);
    doc.text(`(Period: ${period})`, 20, 28);

    // 1. General Information
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("1. General Information", 20, 40);

    // User info from local storage or context if available
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

    doc.setFont("helvetica", "normal");
    const infoStartY = 50;
    const lineHeight = 7;

    doc.text(`• Name of Institution: SPIT`, 25, infoStartY);
    doc.text(`• Name of Department: ${userInfo.department?.name || 'Computer Engineering'}`, 25, infoStartY + lineHeight);
    doc.text(`• Academic Year: ${selectedYear}`, 25, infoStartY + lineHeight * 2);
    doc.text(`• Name of Faculty: ${userInfo.name || 'Faculty Member'}`, 25, infoStartY + lineHeight * 3);

    // 2. Summary
    doc.setFont("helvetica", "bold");
    doc.text("2. Summary of Achievements (At a Glance)", 20, infoStartY + lineHeight * 5);

    const tableData = [
      ["1", "Research Publications", stats.publications],
      ["2", "Books / Book Chapters", "0"],
      ["3", "Conferences / Seminars Attended", "0"],
      ["4", "FDP / Workshops", stats.fdps],
      ["5", "Awards / Recognitions", stats.awards],
      ["6", "Research Projects / Grants", stats.projects],
      ["7", "Patents (Published/Granted)", stats.patents],
      ["8", "Consultancy / MoUs", "0"],
      ["9", "Resource Person / Invited Talks", "0"],
    ];

    autoTable(doc, {
      startY: infoStartY + lineHeight * 6,
      head: [["Sl. No.", "Achievement Category", "Number"]],
      body: tableData,
      theme: 'plain',
      headStyles: { fontStyle: 'bold' },
      styles: { cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 100 },
        2: { cellWidth: 30 }
      }
    });

    const filenameMap = {
      monthly: `My_Report_${selectedMonth}_${selectedYear}.pdf`,
      semester: `My_Report_${selectedSemester}_${selectedYear}.pdf`,
      yearly: `My_Report_Annual_${selectedYear}.pdf`
    };

    doc.save(filenameMap[activeView]);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const getCategoryIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes("publication")) return <BookOpen className="h-4 w-4" />;
    if (cat.includes("patent")) return <FileText className="h-4 w-4" />;
    if (cat.includes("award")) return <Award className="h-4 w-4" />;
    if (cat.includes("fdp")) return <Users className="h-4 w-4" />;
    return <Trophy className="h-4 w-4" />;
  };

  const getCategoryColor = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes("publication")) return "text-blue-500 bg-blue-50 dark:bg-blue-950";
    if (cat.includes("patent")) return "text-green-500 bg-green-50 dark:bg-green-950";
    if (cat.includes("award")) return "text-orange-500 bg-orange-50 dark:bg-orange-950";
    if (cat.includes("fdp")) return "text-purple-500 bg-purple-50 dark:bg-purple-950";
    return "text-gray-500 bg-gray-50 dark:bg-gray-950";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            My Achievement Reports
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Track and analyze your personal academic achievements
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1.5">
            <User className="h-3 w-3 mr-1.5" />
            Faculty Member
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5">
            <BarChart3 className="h-3 w-3 mr-1.5" />
            {selectedYear}
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">Loading Reports...</div>
      ) : (
        <>
          {/* Tabs */}
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
              <TabsTrigger value="semester">Semester Report</TabsTrigger>
              <TabsTrigger value="yearly">Yearly Report</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        {activeView.charAt(0).toUpperCase() + activeView.slice(1)} Performance Report
                      </CardTitle>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {activeView === 'monthly' && (
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {monthOptions.map((m) => (
                              <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {activeView === 'semester' && (
                        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="odd">Odd Semester (Jul-Dec)</SelectItem>
                            <SelectItem value="even">Even Semester (Jan-Jun)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      <Button variant="default" size="sm" className="gap-2" onClick={handleExportPDF}>
                        <Download className="h-4 w-4" />
                        Export PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getCards(activeView === 'monthly' ? monthlyStats : activeView === 'semester' ? semesterStats : yearlyStats).map((stat) => (
                      <div key={stat.title} className="relative group">
                        <StatCard {...stat} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Tabs>

          {/* Analytics */}
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-2xl flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Performance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] w-full">
                <ChartContainer config={chartConfig} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="monthly" fill="hsl(217, 91%, 60%)" name="Monthly" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="semester" fill="hsl(142, 76%, 36%)" name="Semester" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {achievements.slice(0, 5).map((achievement) => (
                  <div key={achievement._id} className="p-6 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${getCategoryColor(achievement.category)}`}>
                        {getCategoryIcon(achievement.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {new Date(achievement.achievementDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary">Saved</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {achievements.length === 0 && <div className="p-6 text-center text-muted-foreground">No achievements found.</div>}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FacultyReports;

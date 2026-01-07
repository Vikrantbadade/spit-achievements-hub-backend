import { useMemo, useState } from "react";
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
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedSemester, setSelectedSemester] = useState("odd");
  const [activeView, setActiveView] = useState("monthly");

  // Sample data - Replace with your actual data
  const monthlyStats = {
    publications: 2,
    patents: 1,
    awards: 1,
    fdps: 2,
    projects: 1,
    total: 7,
  };

  const semesterStats = {
    publications: 6,
    patents: 2,
    awards: 3,
    fdps: 5,
    projects: 4,
    total: 20,
  };

  const yearlyStats = {
    publications: 15,
    patents: 4,
    awards: 5,
    fdps: 8,
    projects: 6,
    total: 38,
  };

  // Monthly trend data
  const monthlyTrendData = useMemo(() => {
    return monthOptions.map((month, idx) => ({
      month: month.slice(0, 3).toUpperCase(),
      publications: Math.floor(Math.random() * 5),
      patents: Math.floor(Math.random() * 3),
      awards: Math.floor(Math.random() * 2),
      fdps: Math.floor(Math.random() * 4),
      projects: Math.floor(Math.random() * 3),
    }));
  }, [selectedYear]);

  // Category comparison data
  const categoryComparisonData = [
    { category: "Publications", monthly: 2, semester: 6, year: 15, color: "hsl(217, 91%, 60%)" },
    { category: "Patents", monthly: 1, semester: 2, year: 4, color: "hsl(142, 76%, 36%)" },
    { category: "Awards", monthly: 1, semester: 3, year: 5, color: "hsl(24, 95%, 53%)" },
    { category: "FDPs", monthly: 2, semester: 5, year: 8, color: "hsl(262, 83%, 58%)" },
    { category: "Projects", monthly: 1, semester: 4, year: 6, color: "hsl(346, 77%, 49%)" },
  ];

  const chartConfig = {
    publications: { label: "Publications", color: "hsl(217, 91%, 60%)" },
    patents: { label: "Patents", color: "hsl(142, 76%, 36%)" },
    awards: { label: "Awards", color: "hsl(24, 95%, 53%)" },
    fdps: { label: "FDPs", color: "hsl(262, 83%, 58%)" },
    projects: { label: "Projects", color: "hsl(346, 77%, 49%)" },
  };

  const monthCards = [
    { title: "Total Achievements", value: monthlyStats.total, icon: Trophy },
    { title: "Publications", value: monthlyStats.publications, icon: BookOpen },
    { title: "Patents", value: monthlyStats.patents, icon: FileText },
    { title: "Awards", value: monthlyStats.awards, icon: Award },
    { title: "FDPs", value: monthlyStats.fdps, icon: Users },
    { title: "Projects", value: monthlyStats.projects, icon: Briefcase },
  ];

  const semesterCards = [
    { title: "Total Achievements", value: semesterStats.total, icon: Trophy },
    { title: "Publications", value: semesterStats.publications, icon: BookOpen },
    { title: "Patents", value: semesterStats.patents, icon: FileText },
    { title: "Awards", value: semesterStats.awards, icon: Award },
    { title: "FDPs", value: semesterStats.fdps, icon: Users },
    { title: "Projects", value: semesterStats.projects, icon: Briefcase },
  ];

  const yearlyCards = [
    { title: "Total Achievements", value: yearlyStats.total, icon: Trophy },
    { title: "Publications", value: yearlyStats.publications, icon: BookOpen },
    { title: "Patents", value: yearlyStats.patents, icon: FileText },
    { title: "Awards", value: yearlyStats.awards, icon: Award },
    { title: "FDPs", value: yearlyStats.fdps, icon: Users },
    { title: "Projects", value: yearlyStats.projects, icon: Briefcase },
  ];

  // Recent achievements
  const recentAchievements = [
    {
      id: 1,
      title: "Published research paper in IEEE Conference",
      category: "publication",
      date: "2025-12-15",
      status: "Verified",
    },
    {
      id: 2,
      title: "Patent filed for AI-based diagnostic system",
      category: "patent",
      date: "2025-12-10",
      status: "Pending",
    },
    {
      id: 3,
      title: "Best Faculty Award at Annual Conference",
      category: "award",
      date: "2025-12-05",
      status: "Verified",
    },
    {
      id: 4,
      title: "Completed FDP on Machine Learning",
      category: "fdp",
      date: "2025-11-28",
      status: "Verified",
    },
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

    doc.setFont("helvetica", "normal");
    const infoStartY = 50;
    const lineHeight = 7;

    doc.text(`• Name of Institution: SPIT`, 25, infoStartY);
    doc.text(`• Name of Department: Computer Engineering`, 25, infoStartY + lineHeight);
    doc.text(`• Academic Year: ${selectedYear}`, 25, infoStartY + lineHeight * 2);
    doc.text(`• Name of Faculty: Mayur Solankar`, 25, infoStartY + lineHeight * 3);

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
      monthly: `Achievement_Report_${selectedMonth}_${selectedYear}.pdf`,
      semester: `Achievement_Report_${selectedSemester}_${selectedYear}.pdf`,
      yearly: `Achievement_Report_Annual_${selectedYear}.pdf`
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
    switch (category) {
      case "publication": return <BookOpen className="h-4 w-4" />;
      case "patent": return <FileText className="h-4 w-4" />;
      case "award": return <Award className="h-4 w-4" />;
      case "fdp": return <Users className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "publication": return "text-blue-500 bg-blue-50 dark:bg-blue-950";
      case "patent": return "text-green-500 bg-green-50 dark:bg-green-950";
      case "award": return "text-orange-500 bg-orange-50 dark:bg-orange-950";
      case "fdp": return "text-purple-500 bg-purple-50 dark:bg-purple-950";
      default: return "text-gray-500 bg-gray-50 dark:bg-gray-950";
    }
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

      {/* Tabs for Monthly/Semester View */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="semester">Semester Report</TabsTrigger>
          <TabsTrigger value="yearly">Yearly Report</TabsTrigger>
        </TabsList>

        {/* Monthly Report Tab */}
        <TabsContent value="monthly" className="space-y-6 mt-6">
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Monthly Performance Report
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your achievements for the selected month
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
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
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
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
                {monthCards.map((stat) => (
                  <div key={stat.title} className="relative group">
                    <StatCard {...stat} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Semester Report Tab */}
        <TabsContent value="semester" className="space-y-6 mt-6">
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Semester Performance Report
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive overview of your semester achievements
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="odd">Odd Semester (Jul-Dec)</SelectItem>
                      <SelectItem value="even">Even Semester (Jan-Jun)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="default" size="sm" className="gap-2" onClick={handleExportPDF}>
                    <Download className="h-4 w-4" />
                    Export Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {semesterCards.map((stat) => (
                  <div key={stat.title} className="relative group">
                    <StatCard {...stat} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yearly Report Tab */}
        <TabsContent value="yearly" className="space-y-6 mt-6">
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Annual Performance Report
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Summary of your achievements for the entire year
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
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
                {yearlyCards.map((stat) => (
                  <div key={stat.title} className="relative group">
                    <StatCard {...stat} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analytics & Visualizations */}
      <Card className="border-2 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                Performance Analytics
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Visual breakdown of your achievements over time
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


            {/* Category Comparison Chart */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Monthly vs Semester Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="w-full h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryComparisonData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="category"
                        tick={{ fontSize: 11 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        iconType="circle"
                        formatter={(value) => <span className="text-xs capitalize">{value}</span>}
                      />
                      <Bar
                        dataKey="monthly"
                        fill="hsl(217, 91%, 60%)"
                        radius={[4, 4, 0, 0]}
                        name="Monthly"
                      />
                      <Bar
                        dataKey="semester"
                        fill="hsl(142, 76%, 36%)"
                        radius={[4, 4, 0, 0]}
                        name="Semester"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Recent Achievements
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Your latest academic contributions and accomplishments
              </p>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="p-6 hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getCategoryColor(achievement.category)}`}>
                    {getCategoryIcon(achievement.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {achievement.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(achievement.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <Badge
                        variant={achievement.status === "Verified" ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {achievement.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyReports;

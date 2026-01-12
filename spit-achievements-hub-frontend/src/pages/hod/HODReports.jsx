import { useMemo, useState, useEffect } from "react";
import api from "@/lib/api";
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
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import {
  Download,
  BookOpen,
  FileText,
  Trophy,
  Users,
  TrendingUp,
  Building2,
  BarChart3,
  Award
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { generateReportPDF } from "@/utils/pdfGenerator";
import { getYearRange } from "@/utils/dateUtils";

const HODReports = () => {
  const [selectedMonth, setSelectedMonth] = useState("december");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedSemester, setSelectedSemester] = useState("odd");
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [facultyCount, setFacultyCount] = useState(0); // Need separate fetch or estimate
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [achievementsRes, statsRes] = await Promise.all([
          api.get('/hod/achievements'),
          api.get('/hod/stats') // To get totalFaculty
        ]);
        setAchievements(achievementsRes.data);
        setFacultyCount(statsRes.data.totalFaculty || 0);
      } catch (error) {
        console.error("Failed to fetch HOD reports data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const availableYears = getYearRange();

  // Filter Logic
  const getFilteredData = (view) => {
    return achievements.filter(ach => {
      const date = new Date(ach.achievementDate);
      const achYear = date.getFullYear().toString();

      if (achYear !== selectedYear) return false;

      if (view === "monthly") {
        const achMonth = date.toLocaleString('default', { month: 'long' }).toLowerCase();
        return achMonth === selectedMonth;
      } else if (view === "semester") {
        const monthIdx = date.getMonth();
        // Odd: Jul(6)-Dec(11), Even: Jan(0)-Jun(5)
        if (selectedSemester === "odd") return monthIdx >= 6;
        return monthIdx <= 5;
      }
      return true; // yearly (or just year matched)
    });
  };

  const monthlyData = getFilteredData('monthly');
  const semesterData = getFilteredData('semester');

  const getStatsObject = (data) => {
    const stats = { publications: 0, patents: 0, awards: 0, fdps: 0, fdpsAttended: 0, fdpsOrganised: 0, workshops: 0, projects: 0 };
    data.forEach(ach => {
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

  const handleExportPDF = (type) => {
    let reportData, period;
    if (type === 'monthly') {
      reportData = monthlyData;
      period = `${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)} ${selectedYear}`;
    } else {
      reportData = semesterData;
      period = `${selectedSemester.charAt(0).toUpperCase() + selectedSemester.slice(1)} Semester ${selectedYear}`;
    }

    const stats = getStatsObject(reportData);

    generateReportPDF(reportData, {
      title: "DEPARTMENT ACHIEVEMENT REPORT",
      period,
      userInfo: {
        name: "Head of Department",
        department: user?.department?.name || user?.department || "Department"
      },
      stats
    });
  };

  // Stats Calculation
  const calculateStats = (data, totalFaculty) => {
    const stats = { publications: 0, patents: 0, awards: 0, fdps: 0, fdpsAttended: 0, fdpsOrganised: 0, workshops: 0, projects: 0 };
    data.forEach(ach => {
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
    return [
      { title: "Faculty Active", value: totalFaculty, icon: Users },
      { title: "Publications", value: stats.publications, icon: BookOpen },
      { title: "Patents", value: stats.patents, icon: FileText },
      { title: "Awards", value: stats.awards, icon: Trophy },
      { title: "FDPs", value: stats.fdps, icon: Users },
      { title: "Projects", value: stats.projects, icon: Building2 }, // Building2/Briefcase
    ];
  };

  const monthlyStats = calculateStats(monthlyData, facultyCount);
  const semesterStats = calculateStats(semesterData, facultyCount);

  // Top performing faculty data (Semester based usually? Or Year? Let's use Year for charts)
  const yearlyData = getFilteredData('yearly');

  const topFacultyData = useMemo(() => {
    const counts = {};
    yearlyData.forEach(ach => {
      const name = ach.faculty?.name || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, achievements: count }))
      .sort((a, b) => b.achievements - a.achievements)
      .slice(0, 5);
  }, [yearlyData]);

  // Achievement distribution data
  const achievementDistribution = useMemo(() => {
    const stats = { publications: 0, patents: 0, awards: 0, fdps: 0 };
    yearlyData.forEach(ach => {
      const cat = ach.category?.toLowerCase() || '';
      if (cat.includes("publication")) stats.publications++;
      else if (cat.includes("patent")) stats.patents++;
      else if (cat.includes("award")) stats.awards++;
      else if (cat.includes("fdp")) stats.fdps++;
    });
    return [
      { name: "Publications", value: stats.publications, color: "hsl(217, 91%, 60%)" },
      { name: "Patents", value: stats.patents, color: "hsl(142, 76%, 36%)" },
      { name: "Awards", value: stats.awards, color: "hsl(24, 95%, 53%)" },
      { name: "FDPs", value: stats.fdps, color: "hsl(262, 83%, 58%)" },
    ].filter(d => d.value > 0);
  }, [yearlyData]);

  const chartConfig = {
    achievements: { label: "Achievements", color: "hsl(217, 91%, 60%)" },
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-1">{label}</p>
          <div className="flex items-center gap-2 text-xs">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: payload[0].color || payload[0].payload.fill }}
            />
            <span className="text-muted-foreground">
              {payload[0].name}:
            </span>
            <span className="font-medium">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="text-center py-20">Loading Reports...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Department Reports
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {user?.department?.name || user?.department} - Performance Analytics
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1.5">
          <BarChart3 className="h-3 w-3 mr-1.5" />
          Academic Year {selectedYear}
        </Badge>
      </div>


      {/* Monthly Report */}
      <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Monthly Department Report
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Performance metrics for the selected month
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
                    .map(m => <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="default" size="sm" className="gap-2" onClick={() => handleExportPDF('monthly')}>
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthlyStats.map((stat, index) => (
              <div
                key={stat.title}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StatCard {...stat} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


      {/* Semester Report */}
      <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Semester Department Report
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive semester-wide performance overview
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
                  {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="default" size="sm" className="gap-2" onClick={() => handleExportPDF('semester')}>
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {semesterStats.map((stat, index) => (
              <div
                key={stat.title}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StatCard {...stat} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>


      {/* Performance Analytics (Yearly) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Faculty */}
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Top Performing Faculty ({selectedYear})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Faculty members with highest achievements this year
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig} className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topFacultyData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    width={80}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="achievements"
                    fill="hsl(217, 91%, 60%)"
                    radius={[0, 4, 4, 0]}
                    name="Achievements"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>


        {/* Achievement Distribution */}
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Achievement Distribution ({selectedYear})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Category-wise breakdown of achievements
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig} className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                {achievementDistribution.length > 0 ? (
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={achievementDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {achievementDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-xs">{value}</span>}
                    />
                  </PieChart>
                ) : <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>}
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


export default HODReports;

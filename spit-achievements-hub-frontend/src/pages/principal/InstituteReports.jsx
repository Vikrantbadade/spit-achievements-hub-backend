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
  Building2,
  Users,
  BookOpen,
  FileText,
  Trophy,
  Award,
  Briefcase,
  TrendingUp,
  Calendar,
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
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { achievements, departments } from "../../data/instituteData";

const monthOptions = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const buildStats = (items) => {
  const base = {
    publications: 0,
    patents: 0,
    awards: 0,
    fdps: 0,
    projects: 0,
    total: 0,
    activeDepartments: new Set(),
  };

  for (const item of items) {
    base[`${item.category}s`] = (base[`${item.category}s`] || 0) + 1;
    base.total += 1;
    base.activeDepartments.add(item.departmentId);
  }

  return {
    ...base,
    activeDepartments: base.activeDepartments.size,
  };
};

const aggregateDepartments = (items) => {
  const grouped = items.reduce((acc, item) => {
    const { departmentId, department, category } = item;
    if (!acc[departmentId]) {
      acc[departmentId] = {
        name: department,
        publications: 0,
        patents: 0,
        awards: 0,
        fdps: 0,
        projects: 0,
        total: 0,
      };
    }
    acc[departmentId][`${category}s`] =
      (acc[departmentId][`${category}s`] || 0) + 1;
    acc[departmentId].total += 1;
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => b.total - a.total);
};

const InstituteReports = () => {
  const [selectedMonth, setSelectedMonth] = useState("december");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedSemester, setSelectedSemester] = useState("odd");
  const [activeView, setActiveView] = useState("monthly");

  const totalFaculty = useMemo(
    () => departments.reduce((sum, dept) => sum + (dept.faculty || 0), 0),
    []
  );

  const monthIndex = monthOptions.indexOf(selectedMonth);
  const monthlyAchievements = useMemo(
    () =>
      achievements.filter((achievement) => {
        const date = new Date(achievement.date);
        return (
          date.getFullYear() === Number(selectedYear) &&
          date.getMonth() === monthIndex
        );
      }),
    [selectedYear, monthIndex]
  );

  const semesterAchievements = useMemo(() => {
    const isOdd = selectedSemester === "odd";
    return achievements.filter((achievement) => {
      const date = new Date(achievement.date);
      if (date.getFullYear() !== Number(selectedYear)) return false;
      const month = date.getMonth();
      return isOdd ? month >= 6 : month < 6;
    });
  }, [selectedSemester, selectedYear]);

  const monthlyStats = useMemo(
    () => buildStats(monthlyAchievements),
    [monthlyAchievements]
  );
  const semesterStats = useMemo(
    () => buildStats(semesterAchievements),
    [semesterAchievements]
  );
  const departmentComparison = useMemo(
    () => aggregateDepartments(semesterAchievements),
    [semesterAchievements]
  );

  const monthlyTrend = useMemo(() => {
    return monthOptions.map((month, idx) => {
      const monthItems = achievements.filter((a) => {
        const d = new Date(a.date);
        return d.getFullYear() === Number(selectedYear) && d.getMonth() === idx;
      });
      const stats = buildStats(monthItems);
      return {
        month: month.slice(0, 3).toUpperCase(),
        publications: stats.publications,
        patents: stats.patents,
        awards: stats.awards,
        fdps: stats.fdps,
        projects: stats.projects,
        total: stats.total,
      };
    });
  }, [selectedYear]);

  const chartConfig = {
    publications: { label: "Publications", color: "hsl(217, 91%, 60%)" },
    patents: { label: "Patents", color: "hsl(142, 76%, 36%)" },
    awards: { label: "Awards", color: "hsl(24, 95%, 53%)" },
    fdps: { label: "FDPs", color: "hsl(262, 83%, 58%)" },
    projects: { label: "Projects", color: "hsl(346, 77%, 49%)" },
  };

  const categoryDistribution = useMemo(() => {
    const keys = ["publications", "patents", "awards", "fdps", "projects"];
    return keys
      .map((key) => ({
        key,
        name: chartConfig[key].label,
        value: semesterStats[key] || 0,
      }))
      .filter((item) => item.value > 0);
  }, [semesterStats]);

  const departmentStackedData = useMemo(
    () =>
      departmentComparison.map((dept) => ({
        name: dept.name.length > 15 ? dept.name.slice(0, 15) + "..." : dept.name,
        fullName: dept.name,
        publications: dept.publications || 0,
        patents: dept.patents || 0,
        awards: dept.awards || 0,
        fdps: dept.fdps || 0,
        projects: dept.projects || 0,
        total: dept.total || 0,
      })),
    [departmentComparison]
  );

  const monthCards = [
    { title: "Total Achievements", value: monthlyStats.total, icon: Trophy, trend: "+12%" },
    { title: "Publications", value: monthlyStats.publications, icon: BookOpen, trend: "+8%" },
    { title: "Patents", value: monthlyStats.patents, icon: FileText, trend: "+15%" },
    { title: "Awards", value: monthlyStats.awards, icon: Award, trend: "+5%" },
    { title: "FDPs", value: monthlyStats.fdps, icon: Users, trend: "+10%" },
    { title: "Projects", value: monthlyStats.projects, icon: Briefcase, trend: "+7%" },
    {
      title: "Active Departments",
      value: monthlyStats.activeDepartments,
      icon: Building2,
      trend: "—"
    },
  ];

  const semesterCards = [
    { title: "Total Achievements", value: semesterStats.total, icon: Trophy, trend: "+18%" },
    {
      title: "Publications",
      value: semesterStats.publications,
      icon: BookOpen,
      trend: "+14%"
    },
    { title: "Patents", value: semesterStats.patents, icon: FileText, trend: "+22%" },
    { title: "Awards", value: semesterStats.awards, icon: Award, trend: "+9%" },
    { title: "FDPs", value: semesterStats.fdps, icon: Users, trend: "+16%" },
    { title: "Projects", value: semesterStats.projects, icon: Briefcase, trend: "+11%" },
    {
      title: "Active Departments",
      value: semesterStats.activeDepartments,
      icon: Building2,
      trend: "—"
    },
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Institute Reports
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Comprehensive institute-level performance analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1.5">
            <Building2 className="h-3 w-3 mr-1.5" />
            {departments.length} Departments
          </Badge>
          <Badge variant="outline" className="px-3 py-1.5">
            <Users className="h-3 w-3 mr-1.5" />
            {totalFaculty} Faculty
          </Badge>
        </div>
      </div>

      {/* Tabs for Monthly/Semester View */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="semester">Semester Report</TabsTrigger>
        </TabsList>

        {/* Monthly Report Tab */}
        <TabsContent value="monthly" className="space-y-6 mt-6">
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    Monthly Institute Report
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Detailed breakdown of monthly achievements
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
                  <Button variant="default" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {monthCards.map((stat) => (
                  <div key={stat.title} className="relative group">
                    <StatCard {...stat} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {stat.trend !== "—" && (
                        <Badge variant="secondary" className="text-xs">
                          {stat.trend}
                        </Badge>
                      )}
                    </div>
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
                    Semester Institute Report
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Comprehensive semester-wide performance metrics
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select
                    value={selectedSemester}
                    onValueChange={setSelectedSemester}
                  >
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
                  <Button variant="default" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {semesterCards.map((stat) => (
                  <div key={stat.title} className="relative group">
                    <StatCard {...stat} />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {stat.trend !== "—" && (
                        <Badge variant="secondary" className="text-xs">
                          {stat.trend}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Department Comparative Report */}
      <Card className="border-2 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                Department Comparative Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Cross-department performance comparison and insights
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="odd">Odd Semester</SelectItem>
                  <SelectItem value="even">Even Semester</SelectItem>
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
              <Button variant="default" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            {/* Pie Chart */}
            <Card className="col-span-1 border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="w-full h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomTooltip />} />
                      <Pie
                        data={categoryDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {categoryDistribution.map((entry) => (
                          <Cell
                            key={entry.key}
                            fill={chartConfig[entry.key].color}
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
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card className="col-span-1 xl:col-span-2 border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Monthly Achievement Trend ({selectedYear})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="w-full h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrend}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis 
                        allowDecimals={false} 
                        tick={{ fontSize: 12 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        iconType="circle"
                        formatter={(value) => <span className="text-xs">{value}</span>}
                      />
                      <Bar dataKey="publications" stackId="a" fill={chartConfig.publications.color} radius={[0, 0, 0, 0]} />
                      <Bar dataKey="patents" stackId="a" fill={chartConfig.patents.color} radius={[0, 0, 0, 0]} />
                      <Bar dataKey="awards" stackId="a" fill={chartConfig.awards.color} radius={[0, 0, 0, 0]} />
                      <Bar dataKey="fdps" stackId="a" fill={chartConfig.fdps.color} radius={[0, 0, 0, 0]} />
                      <Bar dataKey="projects" stackId="a" fill={chartConfig.projects.color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Department Performance Chart */}
          <Card className="border shadow-sm mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Department Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentStackedData}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="hsl(var(--border))"
                      opacity={0.3}
                    />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      allowDecimals={false} 
                      tick={{ fontSize: 12 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      iconType="circle"
                      formatter={(value) => <span className="text-xs">{value}</span>}
                    />
                    <Bar dataKey="publications" stackId="a" fill={chartConfig.publications.color} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="patents" stackId="a" fill={chartConfig.patents.color} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="awards" stackId="a" fill={chartConfig.awards.color} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="fdps" stackId="a" fill={chartConfig.fdps.color} radius={[0, 0, 0, 0]} />
                    <Bar dataKey="projects" stackId="a" fill={chartConfig.projects.color} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Department Table */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Detailed Department Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr className="border-b border-border">
                      <th className="text-left py-4 px-6 font-semibold text-sm">
                        Department
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-sm">
                        <div className="flex items-center justify-center gap-1.5">
                          <BookOpen className="h-4 w-4" />
                          Publications
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-sm">
                        <div className="flex items-center justify-center gap-1.5">
                          <FileText className="h-4 w-4" />
                          Patents
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-sm">
                        <div className="flex items-center justify-center gap-1.5">
                          <Award className="h-4 w-4" />
                          Awards
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-sm">
                        <div className="flex items-center justify-center gap-1.5">
                          <Users className="h-4 w-4" />
                          FDPs
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-sm">
                        <div className="flex items-center justify-center gap-1.5">
                          <Briefcase className="h-4 w-4" />
                          Projects
                        </div>
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-sm bg-muted">
                        <div className="flex items-center justify-center gap-1.5">
                          <Trophy className="h-4 w-4" />
                          Total
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {departmentComparison.map((dept, index) => (
                      <tr
                        key={dept.name}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-4 px-6 font-medium">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center p-0 text-xs">
                              {index + 1}
                            </Badge>
                            {dept.name}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant="secondary" className="font-mono">
                            {dept.publications || 0}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant="secondary" className="font-mono">
                            {dept.patents || 0}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant="secondary" className="font-mono">
                            {dept.awards || 0}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant="secondary" className="font-mono">
                            {dept.fdps || 0}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge variant="secondary" className="font-mono">
                            {dept.projects || 0}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center bg-muted/20">
                          <Badge className="font-bold font-mono">
                            {dept.total || 0}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {departmentComparison.length === 0 && (
                      <tr>
                        <td
                          className="py-8 px-4 text-center text-muted-foreground"
                          colSpan={7}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Trophy className="h-8 w-8 opacity-20" />
                            <p>No achievements found for the selected semester.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstituteReports;

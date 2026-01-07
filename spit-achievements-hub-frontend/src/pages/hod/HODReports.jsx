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
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import { 
  Download, 
  BookOpen, 
  FileText, 
  Trophy, 
  Award, 
  Users,
  TrendingUp,
  Building2,
  BarChart3
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


const HODReports = () => {
  const [selectedMonth, setSelectedMonth] = useState("december");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedSemester, setSelectedSemester] = useState("odd");
  const { user } = useAuth();


  const monthlyStats = [
    { title: "Faculty Active", value: 25, icon: Users, trend: "+8%" },
    { title: "Publications", value: 8, icon: BookOpen, trend: "+12%" },
    { title: "Patents", value: 2, icon: FileText, trend: "+15%" },
    { title: "Awards", value: 3, icon: Trophy, trend: "+20%" },
  ];


  const semesterStats = [
    { title: "Total Faculty", value: 25, icon: Users, trend: "+4%" },
    { title: "Total Publications", value: 48, icon: BookOpen, trend: "+18%" },
    { title: "Total Patents", value: 12, icon: FileText, trend: "+25%" },
    { title: "Total Awards", value: 18, icon: Trophy, trend: "+22%" },
  ];

  // Top performing faculty data
  const topFacultyData = useMemo(() => [
    { name: "Dr. Sharma", achievements: 12 },
    { name: "Dr. Patel", achievements: 10 },
    { name: "Dr. Kumar", achievements: 9 },
    { name: "Dr. Singh", achievements: 8 },
    { name: "Dr. Verma", achievements: 7 },
  ], []);

  // Achievement distribution data
  const achievementDistribution = useMemo(() => [
    { name: "Publications", value: 48, color: "hsl(217, 91%, 60%)" },
    { name: "Patents", value: 12, color: "hsl(142, 76%, 36%)" },
    { name: "Awards", value: 18, color: "hsl(24, 95%, 53%)" },
    { name: "FDPs", value: 22, color: "hsl(262, 83%, 58%)" },
  ], []);

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
              style={{ backgroundColor: payload[0].color }}
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
            {user?.department} - Performance Analytics
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
                  <SelectItem value="january">January</SelectItem>
                  <SelectItem value="february">February</SelectItem>
                  <SelectItem value="march">March</SelectItem>
                  <SelectItem value="april">April</SelectItem>
                  <SelectItem value="may">May</SelectItem>
                  <SelectItem value="june">June</SelectItem>
                  <SelectItem value="july">July</SelectItem>
                  <SelectItem value="august">August</SelectItem>
                  <SelectItem value="september">September</SelectItem>
                  <SelectItem value="october">October</SelectItem>
                  <SelectItem value="november">November</SelectItem>
                  <SelectItem value="december">December</SelectItem>
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
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {monthlyStats.map((stat, index) => (
              <div 
                key={stat.title} 
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StatCard {...stat} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {stat.trend && (
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
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {semesterStats.map((stat, index) => (
              <div 
                key={stat.title} 
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StatCard {...stat} />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {stat.trend && (
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


      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Faculty */}
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Top Performing Faculty
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Faculty members with highest achievements
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
              Achievement Distribution
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Category-wise breakdown of achievements
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig} className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
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
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


export default HODReports;

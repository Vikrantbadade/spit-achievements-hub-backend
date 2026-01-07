import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";
import { Award, BookOpen, FileText, Trophy } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";


const FacultyHome = () => {
  const { user } = useAuth();


  const stats = [
    { title: "Total Publications", value: 12, icon: BookOpen, trend: 15 },
    { title: "Patents Filed", value: 3, icon: FileText, trend: 50 },
    { title: "Awards Received", value: 5, icon: Trophy, trend: 25 },
    { title: "FDPs Attended", value: 8, icon: Award, trend: 10 },
  ];


  const recentAchievements = [
    {
      id: 1,
      title: "Paper published in IEEE",
      category: "Publication",
      date: "Dec 20, 2025",
    },
    {
      id: 2,
      title: "Best Paper Award at ICICT 2025",
      category: "Award",
      date: "Dec 15, 2025",
    },
    {
      id: 3,
      title: "FDP on Machine Learning",
      category: "FDP",
      date: "Dec 10, 2025",
    },
  ];

  // Monthly progress data for the last 6 months
  const monthlyProgressData = useMemo(() => {
    return [
      { month: "JUL", publications: 2, patents: 0, awards: 1, fdps: 1 },
      { month: "AUG", publications: 1, patents: 1, awards: 0, fdps: 2 },
      { month: "SEP", publications: 3, patents: 0, awards: 1, fdps: 1 },
      { month: "OCT", publications: 2, patents: 1, awards: 1, fdps: 1 },
      { month: "NOV", publications: 2, patents: 0, awards: 1, fdps: 2 },
      { month: "DEC", publications: 2, patents: 1, awards: 1, fdps: 1 },
    ];
  }, []);

  const chartConfig = {
    publications: { label: "Publications", color: "hsl(217, 91%, 60%)" },
    patents: { label: "Patents", color: "hsl(142, 76%, 36%)" },
    awards: { label: "Awards", color: "hsl(24, 95%, 53%)" },
    fdps: { label: "FDPs", color: "hsl(262, 83%, 58%)" },
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


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Welcome back, {user?.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your achievements and progress
        </p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-display font-semibold mb-4">
            Recent Achievements
          </h2>
          <div className="space-y-4">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {achievement.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {achievement.category}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {achievement.date}
                </span>
              </div>
            ))}
          </div>
        </div>


        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-display font-semibold mb-4">
            Monthly Progress
          </h2>
          <div className="h-64">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProgressData}>
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
                    formatter={(value) => <span className="text-xs capitalize">{value}</span>}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  <Bar 
                    dataKey="publications" 
                    stackId="a" 
                    fill={chartConfig.publications.color} 
                    radius={[0, 0, 0, 0]}
                    name="Publications"
                  />
                  <Bar 
                    dataKey="patents" 
                    stackId="a" 
                    fill={chartConfig.patents.color} 
                    radius={[0, 0, 0, 0]}
                    name="Patents"
                  />
                  <Bar 
                    dataKey="awards" 
                    stackId="a" 
                    fill={chartConfig.awards.color} 
                    radius={[0, 0, 0, 0]}
                    name="Awards"
                  />
                  <Bar 
                    dataKey="fdps" 
                    stackId="a" 
                    fill={chartConfig.fdps.color} 
                    radius={[4, 4, 0, 0]}
                    name="FDPs"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
};


export default FacultyHome;

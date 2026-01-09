import { useState, useEffect, useMemo } from "react";
import api from "@/lib/axios";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";
import { Award, BookOpen, FileText, Trophy, Briefcase, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const stats = useMemo(() => {
    const counts = { publications: 0, patents: 0, awards: 0, fdps: 0 };
    achievements.forEach(ach => {
      const cat = ach.category?.toLowerCase() || '';
      if (cat.includes("publication")) counts.publications++;
      else if (cat.includes("patent")) counts.patents++;
      else if (cat.includes("award")) counts.awards++;
      else if (cat.includes("fdp") || cat.includes("workshop") || cat.includes("sttp")) counts.fdps++;
    });
    return [
      { title: "Total Publications", value: counts.publications, icon: BookOpen },
      { title: "Patents Filed", value: counts.patents, icon: FileText },
      { title: "Awards Received", value: counts.awards, icon: Trophy },
      { title: "FDPs Attended", value: counts.fdps, icon: Award },
    ];
  }, [achievements]);

  const recentAchievements = achievements.slice(0, 3);

  // Monthly progress data for the last 6 months
  const monthlyProgressData = useMemo(() => {
    // Get last 6 months
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push(d);
    }

    return last6Months.map(date => {
      const monthName = date.toLocaleString('default', { month: 'short' }).toUpperCase();
      const monthIdx = date.getMonth();
      const year = date.getFullYear();

      // Filter achievements for this month/year
      const montlyAchs = achievements.filter(ach => {
        const achDate = new Date(ach.achievementDate);
        return achDate.getMonth() === monthIdx && achDate.getFullYear() === year;
      });

      const counts = { publications: 0, patents: 0, awards: 0, fdps: 0 };
      montlyAchs.forEach(ach => {
        const cat = ach.category?.toLowerCase() || '';
        if (cat.includes("publication")) counts.publications++;
        else if (cat.includes("patent")) counts.patents++;
        else if (cat.includes("award")) counts.awards++;
        else if (cat.includes("fdp")) counts.fdps++;
      });

      return { month: monthName, ...counts };
    });
  }, [achievements]);

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

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

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
            {recentAchievements.length === 0 ? <p className="text-muted-foreground">No recent achievements.</p> :
              recentAchievements.map((achievement) => (
                <div
                  key={achievement._id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {achievement.title}
                      </p>
                      <Badge variant={
                        achievement.status === 'Approved' ? 'success' :
                          achievement.status === 'Rejected' ? 'destructive' : 'outline'
                      } className={
                        achievement.status === 'Approved' ? "bg-green-100 text-green-800 hover:bg-green-100 text-[10px] px-1 py-0" :
                          achievement.status === 'Rejected' ? "bg-red-100 text-red-800 hover:bg-red-100 text-[10px] px-1 py-0" :
                            "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-[10px] px-1 py-0"
                      }>
                        {achievement.status || 'Pending'}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {achievement.category}
                    </p>
                    {achievement.status === 'Rejected' && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {achievement.rejectionReason}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(achievement.achievementDate).toLocaleDateString()}
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

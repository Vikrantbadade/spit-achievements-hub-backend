import { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";
import { Award, BookOpen, FileText, Trophy, Briefcase, AlertCircle, Settings, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// All available categories for mapping
const ALL_CATEGORIES = [
  { key: "publication", label: "Publications", icon: BookOpen, color: "hsl(217, 91%, 60%)" },
  { key: "patent", label: "Patents", icon: FileText, color: "hsl(142, 76%, 36%)" },
  { key: "award", label: "Awards", icon: Trophy, color: "hsl(24, 95%, 53%)" },
  { key: "fdp", label: "FDPs", icon: Award, color: "hsl(262, 83%, 58%)" },
  { key: "project", label: "Projects", icon: Briefcase, color: "hsl(346, 77%, 49%)" },
  { key: "workshop", label: "Workshops", icon: Users, color: "hsl(180, 70%, 50%)" },
  { key: "seminar", label: "Seminars", icon: Users, color: "hsl(300, 70%, 50%)" },
  { key: "sttp", label: "STTPs", icon: BookOpen, color: "hsl(60, 70%, 50%)" },
  { key: "conference", label: "Conferences", icon: Users, color: "hsl(200, 70%, 50%)" },
  { key: "certification", label: "Certifications", icon: Award, color: "hsl(150, 70%, 50%)" },
];

const FacultyHome = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved preferences or default to first 4
  const [selectedWidgets, setSelectedWidgets] = useState(() => {
    const saved = localStorage.getItem("dashboardWidgets");
    return saved ? JSON.parse(saved) : ["publication", "patent", "award", "fdp"];
  });

  // Persist preferences
  useEffect(() => {
    localStorage.setItem("dashboardWidgets", JSON.stringify(selectedWidgets));
  }, [selectedWidgets]);

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

  const toggleWidget = (key) => {
    setSelectedWidgets(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const stats = useMemo(() => {
    // Initialize counts for all known categories
    const counts = {};
    ALL_CATEGORIES.forEach(cat => counts[cat.key] = 0);

    achievements.forEach(ach => {
      const cat = ach.category?.toLowerCase() || '';
      // Map backend categories to our keys
      if (cat.includes("publication")) counts.publication++;
      else if (cat.includes("patent")) counts.patent++;
      else if (cat.includes("award")) counts.award++;
      else if (cat.includes("fdp")) counts.fdp++;
      else if (cat.includes("project")) counts.project++;
      else if (cat.includes("workshop")) counts.workshop++;
      else if (cat.includes("seminar")) counts.seminar++;
      else if (cat.includes("sttp")) counts.sttp++;
      else if (cat.includes("conference")) counts.conference++;
      else if (cat.includes("certification")) counts.certification++;
    });

    // Return only selected widgets
    return ALL_CATEGORIES
      .filter(cat => selectedWidgets.includes(cat.key))
      .map(cat => ({
        key: cat.key,
        title: cat.label,
        value: counts[cat.key],
        icon: cat.icon
      }));
  }, [achievements, selectedWidgets]);

  const recentAchievements = achievements.slice(0, 3);

  // Monthly progress data for the last 6 months
  const monthlyProgressData = useMemo(() => {
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

      const montlyAchs = achievements.filter(ach => {
        const achDate = new Date(ach.achievementDate);
        return achDate.getMonth() === monthIdx && achDate.getFullYear() === year;
      });

      const counts = {};
      // Initialize only for selected widgets to keep chart clean
      selectedWidgets.forEach(key => counts[key] = 0);

      montlyAchs.forEach(ach => {
        const cat = ach.category?.toLowerCase() || '';
        // Simple mapping for demo (expand if needed for exact matches)
        if (cat.includes("publication") && counts.publication !== undefined) counts.publication++;
        if (cat.includes("patent") && counts.patent !== undefined) counts.patent++;
        if (cat.includes("award") && counts.award !== undefined) counts.award++;
        if (cat.includes("fdp") && counts.fdp !== undefined) counts.fdp++;
        if (cat.includes("project") && counts.project !== undefined) counts.project++;
        if (cat.includes("workshop") && counts.workshop !== undefined) counts.workshop++;
        if (cat.includes("seminar") && counts.seminar !== undefined) counts.seminar++;
        if (cat.includes("sttp") && counts.sttp !== undefined) counts.sttp++;
        // Add others if needed for chart
      });

      return { month: monthName, ...counts };
    });
  }, [achievements, selectedWidgets]);

  const chartConfig = {};
  ALL_CATEGORIES.forEach(cat => {
    chartConfig[cat.key] = { label: cat.label, color: cat.color };
  });

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {user?.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your achievements and progress
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Customize Dashboard
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Select Widgets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALL_CATEGORIES.map((cat) => (
              <DropdownMenuCheckboxItem
                key={cat.key}
                checked={selectedWidgets.includes(cat.key)}
                onCheckedChange={() => toggleWidget(cat.key)}
              >
                {cat.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.key}
            data-testid={`widget-${stat.key}`}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StatCard {...stat} />
          </div>
        ))}
        {stats.length === 0 && (
          <div className="col-span-full p-8 border border-dashed rounded-xl text-center text-muted-foreground">
            No widgets selected. Use the "Customize Dashboard" button to add some.
          </div>
        )}
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
            {selectedWidgets.length > 0 ? (
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
                    {selectedWidgets.map(key => (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        fill={chartConfig[key]?.color}
                        radius={[0, 0, 0, 0]} // Middle bars
                        name={chartConfig[key]?.label}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground p-4 text-center border border-dashed rounded-lg">
                Select categories to view analytics
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyHome;

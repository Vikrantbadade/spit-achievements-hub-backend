import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";
import { Users, BookOpen, FileText, Trophy, Award } from "lucide-react";

const HODHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    publications: 0,
    patents: 0,
    awards: 0,
    totalFaculty: 0,
    fdps: 0 // Added FDPs if needed, though UI uses P, P, A, Faculty
  });
  const [recentDeptAchievements, setRecentDeptAchievements] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, achievementsRes] = await Promise.all([
          api.get('/hod/stats'),
          api.get('/hod/achievements')
        ]);

        setStats(statsRes.data);

        const allAchievements = achievementsRes.data;
        setRecentDeptAchievements(allAchievements.slice(0, 3).map(ach => ({
          id: ach._id,
          faculty: ach.faculty?.name || 'Unknown Faculty',
          title: ach.title,
          category: ach.category,
          date: new Date(ach.achievementDate).toLocaleDateString()
        })));

        // Calculate Top Performers
        const facultyCounts = {};
        allAchievements.forEach(ach => {
          const name = ach.faculty?.name || 'Unknown';
          facultyCounts[name] = (facultyCounts[name] || 0) + 1;
        });

        const sortedPerformers = Object.entries(facultyCounts)
          .map(([name, count]) => ({ name, achievements: count }))
          .sort((a, b) => b.achievements - a.achievements)
          .slice(0, 3);

        setTopPerformers(sortedPerformers);

      } catch (error) {
        console.error("Failed to fetch HOD data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { title: "Total Faculty", value: stats.totalFaculty, icon: Users },
    { title: "Publications", value: stats.publications, icon: BookOpen },
    { title: "Patents", value: stats.patents, icon: FileText },
    { title: "Awards", value: stats.awards, icon: Trophy },
  ];

  if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Department Overview
        </h1>
        <p className="text-muted-foreground mt-2">
          {user?.department?.name || user?.department} - Achievement Statistics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
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
            Top Performers
          </h2>
          <div className="space-y-4">
            {topPerformers.length === 0 ? <p className="text-muted-foreground">No data available.</p> :
              topPerformers.map((performer, index) => (
                <div
                  key={performer.name}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {performer.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {performer.achievements} achievements
                      </p>
                    </div>
                  </div>
                  <Award className="h-5 w-5 text-secondary" />
                </div>
              ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-display font-semibold mb-4">
            Recent Department Achievements
          </h2>
          <div className="space-y-4">
            {recentDeptAchievements.length === 0 ? <p className="text-muted-foreground">No recent achievements.</p> :
              recentDeptAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-start justify-between p-4 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {achievement.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {achievement.faculty} • {achievement.category}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {achievement.date}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODHome;

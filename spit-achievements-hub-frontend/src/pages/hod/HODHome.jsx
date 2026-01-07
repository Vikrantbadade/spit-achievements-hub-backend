import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";
import { Users, BookOpen, FileText, Trophy, Award } from "lucide-react";

const HODHome = () => {
  const { user } = useAuth();

  const stats = [
    { title: "Total Faculty", value: 25, icon: Users },
    { title: "Publications", value: 48, icon: BookOpen, trend: 12 },
    { title: "Patents", value: 12, icon: FileText, trend: 20 },
    { title: "Awards", value: 18, icon: Trophy, trend: 15 },
  ];

  const topPerformers = [
    { name: "Dr. Sharma", achievements: 15, department: user?.department },
    { name: "Prof. Patel", achievements: 12, department: user?.department },
    { name: "Dr. Kumar", achievements: 10, department: user?.department },
  ];

  const recentDeptAchievements = [
    {
      id: 1,
      faculty: "Dr. Sharma",
      title: "Paper published in Nature",
      category: "Publication",
      date: "Dec 22, 2025",
    },
    {
      id: 2,
      faculty: "Prof. Patel",
      title: "Patent for AI System",
      category: "Patent",
      date: "Dec 18, 2025",
    },
    {
      id: 3,
      faculty: "Dr. Kumar",
      title: "Best Teacher Award",
      category: "Award",
      date: "Dec 15, 2025",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Department Overview
        </h1>
        <p className="text-muted-foreground mt-2">
          {user?.department} - Achievement Statistics
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
            Top Performers
          </h2>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
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
            {recentDeptAchievements.map((achievement) => (
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

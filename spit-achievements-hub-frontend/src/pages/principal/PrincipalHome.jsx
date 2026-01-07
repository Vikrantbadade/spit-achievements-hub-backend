import StatCard from "../../components/StatCard";
import { Building2, Users, BookOpen, FileText, Trophy, Award } from "lucide-react";

const PrincipalHome = () => {
  const stats = [
    { title: "Total Departments", value: 3, icon: Building2 },
    { title: "Total Faculty", value: 75, icon: Users },
    { title: "Publications", value: 145, icon: BookOpen, trend: 18 },
    { title: "Patents", value: 38, icon: FileText, trend: 25 },
  ];

  const departmentSummary = [
    {
      name: "Computer Engineering",
      faculty: 25,
      publications: 48,
      patents: 12,
      awards: 18,
    },
    {
      name: "EXTC",
      faculty: 28,
      publications: 52,
      patents: 15,
      awards: 20,
    },
    {
      name: "CSE",
      faculty: 22,
      publications: 45,
      patents: 11,
      awards: 15,
    },
  ];

  const recentHighlights = [
    {
      id: 1,
      department: "Computer Engineering",
      achievement: "Paper published in IEEE Transactions",
      date: "Dec 22, 2025",
    },
    {
      id: 2,
      department: "EXTC",
      achievement: "Patent granted for 5G technology",
      date: "Dec 20, 2025",
    },
    {
      id: 3,
      department: "CSE",
      achievement: "AICTE funded project sanctioned",
      date: "Dec 18, 2025",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Institute Overview
        </h1>
        <p className="text-muted-foreground mt-2">
          Sardar Patel Institute of Technology - Achievement Dashboard
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

      {/* Department Summary */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-display font-semibold mb-6">
          Department-wise Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {departmentSummary.map((dept) => (
            <div
              key={dept.name}
              className="p-6 bg-muted rounded-xl hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-4">{dept.name}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Faculty</span>
                  <span className="font-medium">{dept.faculty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Publications</span>
                  <span className="font-medium">{dept.publications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patents</span>
                  <span className="font-medium">{dept.patents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Awards</span>
                  <span className="font-medium">{dept.awards}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Highlights */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-display font-semibold mb-4">
          Recent Institute Highlights
        </h2>
        <div className="space-y-4">
          {recentHighlights.map((highlight) => (
            <div
              key={highlight.id}
              className="flex items-start justify-between p-4 bg-muted rounded-lg"
            >
              <div>
                <p className="font-medium text-foreground">
                  {highlight.achievement}
                </p>
                <p className="text-sm text-muted-foreground">
                  {highlight.department}
                </p>
              </div>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {highlight.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrincipalHome;

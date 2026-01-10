import { useState, useEffect } from "react";
import api from "@/lib/api";
import StatCard from "../../components/StatCard";
import { Building2, Users, BookOpen, FileText, Trophy, Award } from "lucide-react";

const PrincipalHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/principal/overview');
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch Principal data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Institute Overview...</div>;
  if (!data) return <div className="p-8 text-center">Failed to load data.</div>;

  const stats = [
    { title: "Total Departments", value: data.totalDepartments, icon: Building2 },
    { title: "Total Faculty", value: data.totalFaculty, icon: Users },
    { title: "Publications", value: data.publications, icon: BookOpen },
    { title: "Patents", value: data.patents, icon: FileText },
  ];

  const departmentSummary = data.departmentSummary || [];
  const recentHighlights = data.recentHighlights || [];

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
          {departmentSummary.length === 0 ? <p className="text-muted-foreground">No data.</p> :
            departmentSummary.map((dept) => (
              <div
                key={dept.departmentId}
                className="p-6 bg-muted rounded-xl hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-4">{dept.name}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Faculty</span>
                    <span className="font-medium">{dept.facultyCount}</span>
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
          {recentHighlights.length === 0 ? <p className="text-muted-foreground">No recent achievements.</p> :
            recentHighlights.map((highlight) => (
              <div
                key={highlight.achievementId}
                className="flex items-start justify-between p-4 bg-muted rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {highlight.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {highlight.department} • {highlight.category}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(highlight.achievementDate).toLocaleDateString()}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PrincipalHome;

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DepartmentAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterFaculty, setFilterFaculty] = useState("all");
  const { user } = useAuth();

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await api.get('/hod/achievements');
        setAchievements(response.data);
      } catch (error) {
        console.error("Failed to fetch department achievements", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const filteredAchievements = achievements.filter((achievement) => {
    const facultyName = achievement.faculty?.name || 'Unknown';
    const matchesSearch =
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facultyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ||
      achievement.category?.toLowerCase() === filterCategory.toLowerCase();
    const matchesFaculty =
      filterFaculty === "all" || facultyName === filterFaculty;

    return matchesSearch && matchesCategory && matchesFaculty;
  });

  const uniqueFaculty = [...new Set(achievements.map((a) => a.faculty?.name || 'Unknown'))].filter(Boolean);

  if (loading) return <div>Loading achievements...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Department Achievements
        </h1>
        <p className="text-muted-foreground mt-2">
          {user?.department?.name || user?.department} - All Faculty Achievements
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search achievements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterFaculty} onValueChange={setFilterFaculty}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by faculty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Faculty</SelectItem>
            {uniqueFaculty.map((faculty) => (
              <SelectItem key={faculty} value={faculty}>
                {faculty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="publication">Publication</SelectItem>
            <SelectItem value="patent">Patent</SelectItem>
            <SelectItem value="award">Award</SelectItem>
            <SelectItem value="fdp">FDP</SelectItem>
            <SelectItem value="project">Project</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Faculty</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Proof</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAchievements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No achievements found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredAchievements.map((achievement) => (
                <TableRow key={achievement._id}>
                  <TableCell className="font-medium">
                    {achievement.faculty?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>{achievement.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{achievement.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(achievement.achievementDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {achievement.proof ? (
                      <a
                        href={`http://localhost:5000/${achievement.proof.replace(/\\/g, '/')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View Proof
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DepartmentAchievements;

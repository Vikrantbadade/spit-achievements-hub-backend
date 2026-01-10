import { useMemo, useState, useEffect } from "react";
import api from "@/lib/api";
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

const capitalize = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

const InstituteAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await api.get('/principal/achievements');
        setAchievements(response.data);
      } catch (error) {
        console.error("Failed to fetch institute achievements", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, []);

  const uniqueDepartments = useMemo(
    () => [...new Set(achievements.map((a) => a.department || 'Unknown'))].filter(Boolean),
    [achievements]
  );

  const uniqueCategories = useMemo(
    () => [...new Set(achievements.map((a) => a.category || 'Unknown'))].filter(Boolean),
    [achievements]
  );

  const filteredAchievements = achievements.filter((achievement) => {
    const deptName = achievement.department || '';
    const facultyName = achievement.faculty?.name || achievement.faculty || '';

    const matchesSearch =
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deptName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || achievement.category === filterCategory;
    const matchesDepartment =
      filterDepartment === "all" || deptName === filterDepartment;

    return matchesSearch && matchesCategory && matchesDepartment;
  });

  if (loading) return <div>Loading achievements...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Institute Achievements
        </h1>
        <p className="text-muted-foreground mt-2">
          All achievements across departments
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
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {uniqueDepartments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
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
            {uniqueCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {capitalize(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Proof</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAchievements.map((achievement) => (
              <TableRow key={achievement._id}>
                <TableCell>
                  <Badge variant="outline">{achievement.department}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {achievement.faculty?.name || achievement.faculty}
                </TableCell>
                <TableCell>{achievement.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {capitalize(achievement.category)}
                  </Badge>
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
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredAchievements.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No achievements match the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InstituteAchievements;

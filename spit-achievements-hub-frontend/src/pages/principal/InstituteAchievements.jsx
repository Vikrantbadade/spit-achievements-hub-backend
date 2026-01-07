import { useMemo, useState } from "react";
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
import { achievements } from "../../data/instituteData";

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const InstituteAchievements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  const uniqueDepartments = useMemo(
    () => [...new Set(achievements.map((a) => a.department))],
    []
  );

  const uniqueCategories = useMemo(
    () => [...new Set(achievements.map((a) => a.category))],
    []
  );

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesSearch =
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || achievement.category === filterCategory;
    const matchesDepartment =
      filterDepartment === "all" || achievement.department === filterDepartment;
    return matchesSearch && matchesCategory && matchesDepartment;
  });

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAchievements.map((achievement) => (
              <TableRow key={achievement.id}>
                <TableCell>
                  <Badge variant="outline">{achievement.department}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {achievement.faculty}
                </TableCell>
                <TableCell>{achievement.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {capitalize(achievement.category)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(achievement.date).toLocaleDateString()}
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

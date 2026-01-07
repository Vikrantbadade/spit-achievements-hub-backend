import { useState } from "react";
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

const mockAchievements = [
  {
    id: 1,
    faculty: "Dr. Sharma",
    title: "Research Paper on Deep Learning",
    category: "Publication",
    date: "2025-12-20",
  },
  {
    id: 2,
    faculty: "Prof. Patel",
    title: "Patent for IoT Device",
    category: "Patent",
    date: "2025-12-15",
  },
  {
    id: 3,
    faculty: "Dr. Kumar",
    title: "Best Paper Award - ICICT 2025",
    category: "Award",
    date: "2025-12-10",
  },
  {
    id: 4,
    faculty: "Dr. Gupta",
    title: "FDP on Cloud Computing",
    category: "FDP",
    date: "2025-12-05",
  },
  {
    id: 5,
    faculty: "Prof. Singh",
    title: "Funded Project - AICTE",
    category: "Project",
    date: "2025-11-28",
  },
];

const DepartmentAchievements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterFaculty, setFilterFaculty] = useState("all");
  const { user } = useAuth();

  const filteredAchievements = mockAchievements.filter((achievement) => {
    const matchesSearch =
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.faculty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ||
      achievement.category.toLowerCase() === filterCategory;
    const matchesFaculty =
      filterFaculty === "all" || achievement.faculty === filterFaculty;
    return matchesSearch && matchesCategory && matchesFaculty;
  });

  const uniqueFaculty = [...new Set(mockAchievements.map((a) => a.faculty))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Department Achievements
        </h1>
        <p className="text-muted-foreground mt-2">
          {user?.department} - All Faculty Achievements
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAchievements.map((achievement) => (
              <TableRow key={achievement.id}>
                <TableCell className="font-medium">
                  {achievement.faculty}
                </TableCell>
                <TableCell>{achievement.title}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{achievement.category}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(achievement.date).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DepartmentAchievements;

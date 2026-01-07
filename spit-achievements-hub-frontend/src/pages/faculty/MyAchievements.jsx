import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Edit, Trash2, Search, Eye } from "lucide-react";
import EditAchievement from "./EditAchievement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const mockAchievements = [
  {
    id: 1,
    title: "Research Paper on Deep Learning",
    category: "Publication",
    date: "2025-12-20",
    status: "approved",
  },
  {
    id: 2,
    title: "Patent for IoT Device",
    category: "Patent",
    date: "2025-11-15",
    status: "pending",
  },
  {
    id: 3,
    title: "Best Paper Award - ICICT 2025",
    category: "Award",
    date: "2025-10-10",
    status: "approved",
  },
  {
    id: 4,
    title: "FDP on Cloud Computing",
    category: "FDP",
    date: "2025-09-05",
    status: "approved",
  },
  {
    id: 5,
    title: "Funded Project - AICTE",
    category: "Project",
    date: "2025-08-20",
    status: "pending",
  },
];

const MyAchievements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const filteredAchievements = mockAchievements.filter((achievement) => {
    const matchesSearch = achievement.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ||
      achievement.category.toLowerCase() === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          My Achievements
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage all your recorded achievements
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
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAchievements.map((achievement) => (
              <TableRow key={achievement.id}>
                <TableCell className="font-medium">
                  {achievement.title}
                </TableCell>
                <TableCell>{achievement.category}</TableCell>
                <TableCell>
                  {new Date(achievement.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      achievement.status === "approved"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {achievement.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => console.log("eye clicked")}
                      variant="ghost"
                      size="icon"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedAchievement(achievement);
                        setIsEditOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Edit Achievement</DialogTitle>
            </DialogHeader>

            {selectedAchievement && (
              <EditAchievement
                achievement={selectedAchievement}
                onClose={() => setIsEditOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyAchievements;

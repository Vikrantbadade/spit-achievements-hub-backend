import { useState, useEffect } from "react";
import api from "@/lib/api";
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
import { Edit, Trash2, Search, Eye, AlertCircle } from "lucide-react";
import EditAchievement from "./EditAchievement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MyAchievements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAchievements();
  }, []);

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesSearch = achievement.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ||
      achievement.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/faculty/achievement/${id}`);
      fetchAchievements();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

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
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-4">Loading...</TableCell></TableRow>
            ) : filteredAchievements.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-4">No achievements found</TableCell></TableRow>
            ) : (
              filteredAchievements.map((achievement) => (
                <TableRow key={achievement._id}>
                  <TableCell className="font-medium">
                    {achievement.title}
                  </TableCell>
                  <TableCell>{achievement.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <Badge variant={
                        achievement.status === 'Approved' ? 'success' :
                          achievement.status === 'Rejected' ? 'destructive' : 'outline'
                      } className={
                        achievement.status === 'Approved' ? "bg-green-100 text-green-800 hover:bg-green-100 w-fit" :
                          achievement.status === 'Rejected' ? "bg-red-100 text-red-800 hover:bg-red-100 w-fit" :
                            "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 w-fit"
                      }>
                        {achievement.status || 'Pending'}
                      </Badge>
                      {achievement.status === 'Rejected' && (
                        <span className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {achievement.rejectionReason}
                        </span>
                      )}
                    </div>
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
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> View
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(achievement._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
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
                onSuccess={fetchAchievements}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyAchievements;

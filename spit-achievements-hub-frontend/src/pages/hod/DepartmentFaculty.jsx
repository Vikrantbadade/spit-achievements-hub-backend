import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Mail } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DepartmentFaculty = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await api.get('/hod/faculty-list');
        // If the backend returns stats in the faculty object, great. 
        // Otherwise we might need to adjust or these will be undefined (showing nothing or 0).
        setFacultyList(response.data);
      } catch (error) {
        console.error("Failed to fetch department faculty", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  const filteredFaculty = facultyList.filter(
    (faculty) =>
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading faculty list...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Department Faculty
        </h1>
        <p className="text-muted-foreground mt-2">
          {user?.department?.name || user?.department} - Faculty Members
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search faculty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead className="text-center">Department</TableHead>
              {/* Stats columns removed if data not available immediately, or kept as placeholders */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFaculty.map((faculty) => (
              <TableRow key={faculty._id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{faculty.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {faculty.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{faculty.role}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  {/* Handle populate if department is object or string */}
                  {faculty.department?.name || faculty.department}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredFaculty.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No faculty found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DepartmentFaculty;

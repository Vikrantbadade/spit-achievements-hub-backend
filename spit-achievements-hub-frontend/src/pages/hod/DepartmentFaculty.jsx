import { useState } from "react";
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

const mockFaculty = [
  {
    id: 1,
    name: "Dr. Sharma",
    email: "sharma@spit.ac.in",
    designation: "Professor",
    publications: 15,
    patents: 3,
    awards: 5,
  },
  {
    id: 2,
    name: "Prof. Patel",
    email: "patel@spit.ac.in",
    designation: "Associate Professor",
    publications: 12,
    patents: 2,
    awards: 3,
  },
  {
    id: 3,
    name: "Dr. Kumar",
    email: "kumar@spit.ac.in",
    designation: "Assistant Professor",
    publications: 8,
    patents: 1,
    awards: 4,
  },
  {
    id: 4,
    name: "Dr. Gupta",
    email: "gupta@spit.ac.in",
    designation: "Professor",
    publications: 20,
    patents: 5,
    awards: 7,
  },
  {
    id: 5,
    name: "Prof. Singh",
    email: "singh@spit.ac.in",
    designation: "Associate Professor",
    publications: 10,
    patents: 2,
    awards: 2,
  },
];

const DepartmentFaculty = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const filteredFaculty = mockFaculty.filter(
    (faculty) =>
      faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faculty.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Department Faculty
        </h1>
        <p className="text-muted-foreground mt-2">
          {user?.department} - Faculty Members
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
              <TableHead className="text-center">Publications</TableHead>
              <TableHead className="text-center">Patents</TableHead>
              <TableHead className="text-center">Awards</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFaculty.map((faculty) => (
              <TableRow key={faculty.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{faculty.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {faculty.email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{faculty.designation}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  {faculty.publications}
                </TableCell>
                <TableCell className="text-center">{faculty.patents}</TableCell>
                <TableCell className="text-center">{faculty.awards}</TableCell>
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DepartmentFaculty;

import { useMemo, useState, useEffect } from "react";
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
import { Search, Eye, BarChart3 } from "lucide-react";

const AllDepartments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        // Using overview endpoint because it contains the calculated stats per department
        const response = await api.get('/principal/overview');
        if (response.data && response.data.departmentSummary) {
          setDepartments(response.data.departmentSummary);
        }
      } catch (error) {
        console.error("Failed to fetch department data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading departments...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          All Departments
        </h1>
        <p className="text-muted-foreground mt-2">
          Institute-wide department overview
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search departments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              {/* <TableHead>HOD</TableHead> */ /* HOD Name not always available in stats, omitting for now */}
              <TableHead className="text-center">Faculty</TableHead>
              <TableHead className="text-center">Publications</TableHead>
              <TableHead className="text-center">Patents</TableHead>
              <TableHead className="text-center">Awards</TableHead>
              <TableHead className="text-center">FDPs</TableHead>
              {/* <TableHead className="text-center">Projects</TableHead> */ /* Projects not always in stats */}
              {/* <TableHead className="text-center">Total</TableHead> */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.map((dept) => (
              <TableRow key={dept.departmentId}>
                <TableCell className="font-medium">{dept.name}</TableCell>
                {/* <TableCell>{dept.hod}</TableCell> */}
                <TableCell className="text-center">{dept.facultyCount}</TableCell>
                <TableCell className="text-center">
                  {dept.publications}
                </TableCell>
                <TableCell className="text-center">{dept.patents}</TableCell>
                <TableCell className="text-center">{dept.awards}</TableCell>
                <TableCell className="text-center">{dept.fdps}</TableCell>
                {/* <TableCell className="text-center">{dept.projects}</TableCell> */}
                {/* <TableCell className="text-center font-semibold">
                  {dept.total}
                </TableCell> */}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredDepartments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No departments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AllDepartments;

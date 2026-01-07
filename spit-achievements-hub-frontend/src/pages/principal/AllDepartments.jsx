import { useMemo, useState } from "react";
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
import { departments, achievements } from "../../data/instituteData";

const AllDepartments = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const departmentRows = useMemo(() => {
    const totalsByDept = achievements.reduce((acc, achievement) => {
      const { departmentId, category } = achievement;
      if (!acc[departmentId]) {
        acc[departmentId] = {
          publications: 0,
          patents: 0,
          awards: 0,
          fdps: 0,
          projects: 0,
          total: 0,
        };
      }
      acc[departmentId][`${category}s`] =
        (acc[departmentId][`${category}s`] || 0) + 1;
      acc[departmentId].total += 1;
      return acc;
    }, {});

    return departments.map((dept) => {
      const totals = totalsByDept[dept.id] || {};
      return {
        ...dept,
        publications: totals.publications || 0,
        patents: totals.patents || 0,
        awards: totals.awards || 0,
        fdps: totals.fdps || 0,
        projects: totals.projects || 0,
        total: totals.total || 0,
      };
    });
  }, []);

  const filteredDepartments = departmentRows.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.hod.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <TableHead>HOD</TableHead>
              <TableHead className="text-center">Faculty</TableHead>
              <TableHead className="text-center">Publications</TableHead>
              <TableHead className="text-center">Patents</TableHead>
              <TableHead className="text-center">Awards</TableHead>
              <TableHead className="text-center">FDPs</TableHead>
              <TableHead className="text-center">Projects</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">{dept.name}</TableCell>
                <TableCell>{dept.hod}</TableCell>
                <TableCell className="text-center">{dept.faculty}</TableCell>
                <TableCell className="text-center">
                  {dept.publications}
                </TableCell>
                <TableCell className="text-center">{dept.patents}</TableCell>
                <TableCell className="text-center">{dept.awards}</TableCell>
                <TableCell className="text-center">{dept.fdps}</TableCell>
                <TableCell className="text-center">{dept.projects}</TableCell>
                <TableCell className="text-center font-semibold">
                  {dept.total}
                </TableCell>
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AllDepartments;

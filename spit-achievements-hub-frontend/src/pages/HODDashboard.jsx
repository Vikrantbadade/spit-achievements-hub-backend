import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import HODHome from "./hod/HODHome";
import DepartmentFaculty from "./hod/DepartmentFaculty";
import DepartmentAchievements from "./hod/DepartmentAchievements";
import HODReports from "./hod/HODReports";
import {
  LayoutDashboard,
  Users,
  Award,
  BarChart3,
} from "lucide-react";

const sidebarItems = [
  { path: "", label: "Dashboard", icon: LayoutDashboard },
  { path: "/faculty", label: "Faculty Members", icon: Users },
  { path: "/achievements", label: "All Achievements", icon: Award },
  { path: "/reports", label: "Department Reports", icon: BarChart3 },
];

const HODDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} basePath="/hod" />
      <div className="flex-1 flex flex-col">
        <Header title={`HOD Dashboard - ${user?.department}`} />
        <main className="flex-1 p-6">
          <Routes>
            <Route index element={<HODHome />} />
            <Route path="/faculty" element={<DepartmentFaculty />} />
            <Route path="/achievements" element={<DepartmentAchievements />} />
            <Route path="/reports" element={<HODReports />} />
            <Route path="*" element={<Navigate to="/hod" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default HODDashboard;

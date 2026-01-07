import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import PrincipalHome from "./principal/PrincipalHome";
import AllDepartments from "./principal/AllDepartments";
import InstituteAchievements from "./principal/InstituteAchievements";
import InstituteReports from "./principal/InstituteReports";
import {
  LayoutDashboard,
  Building2,
  Award,
  BarChart3,
} from "lucide-react";

const sidebarItems = [
  { path: "", label: "Dashboard", icon: LayoutDashboard },
  { path: "/departments", label: "All Departments", icon: Building2 },
  { path: "/achievements", label: "Institute Achievements", icon: Award },
  { path: "/reports", label: "Institute Reports", icon: BarChart3 },
];

const PrincipalDashboard = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} basePath="/principal" />
      <div className="flex-1 flex flex-col">
        <Header title="Principal Dashboard" />
        <main className="flex-1 p-6">
          <Routes>
            <Route index element={<PrincipalHome />} />
            <Route path="/departments" element={<AllDepartments />} />
            <Route path="/achievements" element={<InstituteAchievements />} />
            <Route path="/reports" element={<InstituteReports />} />
            <Route path="*" element={<Navigate to="/principal" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default PrincipalDashboard;

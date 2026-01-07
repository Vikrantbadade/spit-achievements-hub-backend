import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import FacultyHome from "./faculty/FacultyHome";
import AddAchievement from "./faculty/AddAchievement";
import MyAchievements from "./faculty/MyAchievements";
import FacultyReports from "./faculty/FacultyReports";
import {
  LayoutDashboard,
  PlusCircle,
  Award,
  BarChart3,
} from "lucide-react";

const sidebarItems = [
  { path: "", label: "Dashboard", icon: LayoutDashboard },
  { path: "/add-achievement", label: "Add Achievement", icon: PlusCircle },
  { path: "/my-achievements", label: "My Achievements", icon: Award },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

const FacultyDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar items={sidebarItems} basePath="/faculty" />
      <div className="flex-1 flex flex-col">
        <Header title="Faculty Dashboard" />
        <main className="flex-1 p-6">
          <Routes>
            <Route index element={<FacultyHome />} />
            <Route path="/add-achievement" element={<AddAchievement />} />
            <Route path="/my-achievements" element={<MyAchievements />} />
            <Route path="/reports" element={<FacultyReports />} />
            <Route path="*" element={<Navigate to="/faculty" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;

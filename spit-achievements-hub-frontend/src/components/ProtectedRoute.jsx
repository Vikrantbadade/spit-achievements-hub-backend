import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Normalize allowed roles and user role
  const normalizedUserRole = user?.role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles?.map(r => r.toLowerCase());

  if (allowedRoles && !normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

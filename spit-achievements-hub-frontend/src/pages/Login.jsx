// TITLE: Login Page Component
// Handles user authentication with Real API integration.
// Includes Role and Department verification to prevent unauthorized access.
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Users, Crown } from "lucide-react";
import LogoSPIT from "../assets/LogoSPIT.png";
import api from "../lib/api";

const roles = [
  { value: "faculty", label: "Faculty", icon: GraduationCap, path: "/faculty" },
  { value: "hod", label: "HOD", icon: Users, path: "/hod" },
  { value: "principal", label: "Principal", icon: Crown, path: "/principal" },
];

const Login = () => {
  // Reverted to hardcoded departments for debugging
  const departments = [
    { value: "Computer Engineering", label: "Computer Engineering" },
    { value: "Information Technology", label: "Information Technology" },
    { value: "Electronics & Telecommunication", label: "Electronics & Telecommunication" },
    { value: "Computer Science & Engineering", label: "Computer Science & Engineering" },
    { value: "MCA", label: "MCA" },
    { value: "Applied Sciences", label: "Applied Sciences" }
  ];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password || !role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (role !== "principal" && !department) {
      toast({
        title: "Error",
        description: "Please select a department",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Replaced fetch with api.post
      const response = await api.post('/auth/signin', { email, password });
      const data = response.data;

      // 1. Verify Role
      if (data.role.toLowerCase() !== role.toLowerCase()) {
        throw new Error(`Unauthorized: This account is not a ${role} account.`);
      }

      // 2. Verify Department (for Faculty/HOD)
      if (role !== 'principal') {
        // department state holds the NAME of the selected department
        if (data.user.department?.name !== department) {
          throw new Error(`Unauthorized: This account does not belong to ${department}.`);
        }
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));

      login({
        ...data.user,
        role: data.role,
        department: role === "principal" ? "All Departments" : data.user.department?.name,
        token: data.token
      });

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.name}!`,
      });

      const selectedRole = roles.find((r) => r.value === role);
      navigate(selectedRole.path);

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoleData = roles.find((r) => r.value === role);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-90" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-primary-foreground">
          <img
            src={LogoSPIT}
            alt="SPIT Logo"
            className="h-32 w-auto mb-8 bg-white rounded-2xl p-4 shadow-lg"
          />
          <h1 className="text-4xl font-display font-bold text-center mb-4">
            Bharatiya Vidya Bhavan's
          </h1>
          <h2 className="text-3xl font-display font-semibold text-center mb-2">
            Sardar Patel Institute of Technology
          </h2>
          <p className="text-lg opacity-90 text-center mt-4">
            Faculty Achievement Tracking System
          </p>
          <div className="mt-12 flex gap-8">
            {roles.map((r) => (
              <div key={r.value} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-2">
                  <r.icon className="h-8 w-8" />
                </div>
                <p className="text-sm font-medium">{r.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/50 to-transparent" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src={LogoSPIT} alt="SPIT Logo" className="h-20 w-auto mb-4" />
            <h1 className="text-xl font-display font-bold text-primary text-center">
              SPIT Faculty Portal
            </h1>
          </div>

          <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground">
                Welcome Back
              </h2>
              <p className="text-muted-foreground mt-2">
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        <div className="flex items-center gap-2">
                          <r.icon className="h-4 w-4" />
                          {r.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {role && role !== "principal" && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="department">Department</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@spit.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {selectedRoleData && (
                      <selectedRoleData.icon className="h-5 w-5" />
                    )}
                    Sign In
                    {selectedRoleData && ` as ${selectedRoleData.label}`}
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full h-12 text-lg font-medium border-primary text-primary hover:bg-primary/5"
                onClick={() => navigate('/admin')}
              >
                Go to Admin Portal
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Having trouble signing in?{" "}
              <a href="#" className="text-primary hover:underline font-medium">
                Contact IT Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import LogoSPIT from "../assets/LogoSPIT.png";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <img src={LogoSPIT} alt="SPIT Logo" className="h-24 w-auto mb-8" />
      <h1 className="text-6xl font-display font-bold text-primary mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">Page not found</p>
      <Button asChild>
        <Link to="/" className="gap-2">
          <Home className="h-4 w-4" />
          Go to Home
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;

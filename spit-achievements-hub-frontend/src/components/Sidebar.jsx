import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import LogoSPIT from "../assets/LogoSPIT.png";

const Sidebar = ({ items, basePath }) => {
  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={LogoSPIT} alt="SPIT Logo" className="h-12 w-auto bg-white rounded-lg p-1" />
          <div>
            <h2 className="font-display font-bold text-lg text-sidebar-foreground">SPIT</h2>
            <p className="text-xs text-sidebar-foreground/70">Faculty Portal</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={`${basePath}${item.path}`}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                "hover:bg-sidebar-accent",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground/80"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

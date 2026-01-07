import { cn } from "@/lib/utils";

const StatCard = ({ title, value, icon: Icon, trend, className }) => {
  return (
    <div
      className={cn(
        "bg-card rounded-xl p-6 border border-border shadow-sm",
        "hover:shadow-md transition-shadow duration-300",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-display font-bold mt-2 text-foreground">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "text-sm mt-2 font-medium",
                trend > 0 ? "text-green-600" : "text-destructive"
              )}
            >
              {trend > 0 ? "+" : ""}
              {trend}% from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

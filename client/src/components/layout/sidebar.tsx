import { Link, useLocation } from "wouter";
import { Shield, BarChart3, Gauge, Plug, Users, TrendingUp, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const navigationItems = [
  {
    label: "Dashboard",
    icon: BarChart3,
    href: "/",
    key: "dashboard",
  },
  {
    label: "Rate Limits",
    icon: Gauge,
    href: "/rate-limits",
    key: "rate-limits",
  },
  {
    label: "API Endpoints",
    icon: Plug,
    href: "/endpoints",
    key: "endpoints",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
    key: "users",
  },
  {
    label: "Analytics",
    icon: TrendingUp,
    href: "/analytics",
    key: "analytics",
  },
  {
    label: "Request Logs",
    icon: FileText,
    href: "/logs",
    key: "logs",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    key: "settings",
  },
];

export default function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const [location] = useLocation();

  return (
    <nav className="bg-aws-blue text-white w-64 flex-shrink-0 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-8">
          <Shield className="text-aws-orange text-xl" />
          <span className="text-lg font-semibold">API Gateway</span>
        </div>
        
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={() => setCurrentPage(item.label)}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded transition-colors",
                    isActive 
                      ? "bg-aws-orange bg-opacity-20 text-aws-orange" 
                      : "hover:bg-white hover:bg-opacity-10"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

import { Search, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  currentPage: string;
}

const pageDescriptions: Record<string, string> = {
  "Dashboard": "Monitor your API gateway performance and manage rate limiting policies",
  "Rate Limits": "Configure and manage rate limiting policies for your API endpoints",
  "API Endpoints": "Manage your API endpoints and their configurations",
  "Users": "View and manage user accounts and their access levels",
  "Analytics": "Detailed analytics and insights about your API usage",
  "Request Logs": "View detailed request logs and error reports",
  "Settings": "Configure global settings and preferences",
};

export default function Header({ currentPage }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-aws-text">{currentPage}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {pageDescriptions[currentPage] || ""}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-64 focus:ring-2 focus:ring-aws-orange focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <Button className="bg-aws-orange hover:bg-aws-orange/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Policy
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <span className="text-sm font-medium">Admin User</span>
          </div>
        </div>
      </div>
    </header>
  );
}

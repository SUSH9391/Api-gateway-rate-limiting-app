import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Dashboard from "@/pages/dashboard";
import RateLimits from "@/pages/rate-limits";
import Endpoints from "@/pages/endpoints";
import Users from "@/pages/users";
import Analytics from "@/pages/analytics";
import Logs from "@/pages/logs";
import Settings from "@/pages/settings";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/rate-limits" component={RateLimits} />
      <Route path="/endpoints" component={Endpoints} />
      <Route path="/users" component={Users} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/logs" component={Logs} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("Dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-aws-bg flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-aws-blue mb-6">API Gateway Login</h1>
          <p className="text-gray-600 mb-4">Please sign in to access the admin dashboard</p>
          <button
            onClick={() => {
              // For demo purposes, simulate login
              localStorage.setItem("token", "demo-token");
              setIsAuthenticated(true);
            }}
            className="w-full bg-aws-orange text-white py-2 px-4 rounded hover:bg-opacity-90 transition-colors"
          >
            Sign In (Demo)
          </button>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
          <main className="flex-1 overflow-y-auto">
            <Header currentPage={currentPage} />
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

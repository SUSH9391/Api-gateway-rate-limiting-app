import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Ban, Clock, Users, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardMetrics } from "@/types";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: "Total Requests",
      value: metrics.totalRequests.toLocaleString(),
      change: "+12.5% from yesterday",
      trend: "up",
      icon: BarChart3,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Rate Limited",
      value: metrics.rateLimitedRequests.toLocaleString(),
      change: "+2.3% from yesterday",
      trend: "up",
      icon: Ban,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      title: "Avg Response Time",
      value: `${metrics.avgResponseTime}ms`,
      change: "-8.2% from yesterday",
      trend: "down",
      icon: Clock,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Active Users",
      value: metrics.activeUsers.toLocaleString(),
      change: "+5.7% from yesterday",
      trend: "up",
      icon: Users,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === "up" ? TrendingUp : TrendingDown;
        const trendColor = card.trend === "up" ? "text-aws-success" : "text-aws-alert";
        
        return (
          <Card key={index} className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-semibold text-aws-text mt-1">{card.value}</p>
                  <p className={cn("text-xs mt-1 flex items-center", trendColor)}>
                    <TrendIcon className="w-3 h-3 mr-1" />
                    {card.change}
                  </p>
                </div>
                <div className={cn("p-3 rounded-full", card.iconBg)}>
                  <Icon className={cn("text-xl w-6 h-6", card.iconColor)} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

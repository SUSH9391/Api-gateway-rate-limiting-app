import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Activity, Clock, Download } from "lucide-react";
import { dashboard } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function Analytics() {
  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: dashboard.getMetrics,
    refetchInterval: 30000,
  });

  const { data: topEndpoints = [] } = useQuery({
    queryKey: ["/api/dashboard/top-endpoints"],
    queryFn: dashboard.getTopEndpoints,
    refetchInterval: 30000,
  });

  const analyticsCards = [
    {
      title: "Request Success Rate",
      value: "98.5%",
      change: "+0.3%",
      trend: "up",
      icon: TrendingUp,
      color: "text-aws-success",
      bgColor: "bg-green-50",
    },
    {
      title: "Error Rate",
      value: "1.5%",
      change: "-0.2%",
      trend: "down",
      icon: Activity,
      color: "text-aws-alert",
      bgColor: "bg-red-50",
    },
    {
      title: "Peak Requests/Hour",
      value: "47,832",
      change: "+18.2%",
      trend: "up",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Avg Response Time",
      value: metrics ? `${metrics.avgResponseTime}ms` : "45ms",
      change: "-12ms",
      trend: "down",
      icon: Clock,
      color: "text-aws-success",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-aws-text">Analytics Overview</h2>
          <p className="text-sm text-gray-600 mt-1">Detailed insights into your API performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select defaultValue="24h">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analyticsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{card.title}</p>
                    <p className="text-2xl font-semibold text-aws-text mt-1">{card.value}</p>
                    <p className={cn("text-xs mt-1", card.color)}>
                      {card.change} from yesterday
                    </p>
                  </div>
                  <div className={cn("p-3 rounded-full", card.bgColor)}>
                    <Icon className={cn("w-6 h-6", card.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle>Request Volume Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-50 rounded flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Request Volume Chart</p>
                <p className="text-sm">Interactive chart showing request patterns over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-50 rounded flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Clock className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Response Time Histogram</p>
                <p className="text-sm">Distribution of response times across endpoints</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limiting Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle>Rate Limiting Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Total Requests Blocked</p>
                  <p className="text-sm text-gray-600">Due to rate limiting</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-aws-alert">
                    {metrics?.rateLimitedRequests || 0}
                  </p>
                  <p className="text-sm text-gray-600">requests</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Block Rate</p>
                  <p className="text-sm text-gray-600">Percentage of blocked requests</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-aws-alert">
                    {metrics ? ((metrics.rateLimitedRequests / metrics.totalRequests) * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">of total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle>Top Blocked Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEndpoints
                .filter(endpoint => endpoint.status === "Limited")
                .slice(0, 5)
                .map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm font-mono">{endpoint.endpoint}</p>
                      <p className="text-xs text-gray-600">{endpoint.requestCount} requests</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-aws-alert">Blocked</p>
                    </div>
                  </div>
                ))}
              
              {topEndpoints.filter(endpoint => endpoint.status === "Limited").length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No blocked endpoints in the current time period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

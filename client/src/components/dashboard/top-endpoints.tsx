import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TopEndpoint } from "@/types";

interface TopEndpointsProps {
  endpoints: TopEndpoint[];
}

export default function TopEndpoints({ endpoints }: TopEndpointsProps) {
  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Top Endpoints</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm font-mono">{endpoint.endpoint}</p>
                <p className="text-xs text-gray-600">{endpoint.requestCount.toLocaleString()} requests</p>
              </div>
              <Badge 
                className={cn(
                  "text-xs",
                  endpoint.status === "Active" 
                    ? "bg-aws-success text-white" 
                    : "bg-aws-alert text-white"
                )}
              >
                {endpoint.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

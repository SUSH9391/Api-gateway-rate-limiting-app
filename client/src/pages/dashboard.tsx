import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import MetricsCards from "@/components/dashboard/metrics-cards";
import RequestChart from "@/components/dashboard/request-chart";
import TopEndpoints from "@/components/dashboard/top-endpoints";
import PoliciesTable from "@/components/dashboard/policies-table";
import CreatePolicyModal from "@/components/modals/create-policy-modal";
import { dashboard, policies } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isCreatePolicyOpen, setIsCreatePolicyOpen] = useState(false);
  const { toast } = useToast();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: dashboard.getMetrics,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: topEndpoints = [], isLoading: endpointsLoading } = useQuery({
    queryKey: ["/api/dashboard/top-endpoints"],
    queryFn: dashboard.getTopEndpoints,
    refetchInterval: 30000,
  });

  const { data: policiesList = [], isLoading: policiesLoading } = useQuery({
    queryKey: ["/api/policies"],
    queryFn: () => policies.list(10, 0),
    refetchInterval: 30000,
  });

  const handleEditPolicy = (policy: any) => {
    toast({
      title: "Edit Policy",
      description: "Policy editing feature coming soon",
    });
  };

  const handleDeletePolicy = async (policyId: number) => {
    try {
      await policies.delete(policyId);
      toast({
        title: "Success",
        description: "Policy deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete policy",
        variant: "destructive",
      });
    }
  };

  if (metricsLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Failed to load dashboard data</p>
          <p className="text-sm text-gray-400 mt-2">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <MetricsCards metrics={metrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RequestChart />
        <TopEndpoints endpoints={topEndpoints} />
      </div>

      <PoliciesTable
        policies={policiesList}
        onEditPolicy={handleEditPolicy}
        onDeletePolicy={handleDeletePolicy}
        onCreatePolicy={() => setIsCreatePolicyOpen(true)}
      />

      <CreatePolicyModal
        open={isCreatePolicyOpen}
        onClose={() => setIsCreatePolicyOpen(false)}
      />
    </div>
  );
}

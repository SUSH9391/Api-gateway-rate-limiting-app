import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreatePolicyModal from "@/components/modals/create-policy-modal";
import { policies } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { RateLimitPolicy } from "@/types";

export default function RateLimits() {
  const [isCreatePolicyOpen, setIsCreatePolicyOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: policiesList = [], isLoading } = useQuery({
    queryKey: ["/api/policies"],
    queryFn: () => policies.list(50, 0),
    refetchInterval: 30000,
  });

  const filteredPolicies = policiesList.filter((policy) => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.endpointPattern.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && policy.isActive) ||
                         (statusFilter === "inactive" && !policy.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleEditPolicy = (policy: RateLimitPolicy) => {
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

  const handleToggleStatus = (policy: RateLimitPolicy) => {
    toast({
      title: "Toggle Status",
      description: "Status toggle feature coming soon",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Rate Limiting Policies</CardTitle>
            <Button 
              onClick={() => setIsCreatePolicyOpen(true)}
              className="bg-aws-orange hover:bg-aws-orange/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Policy
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Policies</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policy Name</TableHead>
                  <TableHead>Endpoint Pattern</TableHead>
                  <TableHead>Request Limit</TableHead>
                  <TableHead>Time Window</TableHead>
                  <TableHead>Burst Limit</TableHead>
                  <TableHead>User Scope</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{policy.name}</div>
                        <div className="text-sm text-gray-500">{policy.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {policy.endpointPattern}
                      </code>
                    </TableCell>
                    <TableCell>{policy.requestLimit}</TableCell>
                    <TableCell>{policy.timeWindow}</TableCell>
                    <TableCell>{policy.burstLimit}</TableCell>
                    <TableCell className="capitalize">{policy.userScope}</TableCell>
                    <TableCell>
                      <Badge
                        variant={policy.priority === "high" ? "destructive" : 
                                policy.priority === "medium" ? "default" : "secondary"}
                      >
                        {policy.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "cursor-pointer",
                          policy.isActive
                            ? "bg-aws-success hover:bg-aws-success/80 text-white"
                            : "bg-gray-500 hover:bg-gray-500/80 text-white"
                        )}
                        onClick={() => handleToggleStatus(policy)}
                      >
                        {policy.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPolicy(policy)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePolicy(policy.id)}
                          className="text-aws-alert hover:text-aws-alert/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredPolicies.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== "all" 
                ? "No policies match your search criteria" 
                : "No rate limiting policies configured"}
            </div>
          )}
        </CardContent>
      </Card>

      <CreatePolicyModal
        open={isCreatePolicyOpen}
        onClose={() => setIsCreatePolicyOpen(false)}
      />
    </div>
  );
}

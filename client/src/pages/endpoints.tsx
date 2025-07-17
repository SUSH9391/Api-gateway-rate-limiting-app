import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Globe } from "lucide-react";
import { endpoints } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { ApiEndpoint } from "@/types";

export default function Endpoints() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: endpointsList = [], isLoading } = useQuery({
    queryKey: ["/api/endpoints"],
    queryFn: () => endpoints.list(50, 0),
    refetchInterval: 30000,
  });

  const filteredEndpoints = endpointsList.filter((endpoint) => {
    return endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
           endpoint.method.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateEndpoint = () => {
    toast({
      title: "Create Endpoint",
      description: "Endpoint creation feature coming soon",
    });
  };

  const handleEditEndpoint = (endpoint: ApiEndpoint) => {
    toast({
      title: "Edit Endpoint",
      description: "Endpoint editing feature coming soon",
    });
  };

  const handleDeleteEndpoint = (endpointId: number) => {
    toast({
      title: "Delete Endpoint",
      description: "Endpoint deletion feature coming soon",
    });
  };

  const getMethodBadgeColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "bg-blue-100 text-blue-800";
      case "POST":
        return "bg-green-100 text-green-800";
      case "PUT":
        return "bg-yellow-100 text-yellow-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "PATCH":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
            <CardTitle className="text-xl font-semibold flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              API Endpoints
            </CardTitle>
            <Button 
              onClick={handleCreateEndpoint}
              className="bg-aws-orange hover:bg-aws-orange/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Endpoint
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search endpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEndpoints.map((endpoint) => (
                  <TableRow key={endpoint.id}>
                    <TableCell>
                      <Badge className={cn("font-mono", getMethodBadgeColor(endpoint.method))}>
                        {endpoint.method.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {endpoint.path}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm text-gray-600">
                          {endpoint.description || "No description provided"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          endpoint.isActive
                            ? "bg-aws-success text-white"
                            : "bg-gray-500 text-white"
                        )}
                      >
                        {endpoint.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {new Date(endpoint.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEndpoint(endpoint)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEndpoint(endpoint.id)}
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
          
          {filteredEndpoints.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm 
                ? "No endpoints match your search criteria" 
                : "No API endpoints configured"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

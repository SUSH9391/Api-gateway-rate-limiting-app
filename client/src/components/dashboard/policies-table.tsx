import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RateLimitPolicy } from "@/types";

interface PoliciesTableProps {
  policies: RateLimitPolicy[];
  onEditPolicy: (policy: RateLimitPolicy) => void;
  onDeletePolicy: (policyId: number) => void;
  onCreatePolicy: () => void;
}

export default function PoliciesTable({ 
  policies, 
  onEditPolicy, 
  onDeletePolicy, 
  onCreatePolicy 
}: PoliciesTableProps) {
  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Rate Limiting Policies</h3>
          <div className="flex items-center space-x-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Policies</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onCreatePolicy} className="bg-aws-orange hover:bg-aws-orange/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Policy
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="px-6 py-3">Policy Name</TableHead>
                <TableHead className="px-6 py-3">Endpoint</TableHead>
                <TableHead className="px-6 py-3">Limit</TableHead>
                <TableHead className="px-6 py-3">Window</TableHead>
                <TableHead className="px-6 py-3">Status</TableHead>
                <TableHead className="px-6 py-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id} className="hover:bg-gray-50">
                  <TableCell className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{policy.name}</div>
                      <div className="text-sm text-gray-500">{policy.description}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-900">{policy.endpointPattern}</span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900">
                    {policy.requestLimit}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-900">
                    {policy.timeWindow}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      className={cn(
                        "text-xs",
                        policy.isActive
                          ? "bg-aws-success text-white"
                          : "bg-gray-500 text-white"
                      )}
                    >
                      {policy.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditPolicy(policy)}
                        className="text-aws-orange hover:text-aws-orange/80"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeletePolicy(policy.id)}
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
        
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing 1-{policies.length} of {policies.length} policies
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-aws-orange text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

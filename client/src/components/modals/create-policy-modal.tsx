import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { policies } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createPolicySchema = z.object({
  name: z.string().min(1, "Policy name is required"),
  description: z.string().optional(),
  endpointPattern: z.string().min(1, "Endpoint pattern is required"),
  requestLimit: z.coerce.number().min(1, "Request limit must be at least 1"),
  timeWindow: z.string().min(1, "Time window is required"),
  burstLimit: z.coerce.number().min(1, "Burst limit must be at least 1"),
  userScope: z.string().min(1, "User scope is required"),
  priority: z.string().min(1, "Priority is required"),
  isActive: z.boolean().default(true),
});

type CreatePolicyForm = z.infer<typeof createPolicySchema>;

interface CreatePolicyModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePolicyModal({ open, onClose }: CreatePolicyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<CreatePolicyForm>({
    resolver: zodResolver(createPolicySchema),
    defaultValues: {
      name: "",
      description: "",
      endpointPattern: "",
      requestLimit: 1000,
      timeWindow: "1h",
      burstLimit: 50,
      userScope: "all",
      priority: "medium",
      isActive: true,
    },
  });

  const createPolicyMutation = useMutation({
    mutationFn: policies.create,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rate limiting policy created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/policies"] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create policy",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreatePolicyForm) => {
    createPolicyMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Rate Limiting Policy</DialogTitle>
          <DialogDescription>
            Configure a new rate limiting policy for your API endpoints
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter policy name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="endpointPattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Endpoint Pattern</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="/api/v1/users/*" className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="requestLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Limit</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="1000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timeWindow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Window</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time window" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1m">1 minute</SelectItem>
                        <SelectItem value="5m">5 minutes</SelectItem>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="1d">1 day</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="burstLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Burst Limit</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} placeholder="50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="userScope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Scope</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" />
                        <Label htmlFor="all">All Users</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="authenticated" id="authenticated" />
                        <Label htmlFor="authenticated">Authenticated Users Only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="specific" id="specific" />
                        <Label htmlFor="specific">Specific User Groups</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter policy description" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-aws-orange hover:bg-aws-orange/90 text-white"
                disabled={createPolicyMutation.isPending}
              >
                {createPolicyMutation.isPending ? "Creating..." : "Create Policy"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

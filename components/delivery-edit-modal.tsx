// components\delivery-edit-modal.tsx
"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { calculateNetAmount } from "@/lib/utils";

interface Project {
  id: number;
  name: string;
  client: {
    name: string;
  };
}

interface User {
  id: number;
  name: string;
}

interface Delivery {
  id: number;
  projectId?: number;
  userId?: number;
  role: string;
  description: string;
  deliveryDate: string;
  // Handle both naming conventions for date
  delivery_date?: string;
  grossAmount?: number;
  netAmount?: number;
  // Handle both naming conventions from monthly sheet
  gross_amount?: number;
  net_amount?: number;
  // Nested objects from monthly sheet
  project?: {
    id: number;
    name: string;
    client: {
      name: string;
    };
  };
  user?: {
    id: number;
    name: string;
  };
}

interface DeliveryEditModalProps {
  delivery: Delivery | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  projects: Project[];
  users: User[];
}

export default function DeliveryEditModal({
  delivery,
  isOpen,
  onClose,
  onUpdate,
  projects,
  users,
}: DeliveryEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGross, setIsGross] = useState(true);
  const [formData, setFormData] = useState({
    projectId: "",
    userId: "",
    role: "",
    description: "",
    deliveryDate: "",
    amount: "",
  });

  const { toast } = useToast();

  const roles = [
    "Frontend (App)",
    "Frontend (Web)",
    "Backend",
    "API Implemented",
    "UI/UX",
    "AI Development",
    "Deployment",
    "Other",
  ];

  useEffect(() => {
    if (delivery && isOpen) {
      console.log("Full delivery object:", delivery);

      // Handle both direct properties and nested project/user objects
      let projectId = "";
      let userId = "";

      // Try different ways to get projectId
      if (delivery.projectId) {
        projectId = delivery.projectId.toString();
      } else if (delivery.project?.id) {
        projectId = delivery.project.id.toString();
      }

      // Try different ways to get userId
      if (delivery.userId) {
        userId = delivery.userId.toString();
      } else if (delivery.user?.id) {
        userId = delivery.user.id.toString();
      }

      // If we still don't have projectId/userId, try to find them in the arrays
      if (!projectId && delivery.project?.name) {
        const matchingProject = projects.find(
          (p) => p.name === delivery.project?.name
        );
        if (matchingProject) {
          projectId = matchingProject.id.toString();
        }
      }

      if (!userId && delivery.user?.name) {
        const matchingUser = users.find((u) => u.name === delivery.user?.name);
        if (matchingUser) {
          userId = matchingUser.id.toString();
        }
      }

      // Handle both grossAmount and gross_amount naming conventions
      const grossAmount = delivery.grossAmount || delivery.gross_amount || 0;

      // Format the delivery date properly - handle both naming conventions
      let formattedDate = "";
      const deliveryDate = delivery.deliveryDate || delivery.delivery_date;
      if (deliveryDate) {
        const date = new Date(deliveryDate);
        // Format as YYYY-MM-DD for HTML date input
        formattedDate = date.toISOString().split("T")[0];
      }

      console.log("Setting form data:", {
        projectId,
        userId,
        role: delivery.role || "",
        description: delivery.description || "",
        deliveryDate: formattedDate,
        amount: grossAmount.toString(),
      });

      setFormData({
        projectId,
        userId,
        role: delivery.role || "",
        description: delivery.description || "",
        deliveryDate: formattedDate,
        amount: grossAmount.toString(),
      });
      setIsGross(true);
    } else if (!isOpen) {
      // Reset form when modal is closed
      setFormData({
        projectId: "",
        userId: "",
        role: "",
        description: "",
        deliveryDate: "",
        amount: "",
      });
    }
  }, [delivery, isOpen, projects, users]); // Added projects and users to dependencies

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSelectChange(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!delivery) return;

    // Validate required fields
    if (
      !formData.projectId ||
      !formData.userId ||
      !formData.role ||
      !formData.deliveryDate ||
      !formData.amount
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get the actual delivery ID - handle both direct id and nested structure
      const deliveryId = delivery.id;

      const response = await fetch(`/api/deliveries/${deliveryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: Number.parseInt(formData.projectId),
          userId: Number.parseInt(formData.userId),
          role: formData.role,
          description: formData.description,
          deliveryDate: formData.deliveryDate,
          grossAmount: Number.parseFloat(formData.amount),
          isGross,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update delivery");
      }

      toast({
        title: "Success",
        description: "Delivery record updated successfully.",
      });

      onUpdate();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update delivery record",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const netAmount = formData.amount
    ? isGross
      ? calculateNetAmount(Number.parseFloat(formData.amount)).toFixed(2)
      : formData.amount
    : "0.00";

  const grossAmount = formData.amount
    ? isGross
      ? formData.amount
      : (Number.parseFloat(formData.amount) / 0.8).toFixed(2)
    : "0.00";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Delivery Record</DialogTitle>
          <DialogDescription>
            Make changes to the delivery record here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">Project</Label>
              <Select
                value={formData.projectId}
                onValueChange={(value) =>
                  handleSelectChange("projectId", value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name} ({project.client.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">Contributor</Label>
              <Select
                value={formData.userId}
                onValueChange={(value) => handleSelectChange("userId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a contributor" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role/Phase</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange("role", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input
                id="deliveryDate"
                name="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="amount">
                  {isGross ? "Gross Amount" : "Net Amount"}
                </Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="isGross" className="text-sm">
                    {isGross ? "Gross" : "Net"}
                  </Label>
                  <Switch
                    id="isGross"
                    checked={isGross}
                    onCheckedChange={setIsGross}
                  />
                </div>
              </div>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder={`Enter ${isGross ? "gross" : "net"} amount`}
                required
              />
              <div className="text-sm text-gray-500 mt-1">
                {isGross
                  ? `Net amount (after 20% deduction): $${netAmount}`
                  : `Gross amount: $${grossAmount}`}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the work done"
                required
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

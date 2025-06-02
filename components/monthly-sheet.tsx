"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  formatCurrency,
  formatDate,
  getMonthName,
  sortByPhase,
} from "@/lib/utils";
import { Download, FileText, Printer } from "lucide-react";
import DeliveryEditModal from "@/components/delivery-edit-modal";

interface Delivery {
  id: number;
  projectId: number;
  userId: number;
  role: string;
  description: string;
  delivery_date: string;
  // Handle both naming conventions
  grossAmount?: number;
  netAmount?: number;
  gross_amount?: number;
  net_amount?: number;
  month: number;
  year: number;
  project: {
    name: string;
    client: {
      name: string;
    };
  };
  user: {
    name: string;
  };
}

interface UserSummary {
  id: number;
  name: string;
  delivery_count: number;
  total_gross: number;
  total_net: number;
}

// Helper function to safely get gross amount
const getGrossAmount = (delivery: Delivery): number => {
  return delivery.grossAmount ?? delivery.gross_amount ?? 0;
};

// Helper function to safely get net amount
const getNetAmount = (delivery: Delivery): number => {
  return delivery.netAmount ?? delivery.net_amount ?? 0;
};

export default function MonthlySheet() {
  const [isLoading, setIsLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Current month
  const [year, setYear] = useState(new Date().getFullYear()); // Current year
  const [isExporting, setIsExporting] = useState(false);
  const [userSummary, setUserSummary] = useState<UserSummary[]>([]);
  const [editingDelivery, setEditingDelivery] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [monthlyTarget, setMonthlyTarget] = useState(0);

  const { toast } = useToast();

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1),
  }));

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: year - 2 + i,
    label: `${year - 2 + i}`,
  }));

  useEffect(() => {
    fetchDeliveries();
    fetchAdditionalData();
  }, [month, year]);

  async function fetchDeliveries() {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/deliveries?month=${month}&year=${year}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch deliveries");
      }

      const data = await response.json();

      // Sort deliveries by client name, then by phase order
      const sortedData = [...data].sort((a, b) => {
        // First sort by client name
        const clientCompare = a.project.client.name.localeCompare(
          b.project.client.name
        );
        if (clientCompare !== 0) return clientCompare;

        // Then sort by phase
        return sortByPhase(a, b);
      });

      setDeliveries(sortedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load delivery data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAdditionalData() {
    try {
      const [summaryResponse, projectsResponse, usersResponse, targetResponse] =
        await Promise.all([
          fetch(`/api/monthly-summary?month=${month}&year=${year}`),
          fetch("/api/projects"),
          fetch("/api/users"),
          fetch(`/api/monthly-targets?month=${month}&year=${year}`),
        ]);

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setUserSummary(summaryData.userSummary || []);
      }

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      if (targetResponse.ok) {
        const targetData = await targetResponse.json();
        setMonthlyTarget(targetData?.target_amount || 0);
      }
    } catch (error) {
      console.error("Error fetching additional data:", error);
    }
  }

  async function handleExport(format: "csv" | "json") {
    setIsExporting(true);
    try {
      const response = await fetch(
        `/api/export?month=${month}&year=${year}&format=${format}`
      );

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      if (format === "json") {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Deliveries-${month}-${year}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For CSV, use direct download
        window.location.href = `/api/export?month=${month}&year=${year}&format=${format}`;
      }

      toast({
        title: "Success",
        description: `Data exported successfully as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }

  function handleEdit(delivery: any) {
    setEditingDelivery(delivery);
    setIsEditModalOpen(true);
  }

  async function handleDelete(deliveryId: number) {
    if (!confirm("Are you sure you want to delete this delivery record?"))
      return;

    try {
      const response = await fetch(`/api/deliveries/${deliveryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete delivery");
      }

      toast({
        title: "Success",
        description: "Delivery record deleted successfully.",
      });

      fetchDeliveries();
      fetchAdditionalData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete delivery record.",
        variant: "destructive",
      });
    }
  }

  function handleUpdate() {
    fetchDeliveries();
    fetchAdditionalData();
  }

  function handlePrint() {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  }

  // Calculate totals using helper functions
  const totalGross = deliveries.reduce(
    (sum, delivery) => sum + getGrossAmount(delivery),
    0
  );
  const totalNet = deliveries.reduce(
    (sum, delivery) => sum + getNetAmount(delivery),
    0
  );

  // Group deliveries by client
  const deliveriesByClient = deliveries.reduce((acc, delivery) => {
    const clientName = delivery.project.client.name;
    if (!acc[clientName]) {
      acc[clientName] = [];
    }
    acc[clientName].push(delivery);
    return acc;
  }, {} as Record<string, Delivery[]>);

  return (
    <>
      <Card className={isPrinting ? "print:shadow-none print:border-none" : ""}>
        <CardHeader className="print:hidden">
          <CardTitle>Select Monthly Delivery Sheet</CardTitle>
          {/* <CardDescription>
            View and export project deliveries for the selected month
          </CardDescription> */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-40">
                <Select
                  value={month.toString()}
                  onValueChange={(value) => setMonth(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value.toString()}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32">
                <Select
                  value={year.toString()}
                  onValueChange={(value) => setYear(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y.value} value={y.value.toString()}>
                        {y.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={deliveries.length === 0}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("csv")}
                disabled={isExporting || deliveries.length === 0}
              >
                <FileText className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("json")}
                disabled={isExporting || deliveries.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Print Header */}
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-bold text-center">
              Monthly Delivery Sheet
            </h1>
            <h2 className="text-xl text-center mb-4">
              {getMonthName(month)} {year}
            </h2>
          </div>

          {/* Target Information */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              Monthly Target Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Target:</span>
                <div className="font-medium">
                  {formatCurrency(monthlyTarget || 0)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Delivered:</span>
                <div className="font-medium">{formatCurrency(totalNet)}</div>
              </div>
              <div>
                <span className="text-gray-600">Remaining:</span>
                <div
                  className={`font-medium ${
                    (monthlyTarget || 0) - totalNet > 0
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {formatCurrency(Math.max(0, (monthlyTarget || 0) - totalNet))}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Progress:</span>
                <div className="font-medium">
                  {monthlyTarget > 0
                    ? ((totalNet / monthlyTarget) * 100).toFixed(1)
                    : 0}
                  %
                </div>
              </div>
            </div>
          </div>

          {/* User Summary Section */}
          {userSummary.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">
                Monthly User Summary
              </h3>
              <div className="overflow-x-auto">
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="border">Contributor</TableHead>
                      <TableHead className="border text-right">
                        Deliveries
                      </TableHead>
                      <TableHead className="border text-right">
                        Gross Total
                      </TableHead>
                      <TableHead className="border text-right">
                        Net Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userSummary.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell className="border font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell className="border text-right">
                          {Number(user.delivery_count || 0)}
                        </TableCell>
                        <TableCell className="border text-right">
                          {formatCurrency(Number(user.total_gross || 0))}
                        </TableCell>
                        <TableCell className="border text-right">
                          {formatCurrency(Number(user.total_net || 0))}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-100 font-bold">
                      <TableCell className="border">Total</TableCell>
                      <TableCell className="border text-right">
                        {userSummary.reduce(
                          (sum, user) => sum + Number(user.delivery_count || 0),
                          0
                        )}
                      </TableCell>
                      <TableCell className="border text-right">
                        {formatCurrency(
                          userSummary.reduce(
                            (sum, user) => sum + Number(user.total_gross || 0),
                            0
                          )
                        )}
                      </TableCell>
                      <TableCell className="border text-right">
                        {formatCurrency(
                          userSummary.reduce(
                            (sum, user) => sum + Number(user.total_net || 0),
                            0
                          )
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading...</p>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p>
                No delivery records found for {getMonthName(month)} {year}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <h3 className="text-lg font-semibold mb-4">
                Monthly Delivery Record
              </h3>
              <Table className="border-collapse w-full">
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="border">Client Name</TableHead>
                    <TableHead className="border">Project Name</TableHead>
                    <TableHead className="border">Delivery Date</TableHead>
                    <TableHead className="border">Role</TableHead>
                    <TableHead className="border text-right">
                      Gross Delivery
                    </TableHead>
                    <TableHead className="border text-right">
                      Net Delivery
                    </TableHead>
                    <TableHead className="border">Contributor</TableHead>
                    <TableHead className="border">Description</TableHead>
                    <TableHead className="border print:hidden">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(deliveriesByClient).map(
                    ([clientName, clientDeliveries]) => {
                      // Calculate client totals using helper functions
                      const clientGrossTotal = clientDeliveries.reduce(
                        (sum, d) => sum + getGrossAmount(d),
                        0
                      );
                      const clientNetTotal = clientDeliveries.reduce(
                        (sum, d) => sum + getNetAmount(d),
                        0
                      );

                      return (
                        <React.Fragment key={clientName}>
                          {clientDeliveries.map((delivery, index) => (
                            <TableRow
                              key={delivery.id}
                              className="hover:bg-gray-50"
                            >
                              <TableCell className="border">
                                {delivery.project.client.name}
                              </TableCell>
                              <TableCell className="border">
                                {delivery.project.name}
                              </TableCell>
                              <TableCell className="border">
                                {formatDate(delivery.delivery_date)}
                              </TableCell>
                              <TableCell className="border">
                                {delivery.role}
                              </TableCell>
                              <TableCell className="border text-right">
                                {formatCurrency(getGrossAmount(delivery))}
                              </TableCell>
                              <TableCell className="border text-right">
                                {formatCurrency(getNetAmount(delivery))}
                              </TableCell>
                              <TableCell className="border">
                                {delivery.user.name}
                              </TableCell>
                              <TableCell className="border max-w-xs truncate">
                                {delivery.description}
                              </TableCell>
                              <TableCell className="border print:hidden">
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(delivery)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(delivery.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {/* Client subtotal row */}
                          <TableRow
                            key={`${clientName}-subtotal`}
                            className="bg-gray-50"
                          >
                            <TableCell
                              colSpan={4}
                              className="border font-medium text-right"
                            >
                              {clientName} Subtotal:
                            </TableCell>
                            <TableCell className="border text-right font-medium">
                              {formatCurrency(clientGrossTotal)}
                            </TableCell>
                            <TableCell className="border text-right font-medium">
                              {formatCurrency(clientNetTotal)}
                            </TableCell>
                            <TableCell
                              colSpan={3}
                              className="border"
                            ></TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    }
                  )}
                  {/* Grand total row */}
                  <TableRow className="bg-gray-100 font-bold">
                    <TableCell colSpan={4} className="border text-right">
                      Grand Total:
                    </TableCell>
                    <TableCell className="border text-right">
                      {formatCurrency(totalGross)}
                    </TableCell>
                    <TableCell className="border text-right">
                      {formatCurrency(totalNet)}
                    </TableCell>
                    <TableCell colSpan={3} className="border"></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      <DeliveryEditModal
        delivery={editingDelivery}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdate}
        projects={projects}
        users={users}
      />

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: visible;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .container {
            max-width: 100% !important;
            padding: 0 !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th,
          td {
            border: 1px solid #ddd !important;
            padding: 8px !important;
          }
          th {
            background-color: #f2f2f2 !important;
            font-weight: bold !important;
          }
        }
      `}</style>
    </>
  );
}

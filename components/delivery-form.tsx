"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { calculateNetAmount } from "@/lib/utils"

interface Project {
  id: number
  name: string
  client: {
    name: string
  }
}

interface User {
  id: number
  name: string
}

export default function DeliveryForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isGross, setIsGross] = useState(true)
  const [formData, setFormData] = useState({
    projectId: "",
    userId: "",
    role: "",
    description: "",
    deliveryDate: new Date().toISOString().split("T")[0],
    amount: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  const roles = [
    "Frontend (App)",
    "Frontend (Web)",
    "Backend",
    "API Implemented",
    "UI/UX",
    "AI Development",
    "Deployment",
    "Other",
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsResponse, usersResponse] = await Promise.all([fetch("/api/projects"), fetch("/api/users")])

        if (!projectsResponse.ok) {
          throw new Error("Failed to fetch projects")
        }
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users")
        }

        const projectsData = await projectsResponse.json()
        const usersData = await usersResponse.json()

        setProjects(projectsData)
        setUsers(usersData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [toast])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSelectChange(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form data
      if (
        !formData.projectId ||
        !formData.userId ||
        !formData.role ||
        !formData.description ||
        !formData.deliveryDate ||
        !formData.amount
      ) {
        throw new Error("All fields are required")
      }

      const amount = Number.parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Amount must be a valid positive number")
      }

      const response = await fetch("/api/deliveries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: Number.parseInt(formData.projectId),
          userId: Number.parseInt(formData.userId),
          role: formData.role,
          description: formData.description,
          deliveryDate: formData.deliveryDate,
          grossAmount: amount,
          isGross,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create delivery")
      }

      toast({
        title: "Success",
        description: "Delivery record created successfully.",
      })

      router.push("/monthly-sheet")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create delivery record",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate the net amount (80% of gross) for display
  const netAmount = formData.amount
    ? isGross
      ? calculateNetAmount(Number.parseFloat(formData.amount)).toFixed(2)
      : formData.amount
    : "0.00"

  // Calculate the gross amount (125% of net) for display
  const grossAmount = formData.amount
    ? isGross
      ? formData.amount
      : (Number.parseFloat(formData.amount) / 0.8).toFixed(2)
    : "0.00"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Delivery Record</CardTitle>
        <CardDescription>Record a new project delivery contribution</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectId">Project</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => handleSelectChange("projectId", value)}
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
            <Select value={formData.userId} onValueChange={(value) => handleSelectChange("userId", value)} required>
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
            <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)} required>
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
              <Label htmlFor="amount">{isGross ? "Gross Amount" : "Net Amount"}</Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="isGross" className="text-sm">
                  {isGross ? "Gross" : "Net"}
                </Label>
                <Switch id="isGross" checked={isGross} onCheckedChange={setIsGross} />
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
              {isGross ? `Net amount (after 20% deduction): $${netAmount}` : `Gross amount: $${grossAmount}`}
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
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Delivery Record"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

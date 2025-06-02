"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Client {
  id: number
  name: string
}

export default function ProjectForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    totalGrossDelivery: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch("/api/clients")
        if (!response.ok) {
          throw new Error("Failed to fetch clients")
        }
        const data = await response.json()
        setClients(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load clients. Please try again.",
          variant: "destructive",
        })
      }
    }

    fetchClients()
  }, [toast])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          clientId: Number.parseInt(formData.clientId),
          totalGrossDelivery: Number.parseFloat(formData.totalGrossDelivery),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create project")
      }

      toast({
        title: "Success",
        description: "Project created successfully.",
      })

      router.push("/projects")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>Add a new project to the tracking system</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientId">Client</Label>
            <Select value={formData.clientId} onValueChange={(value) => handleSelectChange("clientId", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalGrossDelivery">Total Gross Delivery Amount</Label>
            <Input
              id="totalGrossDelivery"
              name="totalGrossDelivery"
              type="number"
              step="0.01"
              value={formData.totalGrossDelivery}
              onChange={handleChange}
              placeholder="Enter gross amount"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

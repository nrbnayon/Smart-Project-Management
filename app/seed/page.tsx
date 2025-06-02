"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSeedData() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/seed-data", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to seed data")
      }

      toast({
        title: "Success",
        description: "Sample data seeded successfully.",
      })

      router.push("/monthly-sheet")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to seed sample data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Seed Sample Data</CardTitle>
            <CardDescription>Add example data to the system for demonstration purposes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">This will add the following sample data to your system:</p>
            <div className="text-sm space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p>
                  <strong>Client:</strong> sux_go
                </p>
                <p>
                  <strong>Project:</strong> Ai Finance HUB
                </p>
                <p>
                  <strong>Contributors:</strong> Abir Rahman, Shakib Ahmed
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p>
                  <strong>Client:</strong> xavfreakinrican
                </p>
                <p>
                  <strong>Project:</strong> ZenActive
                </p>
                <p>
                  <strong>Contributors:</strong> Zaman Khan
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSeedData} disabled={isLoading} className="w-full">
              {isLoading ? "Seeding Data..." : "Seed Sample Data"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

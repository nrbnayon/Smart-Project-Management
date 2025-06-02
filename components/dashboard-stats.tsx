"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, getMonthName } from "@/lib/utils"

interface DeliverySummary {
  month: number
  year: number
  totalGross: number
  totalNet: number
}

interface UserSummary {
  userId: number
  userName: string
  totalGross: number
  totalNet: number
}

export default function DashboardStats() {
  const [isLoading, setIsLoading] = useState(true)
  const [monthlySummary, setMonthlySummary] = useState<DeliverySummary[]>([])
  const [userSummary, setUserSummary] = useState<UserSummary[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const { toast } = useToast()

  useEffect(() => {
    async function fetchSummaryData() {
      setIsLoading(true)
      try {
        // This would be a real API endpoint in a production app
        // For this example, we'll simulate the data

        // Simulate monthly data for the last 6 months
        const months = []
        let month = currentMonth
        let year = currentYear

        for (let i = 0; i < 6; i++) {
          months.push({
            month,
            year,
            totalGross: Math.floor(Math.random() * 10000) + 5000,
            totalNet: Math.floor(Math.random() * 8000) + 4000,
          })

          month--
          if (month < 1) {
            month = 12
            year--
          }
        }

        setMonthlySummary(months)

        // Simulate user summary data
        const users = [
          { userId: 1, userName: "Abir Rahman", totalGross: 5000, totalNet: 4000 },
          { userId: 2, userName: "Shakib Ahmed", totalGross: 3000, totalNet: 2400 },
          { userId: 3, userName: "Zaman Khan", totalGross: 4500, totalNet: 3600 },
          { userId: 4, userName: "Nayon Kanti", totalGross: 6000, totalNet: 4800 },
        ]

        setUserSummary(users)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSummaryData()
  }, [currentMonth, currentYear, toast])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
          <CardDescription>Revenue overview for the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlySummary.map((summary, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-semibold text-sm text-gray-600">
                  {getMonthName(summary.month)} {summary.year}
                </h4>
                <div className="mt-2">
                  <div className="text-lg font-bold text-green-600">{formatCurrency(summary.totalNet)}</div>
                  <div className="text-sm text-gray-500">Gross: {formatCurrency(summary.totalGross)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Top Contributors</CardTitle>
          <CardDescription>User contributions for current month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userSummary.map((user) => (
              <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{user.userName}</h4>
                  <p className="text-sm text-gray-500">User ID: {user.userId}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{formatCurrency(user.totalNet)}</div>
                  <div className="text-sm text-gray-500">Gross: {formatCurrency(user.totalGross)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, getMonthName } from "@/lib/utils"
import { BarChart3, TrendingUp, Users } from "lucide-react"

interface UserSummary {
  id: number
  name: string
  delivery_count: number
  total_gross: number
  total_net: number
}

interface ClientSummary {
  client_name: string
  delivery_count: number
  total_gross: number
  total_net: number
}

interface PhaseSummary {
  phase: string
  delivery_count: number
  total_gross: number
  total_net: number
}

export default function UserDeliverySummary() {
  const [isLoading, setIsLoading] = useState(true)
  const [userSummary, setUserSummary] = useState<UserSummary[]>([])
  const [clientSummary, setClientSummary] = useState<ClientSummary[]>([])
  const [phaseSummary, setPhaseSummary] = useState<PhaseSummary[]>([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const { toast } = useToast()

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1),
  }))

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: year - 2 + i,
    label: `${year - 2 + i}`,
  }))

  useEffect(() => {
    fetchSummaryData()
  }, [month, year])

  async function fetchSummaryData() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/monthly-summary?month=${month}&year=${year}`)

      if (!response.ok) {
        throw new Error("Failed to fetch summary data")
      }

      const data = await response.json()
      setUserSummary(data.userSummary || [])
      setClientSummary(data.clientSummary || [])
      setPhaseSummary(data.phaseSummary || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load summary data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Month/Year Selector */}
      <div className="flex items-center gap-4">
        <div className="w-40">
          <Select value={month.toString()} onValueChange={(value) => setMonth(Number.parseInt(value))}>
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
          <Select value={year.toString()} onValueChange={(value) => setYear(Number.parseInt(value))}>
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

      {/* User Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Delivery Summary - {getMonthName(month)} {year}
          </CardTitle>
          <CardDescription>Individual contributor performance for the selected month</CardDescription>
        </CardHeader>
        <CardContent>
          {userSummary.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No delivery data found for this month</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSummary.map((user) => (
                <div key={user.id} className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <h4 className="font-semibold text-lg">{user.name}</h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Deliveries:</span>
                      <span className="font-medium">{user.delivery_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Net Total:</span>
                      <span className="font-medium text-green-600">{formatCurrency(user.total_net)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gross Total:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(user.total_gross)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Client Summary
          </CardTitle>
          <CardDescription>Revenue breakdown by client for the selected month</CardDescription>
        </CardHeader>
        <CardContent>
          {clientSummary.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No client data found for this month</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clientSummary.map((client, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                  <h4 className="font-semibold text-lg">{client.client_name}</h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Deliveries:</span>
                      <span className="font-medium">{client.delivery_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Net Total:</span>
                      <span className="font-medium text-green-600">{formatCurrency(client.total_net)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gross Total:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(client.total_gross)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Phase Summary
          </CardTitle>
          <CardDescription>Revenue breakdown by project phase for the selected month</CardDescription>
        </CardHeader>
        <CardContent>
          {phaseSummary.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No phase data found for this month</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phaseSummary.map((phase, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                  <h4 className="font-semibold text-lg">{phase.phase}</h4>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Deliveries:</span>
                      <span className="font-medium">{phase.delivery_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Net Total:</span>
                      <span className="font-medium text-green-600">{formatCurrency(phase.total_net)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Gross Total:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(phase.total_gross)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

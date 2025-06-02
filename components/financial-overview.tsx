"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency, getMonthName } from "@/lib/utils"
import { TrendingUp, Target, DollarSign, Calendar, Settings } from "lucide-react"

interface FinancialData {
  totalWorkLoad: number
  currentMonthWorkLoad: number
  currentMonthTarget: number
  currentMonthTotalDelivery: number
  expectedDue: number
  upcomingMonth: number
  totalWorkDone: number
  estimatedDelivery: number
  stillWorkingThisMonth: number
  month: number
  year: number
}

export default function FinancialOverview() {
  const [isLoading, setIsLoading] = useState(true)
  const [financialData, setFinancialData] = useState<FinancialData | null>(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [isSettingTarget, setIsSettingTarget] = useState(false)
  const [newTarget, setNewTarget] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)

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
    fetchFinancialData()
    fetchCurrentUser()
  }, [month, year])

  async function fetchCurrentUser() {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  async function fetchFinancialData() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/financial-overview?month=${month}&year=${year}`)

      if (!response.ok) {
        throw new Error("Failed to fetch financial data")
      }

      const data = await response.json()
      setFinancialData(data)
      setNewTarget(data.currentMonthTarget.toString())
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load financial data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSetTarget() {
    if (!newTarget || isNaN(Number.parseFloat(newTarget))) {
      toast({
        title: "Error",
        description: "Please enter a valid target amount.",
        variant: "destructive",
      })
      return
    }

    setIsSettingTarget(true)
    try {
      const response = await fetch("/api/monthly-targets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month,
          year,
          targetAmount: Number.parseFloat(newTarget),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to set target")
      }

      toast({
        title: "Success",
        description: "Monthly target updated successfully.",
      })

      fetchFinancialData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set monthly target. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSettingTarget(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading financial overview...</p>
      </div>
    )
  }

  if (!financialData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Failed to load financial data</p>
      </div>
    )
  }

  const isCurrentMonth = month === new Date().getMonth() + 1 && year === new Date().getFullYear()
  const targetProgress =
    financialData.currentMonthTarget > 0
      ? (financialData.currentMonthTotalDelivery / financialData.currentMonthTarget) * 100
      : 0

  return (
    <div className="space-y-6">
      {/* Month/Year Selector */}
      <div className="flex items-center gap-4 mb-6">
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

      {/* Admin Target Setting */}
      {currentUser?.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Monthly Target Management
            </CardTitle>
            <CardDescription>
              Set or modify the delivery target for {getMonthName(month)} {year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="target">Target Amount</Label>
                <Input
                  id="target"
                  type="number"
                  step="0.01"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="Enter target amount"
                />
              </div>
              <Button onClick={handleSetTarget} disabled={isSettingTarget}>
                {isSettingTarget ? "Setting..." : "Set Target"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Work Load</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.totalWorkLoad)}</div>
            <p className="text-xs text-muted-foreground">All projects combined gross delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Month Work Load</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.currentMonthWorkLoad)}</div>
            <p className="text-xs text-muted-foreground">
              {getMonthName(month)} {year} gross deliveries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Month Target</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.currentMonthTarget)}</div>
            <p className="text-xs text-muted-foreground">Monthly delivery target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Month Total Delivery</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.currentMonthTotalDelivery)}</div>
            <p className="text-xs text-muted-foreground">Net deliveries completed</p>
            {financialData.currentMonthTarget > 0 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{targetProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, targetProgress)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Due</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(financialData.expectedDue)}</div>
            <p className="text-xs text-muted-foreground">Remaining to reach target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {financialData.upcomingMonth > 0 ? formatCurrency(financialData.upcomingMonth) : "Not Set"}
            </div>
            <p className="text-xs text-muted-foreground">Next month target</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Work Done</CardTitle>
            <CardDescription>All-time net deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatCurrency(financialData.totalWorkDone)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimated Delivery</CardTitle>
            <CardDescription>All-time gross deliveries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(financialData.estimatedDelivery)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Still Working This Month</CardTitle>
            <CardDescription>Remaining work in progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(financialData.stillWorkingThisMonth)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Target Status */}
      {financialData.currentMonthTarget > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Target Analysis for {getMonthName(month)} {year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Target Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-medium">{formatCurrency(financialData.currentMonthTarget)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivered:</span>
                    <span className="font-medium">{formatCurrency(financialData.currentMonthTotalDelivery)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span
                      className={`font-medium ${financialData.expectedDue > 0 ? "text-orange-600" : "text-green-600"}`}
                    >
                      {formatCurrency(financialData.expectedDue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Progress:</span>
                    <span className="font-medium">{targetProgress.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Status</h4>
                <div className="space-y-2">
                  {targetProgress >= 100 ? (
                    <div className="p-3 bg-green-100 text-green-800 rounded-lg">
                      🎉 Target Achieved! Exceeded by{" "}
                      {formatCurrency(financialData.currentMonthTotalDelivery - financialData.currentMonthTarget)}
                    </div>
                  ) : targetProgress >= 80 ? (
                    <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg">
                      ⚡ Almost There! {formatCurrency(financialData.expectedDue)} remaining
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-100 text-blue-800 rounded-lg">
                      🎯 In Progress: {formatCurrency(financialData.expectedDue)} to go
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

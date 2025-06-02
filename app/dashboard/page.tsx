import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { sql } from "@/lib/db"
import { formatCurrency, getCurrentMonthYear, getMonthName } from "@/lib/utils"
import { BarChart3, FileText, Plus, Users, TrendingUp } from "lucide-react"
import { isAdmin } from './../../lib/auth';

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const { month, year } = getCurrentMonthYear()

  // Get current month statistics
  const currentMonthDeliveries = await sql`
    SELECT 
      COUNT(*) as total_deliveries,
      SUM(gross_amount) as total_gross,
      SUM(net_amount) as total_net
    FROM deliveries 
    WHERE month = ${month} AND year = ${year}
  `

  // Get user's deliveries for current month
  const userDeliveries = await sql`
    SELECT 
      COUNT(*) as user_deliveries,
      SUM(gross_amount) as user_gross,
      SUM(net_amount) as user_net
    FROM deliveries 
    WHERE user_id = ${user.id} AND month = ${month} AND year = ${year}
  `

  // Get total projects and clients
  const projectStats = await sql`
    SELECT 
      (SELECT COUNT(*) FROM projects) as total_projects,
      (SELECT COUNT(*) FROM clients) as total_clients,
      (SELECT COUNT(*) FROM users) as total_users
  `

  const stats = currentMonthDeliveries[0]
  const userStats = userDeliveries[0]
  const generalStats = projectStats[0]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>

      {/* Current Month Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getMonthName(month)} Deliveries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_deliveries || 0}</div>
            <p className="text-xs text-muted-foreground">Total deliveries this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total_net || 0)}</div>
            <p className="text-xs text-muted-foreground">Net amount this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Contributions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.user_deliveries || 0}</div>
            <p className="text-xs text-muted-foreground">Your deliveries this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Earnings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(userStats.user_net || 0)}</div>
            <p className="text-xs text-muted-foreground">Your net earnings this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Delivery</CardTitle>
            <CardDescription>Record a new project delivery contribution</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/deliveries/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Delivery
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Monthly Sheet</CardTitle>
            <CardDescription>View and export monthly delivery reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/monthly-sheet">
                <FileText className="h-4 w-4 mr-2" />
                Monthly Sheet
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Summary Reports</CardTitle>
            <CardDescription>Detailed breakdown by users, clients, and phases</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/summary">
                <BarChart3 className="h-4 w-4 mr-2" />
                Summary Reports
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Projects</CardTitle>
            <CardDescription>Create and manage project information</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/projects">
                <BarChart3 className="h-4 w-4 mr-2" />
                Projects
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Comprehensive financial metrics and target management</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/financial-overview">
                <TrendingUp className="h-4 w-4 mr-2" />
                Financial Overview
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>General statistics about the tracking system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{generalStats.total_projects || 0}</div>
              <p className="text-sm text-gray-600">Total Projects</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{generalStats.total_clients || 0}</div>
              <p className="text-sm text-gray-600">Total Clients</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{generalStats.total_users || 0}</div>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">Monthly Project Delivery Tracker</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track project deliveries, manage team contributions, and generate comprehensive reports with our powerful
            project management system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>

        <div id="features" className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Project Tracking</CardTitle>
              <CardDescription>Comprehensive project and delivery management</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track multiple projects, clients, and delivery phases with detailed contribution records and automatic
                calculations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Collaboration</CardTitle>
              <CardDescription>Role-based access and user management</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Secure authentication with admin and user roles, allowing teams to collaborate effectively on project
                tracking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export & Reports</CardTitle>
              <CardDescription>Generate comprehensive reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Export monthly sheets to Excel, CSV, or JSON formats with detailed delivery information and financial
                summaries.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to streamline your project tracking?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join teams already using our platform to manage their project deliveries efficiently.
          </p>
          <Button asChild size="lg">
            <Link href="/login">Start Tracking Today</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

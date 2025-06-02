import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { sql } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
import { Plus } from "lucide-react"

export default async function ProjectsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Get all projects with client information
  const projects = await sql`
    SELECT p.*, c.name as client_name
    FROM projects p
    JOIN clients c ON p.client_id = c.id
    ORDER BY c.name, p.name
  `

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your project portfolio</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription>Client: {project.client_name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Gross Delivery:</span>
                  <span className="font-medium">{formatCurrency(project.total_gross_delivery)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Net Delivery:</span>
                  <span className="font-medium">{formatCurrency(project.total_net_delivery)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No projects found</p>
          <Button asChild>
            <Link href="/projects/new">Create your first project</Link>
          </Button>
        </div>
      )}
    </div>
  )
}

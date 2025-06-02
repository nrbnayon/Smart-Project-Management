import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import ProjectForm from "@/components/project-form"
import ClientForm from "@/components/client-form"
import { sql } from "@/lib/db"

export default async function NewProjectPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Get all clients for the project form
  const clients = await sql`SELECT * FROM clients ORDER BY name`

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600">Add a new project to the tracking system</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <ProjectForm />
        </div>
        <div>
          <ClientForm />
          {clients.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Existing Clients</h3>
              <div className="space-y-2">
                {clients.map((client) => (
                  <div key={client.id} className="p-3 bg-gray-50 rounded-lg border">
                    {client.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

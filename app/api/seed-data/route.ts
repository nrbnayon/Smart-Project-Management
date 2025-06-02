import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Sample data from the example
    const sampleData = [
      {
        clientName: "sux_go",
        projectName: "Ai Finance HUB",
        deliveryDate: "2025-05-05",
        role: "Frontend (App)",
        grossAmount: 2000,
        netAmount: 1600,
        contributor: "Abir Rahman",
        description: "Bank API Implemented",
      },
      {
        clientName: "sux_go",
        projectName: "Ai Finance HUB",
        deliveryDate: "2025-05-07",
        role: "Backend",
        grossAmount: 2000,
        netAmount: 1600,
        contributor: "Shakib Ahmed",
        description: "API Implemented - App",
      },
      {
        clientName: "xavfreakinrican",
        projectName: "ZenActive",
        deliveryDate: "2025-05-10",
        role: "AI Development",
        grossAmount: 800,
        netAmount: 640,
        contributor: "Zaman Khan",
        description: "GeminiAI",
      },
    ]

    // Process each sample data entry
    for (const entry of sampleData) {
      // Find or create client
      const client = await sql`SELECT id FROM clients WHERE name = ${entry.clientName} LIMIT 1`
      let clientId

      if (client.length === 0) {
        const newClient = await sql`INSERT INTO clients (name) VALUES (${entry.clientName}) RETURNING id`
        clientId = newClient[0].id
      } else {
        clientId = client[0].id
      }

      // Find or create project
      const project = await sql`
        SELECT id FROM projects 
        WHERE name = ${entry.projectName} AND client_id = ${clientId} 
        LIMIT 1
      `
      let projectId

      if (project.length === 0) {
        const newProject = await sql`
          INSERT INTO projects (name, client_id, total_gross_delivery, total_net_delivery) 
          VALUES (${entry.projectName}, ${clientId}, ${entry.grossAmount}, ${entry.netAmount}) 
          RETURNING id
        `
        projectId = newProject[0].id
      } else {
        projectId = project[0].id
      }

      // Find contributor
      const contributor = await sql`SELECT id FROM users WHERE name = ${entry.contributor} LIMIT 1`

      if (contributor.length === 0) {
        // Skip if contributor doesn't exist
        continue
      }

      const contributorId = contributor[0].id

      // Parse delivery date
      const deliveryDate = new Date(entry.deliveryDate)
      const month = deliveryDate.getMonth() + 1
      const year = deliveryDate.getFullYear()

      // Create delivery record
      await sql`
        INSERT INTO deliveries (
          project_id, user_id, role, description, delivery_date, 
          gross_amount, net_amount, month, year
        ) 
        VALUES (
          ${projectId}, ${contributorId}, ${entry.role}, ${entry.description}, 
          ${entry.deliveryDate}, ${entry.grossAmount}, ${entry.netAmount}, 
          ${month}, ${year}
        )
      `
    }

    return NextResponse.json({ message: "Sample data seeded successfully" })
  } catch (error) {
    console.error("Error seeding data:", error)
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 })
  }
}

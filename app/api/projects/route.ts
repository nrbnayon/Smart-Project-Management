import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { calculateNetAmount } from "@/lib/utils"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allProjects = await sql`
      SELECT p.*, c.name as client_name
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      ORDER BY p.name
    `

    const formattedProjects = allProjects.map((project) => ({
      ...project,
      client: { name: project.client_name },
    }))

    return NextResponse.json(formattedProjects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, clientId, totalGrossDelivery } = await request.json()

    // Calculate net delivery (80% of gross)
    const totalNetDelivery = calculateNetAmount(totalGrossDelivery)

    const newProject = await sql`
      INSERT INTO projects (name, client_id, total_gross_delivery, total_net_delivery)
      VALUES (${name}, ${clientId}, ${totalGrossDelivery}, ${totalNetDelivery})
      RETURNING *
    `

    return NextResponse.json(newProject[0], { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}

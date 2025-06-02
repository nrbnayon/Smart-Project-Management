import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const allClients = await sql`SELECT * FROM clients ORDER BY name`

    return NextResponse.json(allClients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await request.json()

    // Check if client already exists
    const existingClient = await sql`SELECT id FROM clients WHERE name = ${name}`

    if (existingClient.length > 0) {
      return NextResponse.json({ error: "Client with this name already exists" }, { status: 400 })
    }

    const newClient = await sql`
      INSERT INTO clients (name) 
      VALUES (${name}) 
      RETURNING *
    `

    return NextResponse.json(newClient[0], { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}

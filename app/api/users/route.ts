import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "admin" && user.role !== "user") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const allUsers = await sql`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY name
    `

    return NextResponse.json(allUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

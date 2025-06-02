import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const month = url.searchParams.get("month")
    const year = url.searchParams.get("year")

    if (month && year) {
      // Get specific month target
      const target = await sql`
        SELECT * FROM monthly_targets 
        WHERE month = ${Number.parseInt(month)} AND year = ${Number.parseInt(year)}
        LIMIT 1
      `
      return NextResponse.json(target[0] || null)
    } else {
      // Get all targets
      const targets = await sql`
        SELECT * FROM monthly_targets 
        ORDER BY year DESC, month DESC
      `
      return NextResponse.json(targets)
    }
  } catch (error) {
    console.error("Error fetching monthly targets:", error)
    return NextResponse.json({ error: "Failed to fetch monthly targets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const { month, year, targetAmount } = await request.json()

    if (!month || !year || targetAmount === undefined) {
      return NextResponse.json({ error: "Month, year, and target amount are required" }, { status: 400 })
    }

    // Check if target already exists for this month/year
    const existingTarget = await sql`
      SELECT id FROM monthly_targets 
      WHERE month = ${month} AND year = ${year}
      LIMIT 1
    `

    if (existingTarget.length > 0) {
      // Update existing target
      const updatedTarget = await sql`
        UPDATE monthly_targets 
        SET target_amount = ${targetAmount}, updated_at = NOW()
        WHERE month = ${month} AND year = ${year}
        RETURNING *
      `
      return NextResponse.json(updatedTarget[0])
    } else {
      // Create new target
      const newTarget = await sql`
        INSERT INTO monthly_targets (month, year, target_amount)
        VALUES (${month}, ${year}, ${targetAmount})
        RETURNING *
      `
      return NextResponse.json(newTarget[0], { status: 201 })
    }
  } catch (error) {
    console.error("Error creating/updating monthly target:", error)
    return NextResponse.json({ error: "Failed to create/update monthly target" }, { status: 500 })
  }
}

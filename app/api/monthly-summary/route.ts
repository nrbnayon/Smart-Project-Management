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

    if (!month || !year) {
      return NextResponse.json({ error: "Month and year are required" }, { status: 400 })
    }

    // Get user summary for the month
    const userSummary = await sql`
      SELECT 
        u.id,
        u.name,
        COUNT(d.id) as delivery_count,
        COALESCE(SUM(d.gross_amount), 0) as total_gross,
        COALESCE(SUM(d.net_amount), 0) as total_net
      FROM users u
      LEFT JOIN deliveries d ON u.id = d.user_id 
        AND d.month = ${Number.parseInt(month)} 
        AND d.year = ${Number.parseInt(year)}
      GROUP BY u.id, u.name
      HAVING COUNT(d.id) > 0
      ORDER BY total_net DESC
    `

    // Get client summary for the month
    const clientSummary = await sql`
      SELECT 
        c.name as client_name,
        COUNT(d.id) as delivery_count,
        COALESCE(SUM(d.gross_amount), 0) as total_gross,
        COALESCE(SUM(d.net_amount), 0) as total_net
      FROM clients c
      JOIN projects p ON c.id = p.client_id
      JOIN deliveries d ON p.id = d.project_id
      WHERE d.month = ${Number.parseInt(month)} AND d.year = ${Number.parseInt(year)}
      GROUP BY c.id, c.name
      ORDER BY total_net DESC
    `

    // Get phase summary for the month
    const phaseSummary = await sql`
      SELECT 
        d.role as phase,
        COUNT(d.id) as delivery_count,
        COALESCE(SUM(d.gross_amount), 0) as total_gross,
        COALESCE(SUM(d.net_amount), 0) as total_net
      FROM deliveries d
      WHERE d.month = ${Number.parseInt(month)} AND d.year = ${Number.parseInt(year)}
      GROUP BY d.role
      ORDER BY total_net DESC
    `

    return NextResponse.json({
      userSummary,
      clientSummary,
      phaseSummary,
    })
  } catch (error) {
    console.error("Error fetching monthly summary:", error)
    return NextResponse.json({ error: "Failed to fetch monthly summary" }, { status: 500 })
  }
}

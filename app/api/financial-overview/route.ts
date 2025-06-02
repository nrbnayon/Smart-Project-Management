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
    const month = url.searchParams.get("month") || new Date().getMonth() + 1
    const year = url.searchParams.get("year") || new Date().getFullYear()

    // Get total work load (all projects total gross delivery)
    const totalWorkLoad = await sql`
      SELECT COALESCE(SUM(total_gross_delivery), 0) as total_work_load
      FROM projects
    `

    // Get current month work load (deliveries for current month)
    const currentMonthWorkLoad = await sql`
      SELECT COALESCE(SUM(gross_amount), 0) as current_month_work_load
      FROM deliveries
      WHERE month = ${Number.parseInt(month.toString())} AND year = ${Number.parseInt(year.toString())}
    `

    // Get monthly target
    const monthlyTarget = await sql`
      SELECT target_amount FROM monthly_targets
      WHERE month = ${Number.parseInt(month.toString())} AND year = ${Number.parseInt(year.toString())}
      LIMIT 1
    `

    // Get current month total delivery (net amount)
    const currentMonthDelivery = await sql`
      SELECT COALESCE(SUM(net_amount), 0) as current_month_delivery
      FROM deliveries
      WHERE month = ${Number.parseInt(month.toString())} AND year = ${Number.parseInt(year.toString())}
    `

    // Get total work done (all time net deliveries)
    const totalWorkDone = await sql`
      SELECT COALESCE(SUM(net_amount), 0) as total_work_done
      FROM deliveries
    `

    // Get estimated delivery (all time gross deliveries)
    const estimatedDelivery = await sql`
      SELECT COALESCE(SUM(gross_amount), 0) as estimated_delivery
      FROM deliveries
    `

    // Calculate derived values
    const targetAmount = monthlyTarget[0]?.target_amount || 0
    const currentDelivery = currentMonthDelivery[0].current_month_delivery
    const expectedDue = Math.max(0, targetAmount - currentDelivery)
    const stillWorkingThisMonth = Math.max(0, currentMonthWorkLoad[0].current_month_work_load - currentDelivery)

    // Get next month data (placeholder for now)
    const nextMonth = month == 12 ? 1 : Number.parseInt(month.toString()) + 1
    const nextYear = month == 12 ? Number.parseInt(year.toString()) + 1 : Number.parseInt(year.toString())

    const upcomingMonthTarget = await sql`
      SELECT target_amount FROM monthly_targets
      WHERE month = ${nextMonth} AND year = ${nextYear}
      LIMIT 1
    `

    return NextResponse.json({
      totalWorkLoad: totalWorkLoad[0].total_work_load,
      currentMonthWorkLoad: currentMonthWorkLoad[0].current_month_work_load,
      currentMonthTarget: targetAmount,
      currentMonthTotalDelivery: currentDelivery,
      expectedDue: expectedDue,
      upcomingMonth: upcomingMonthTarget[0]?.target_amount || 0,
      totalWorkDone: totalWorkDone[0].total_work_done,
      estimatedDelivery: estimatedDelivery[0].estimated_delivery,
      stillWorkingThisMonth: stillWorkingThisMonth,
      month: Number.parseInt(month.toString()),
      year: Number.parseInt(year.toString()),
    })
  } catch (error) {
    console.error("Error fetching financial overview:", error)
    return NextResponse.json({ error: "Failed to fetch financial overview" }, { status: 500 })
  }
}

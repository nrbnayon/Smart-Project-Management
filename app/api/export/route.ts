import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { formatDate } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const month = url.searchParams.get("month")
    const year = url.searchParams.get("year")
    const format = url.searchParams.get("format") || "json"

    if (!month || !year) {
      return NextResponse.json({ error: "Month and year are required" }, { status: 400 })
    }

    // Get all deliveries for the specified month and year
    const monthlyDeliveries = await sql`
      SELECT d.*, 
             p.name as project_name,
             c.name as client_name,
             u.name as user_name
      FROM deliveries d
      JOIN projects p ON d.project_id = p.id
      JOIN clients c ON p.client_id = c.id
      JOIN users u ON d.user_id = u.id
      WHERE d.month = ${Number.parseInt(month)} AND d.year = ${Number.parseInt(year)}
      ORDER BY c.name, d.delivery_date
    `

    // Format data for export
    const exportData = monthlyDeliveries.map((delivery) => ({
      "Client Name": delivery.client_name,
      "Project Name": delivery.project_name,
      "Delivery Date": formatDate(delivery.delivery_date),
      Role: delivery.role,
      "Gross Delivery": delivery.gross_amount,
      "Net Delivery": delivery.net_amount,
      Contributor: delivery.user_name,
      Description: delivery.description,
      Month: month,
      Year: year,
    }))

    // Add summary row
    exportData.push({
      "Client Name": "TOTAL",
      "Project Name": "",
      "Delivery Date": "",
      Role: "",
      "Gross Delivery": monthlyDeliveries.reduce((sum, d) => sum + d.gross_amount, 0),
      "Net Delivery": monthlyDeliveries.reduce((sum, d) => sum + d.net_amount, 0),
      Contributor: "",
      Description: "",
      Month: "",
      Year: "",
    })

    if (format === "json") {
      return NextResponse.json(exportData)
    } else if (format === "csv") {
      // Create CSV manually
      const headers = Object.keys(exportData[0] || {})
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) => headers.map((header) => `"${row[header]}"`).join(",")),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="Deliveries-${month}-${year}.csv"`,
        },
      })
    } else {
      return NextResponse.json({ error: "Unsupported format" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}

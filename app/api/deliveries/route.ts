import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { calculateNetAmount, calculateGrossAmount } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const month = url.searchParams.get("month")
    const year = url.searchParams.get("year")

    let deliveries
    if (month && year) {
      deliveries = await sql`
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
    } else {
      deliveries = await sql`
        SELECT d.*, 
               p.name as project_name,
               c.name as client_name,
               u.name as user_name
        FROM deliveries d
        JOIN projects p ON d.project_id = p.id
        JOIN clients c ON p.client_id = c.id
        JOIN users u ON d.user_id = u.id
        ORDER BY c.name, d.delivery_date
      `
    }

    const formattedDeliveries = deliveries.map((delivery) => ({
      ...delivery,
      project: {
        name: delivery.project_name,
        client: { name: delivery.client_name },
      },
      user: { name: delivery.user_name },
    }))

    return NextResponse.json(formattedDeliveries)
  } catch (error) {
    console.error("Error fetching deliveries:", error)
    return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, userId, role, description, deliveryDate, grossAmount, isGross = true } = await request.json()

    // Validate required fields
    if (
      !projectId ||
      !userId ||
      !role ||
      !description ||
      !deliveryDate ||
      grossAmount === undefined ||
      grossAmount === null
    ) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate grossAmount is a valid number
    const amount = Number.parseFloat(grossAmount)
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a valid positive number" }, { status: 400 })
    }

    // Parse the delivery date
    const date = new Date(deliveryDate)
    const month = date.getMonth() + 1 // JavaScript months are 0-indexed
    const year = date.getFullYear()

    // Calculate net or gross amount based on input
    let finalGrossAmount, finalNetAmount

    if (isGross) {
      finalGrossAmount = amount
      finalNetAmount = calculateNetAmount(amount)
    } else {
      finalNetAmount = amount
      finalGrossAmount = calculateGrossAmount(amount)
    }

    const newDelivery = await sql`
      INSERT INTO deliveries (project_id, user_id, role, description, delivery_date, gross_amount, net_amount, month, year)
      VALUES (${projectId}, ${userId}, ${role}, ${description}, ${deliveryDate}, ${finalGrossAmount}, ${finalNetAmount}, ${month}, ${year})
      RETURNING *
    `

    return NextResponse.json(newDelivery[0], { status: 201 })
  } catch (error) {
    console.error("Error creating delivery:", error)
    return NextResponse.json({ error: "Failed to create delivery" }, { status: 500 })
  }
}

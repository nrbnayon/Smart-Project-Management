import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { calculateNetAmount, calculateGrossAmount } from "@/lib/utils"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deliveryId = Number.parseInt(params.id)
    const { projectId, userId, role, description, deliveryDate, grossAmount, isGross = true } = await request.json()

    // Check if user owns this delivery or is admin
    const existingDelivery = await sql`
      SELECT user_id FROM deliveries WHERE id = ${deliveryId}
    `

    if (existingDelivery.length === 0) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
    }

    if (user.role !== "admin" && existingDelivery[0].user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse the delivery date
    const date = new Date(deliveryDate)
    const month = date.getMonth() + 1
    const year = date.getFullYear()

    // Calculate net or gross amount based on input
    let finalGrossAmount, finalNetAmount

    if (isGross) {
      finalGrossAmount = grossAmount
      finalNetAmount = calculateNetAmount(grossAmount)
    } else {
      finalNetAmount = grossAmount
      finalGrossAmount = calculateGrossAmount(grossAmount)
    }

    const updatedDelivery = await sql`
      UPDATE deliveries 
      SET project_id = ${projectId}, user_id = ${userId}, role = ${role}, 
          description = ${description}, delivery_date = ${deliveryDate}, 
          gross_amount = ${finalGrossAmount}, net_amount = ${finalNetAmount}, 
          month = ${month}, year = ${year}, updated_at = NOW()
      WHERE id = ${deliveryId}
      RETURNING *
    `

    return NextResponse.json(updatedDelivery[0])
  } catch (error) {
    console.error("Error updating delivery:", error)
    return NextResponse.json({ error: "Failed to update delivery" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const deliveryId = Number.parseInt(params.id)

    // Check if user owns this delivery or is admin
    const existingDelivery = await sql`
      SELECT user_id FROM deliveries WHERE id = ${deliveryId}
    `

    if (existingDelivery.length === 0) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 })
    }

    if (user.role !== "admin" && existingDelivery[0].user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await sql`DELETE FROM deliveries WHERE id = ${deliveryId}`

    return NextResponse.json({ message: "Delivery deleted successfully" })
  } catch (error) {
    console.error("Error deleting delivery:", error)
    return NextResponse.json({ error: "Failed to delete delivery" }, { status: 500 })
  }
}

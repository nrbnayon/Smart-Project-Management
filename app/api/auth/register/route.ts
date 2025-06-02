import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword, createToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = "user" } = await request.json()

    // Check if user already exists
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const newUser = await sql`
      INSERT INTO users (name, email, password, role) 
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}) 
      RETURNING id, role
    `

    // Create token
    const token = await createToken(newUser[0].id, newUser[0].role)

    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}

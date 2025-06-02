// app/api/auth/login/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { comparePasswords, createToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Find user
    const user = await sql`SELECT id, name, email, password, role FROM users WHERE email = ${email}`

    if (user.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Compare passwords
    const passwordMatch = await comparePasswords(password, user[0].password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create token
    const token = await createToken(user[0].id, user[0].role)

    // Set cookie - await cookies() first
    const cookieStore = await cookies()
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
    })

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
        role: user[0].role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
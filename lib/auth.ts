// lib/auth.ts
import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const secretKey = new TextEncoder().encode(JWT_SECRET)

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10)
}

export async function comparePasswords(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword)
}

export async function createToken(userId: number, role: string) {
  return await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload
  } catch (error) {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies() // Await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  return payload
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session || !session.userId) return null

  const user = await sql`
    SELECT id, name, email, role 
    FROM users 
    WHERE id = ${session.userId as number}
  `

  return user[0] || null
}

export function isAdmin(request: NextRequest) {
  const session = request.cookies.get("token")?.value
  if (!session) return false

  // Verify the token and check if the user is an admin
  // This is a simplified version, in a real app you would verify the token
  return session.includes("admin")
}
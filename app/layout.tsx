import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { getCurrentUser } from "@/lib/auth"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Monthly Project Delivery Tracker",
  description: "Track project deliveries, manage team contributions, and generate comprehensive reports",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar user={user} />
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}

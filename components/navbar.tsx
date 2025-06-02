"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { User } from "lucide-react"

interface NavbarProps {
  user: {
    id: number
    name: string
    email: string
    role: string
  } | null
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to logout")
      }

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Project Tracker
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium ${pathname === "/dashboard" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
              >
                Dashboard
              </Link>
              <Link
                href="/projects"
                className={`text-sm font-medium ${pathname === "/projects" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
              >
                Projects
              </Link>
              <Link
                href="/monthly-sheet"
                className={`text-sm font-medium ${pathname === "/monthly-sheet" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
              >
                Monthly Sheet
              </Link>
              <Link
                href="/summary"
                className={`text-sm font-medium ${pathname === "/summary" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
              >
                Summary
              </Link>
              <Link
                href="/financial-overview"
                className={`text-sm font-medium ${pathname === "/financial-overview" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
              >
                Financial Overview
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className={`text-sm font-medium ${pathname.startsWith("/admin") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
                >
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/"
                className={`text-sm font-medium ${pathname === "/" ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
              >
                Home
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

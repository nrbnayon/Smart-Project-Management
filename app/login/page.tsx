import AuthForm from "@/components/auth-form"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome to Project Tracker</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account or create a new one</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}

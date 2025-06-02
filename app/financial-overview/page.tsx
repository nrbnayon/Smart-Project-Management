import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import FinancialOverview from "@/components/financial-overview"

export default async function FinancialOverviewPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
        <p className="text-gray-600">Comprehensive financial metrics and project delivery tracking</p>
      </div>

      <FinancialOverview />
    </div>
  )
}

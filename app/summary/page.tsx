import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import UserDeliverySummary from "@/components/user-delivery-summary"

export default async function SummaryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Delivery Summary</h1>
        <p className="text-gray-600">Comprehensive breakdown of deliveries by user, client, and phase</p>
      </div>

      <UserDeliverySummary />
    </div>
  )
}

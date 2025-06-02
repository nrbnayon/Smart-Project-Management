import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import DeliveryForm from "@/components/delivery-form"

export default async function NewDeliveryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Delivery Record</h1>
        <p className="text-gray-600">Record a new project delivery contribution</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <DeliveryForm />
      </div>
    </div>
  )
}

import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import MonthlySheet from "@/components/monthly-sheet"

export default async function MonthlySheetPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Monthly Delivery Sheet
        </h1>
        <p className="text-gray-600">
          View and export project deliveries for the selected month
        </p>
      </div>

      <MonthlySheet />
    </div>
  );
}

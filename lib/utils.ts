import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  if (!date) return ""
  const parsedDate = typeof date === "string" ? parseISO(date) : date
  return format(parsedDate, "yyyy-MM-dd")
}

export function calculateNetAmount(grossAmount: number) {
  return grossAmount * 0.8 // 20% deduction
}

export function calculateGrossAmount(netAmount: number) {
  return netAmount / 0.8 // Reverse 20% deduction
}

export function getMonthName(month: number) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  return months[month - 1] || ""
}

export function getCurrentMonthYear() {
  const now = new Date()
  return {
    month: now.getMonth() + 1, // JavaScript months are 0-indexed
    year: now.getFullYear(),
  }
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export const phaseOrder = [
  "Frontend (App)",
  "Frontend (Web)",
  "Backend",
  "API Implemented",
  "UI/UX",
  "AI Development",
  "Deployment",
  "Other",
]

export function sortByPhase(a: { role: string }, b: { role: string }) {
  return phaseOrder.indexOf(a.role) - phaseOrder.indexOf(b.role)
}

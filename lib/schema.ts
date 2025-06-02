import { pgTable, serial, text, timestamp, integer, pgEnum, real, date, unique } from "drizzle-orm/pg-core"

// Role enum for user roles
export const roleEnum = pgEnum("role", ["admin", "user"])

// Phase enum for project phases
export const phaseEnum = pgEnum("phase", [
  "Frontend (App)",
  "Frontend (Web)",
  "Backend",
  "API Implemented",
  "UI/UX",
  "AI Development",
  "Deployment",
  "Other",
])

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Projects table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  clientId: integer("client_id").notNull(),
  totalGrossDelivery: real("total_gross_delivery").notNull(),
  totalNetDelivery: real("total_net_delivery").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Deliveries table (for tracking individual contributions)
export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  userId: integer("user_id").notNull(),
  role: phaseEnum("role").notNull(),
  description: text("description").notNull(),
  deliveryDate: date("delivery_date").notNull(),
  grossAmount: real("gross_amount").notNull(),
  netAmount: real("net_amount").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Monthly targets table (for admin-set delivery targets)
export const monthlyTargets = pgTable("monthly_targets", {
  id: serial("id").primaryKey(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  targetAmount: real("target_amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// Add unique constraint for month/year combination
export const monthlyTargetsUnique = pgTable(
  "monthly_targets",
  {
    id: serial("id").primaryKey(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    targetAmount: real("target_amount").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    monthYearUnique: unique().on(table.month, table.year),
  }),
)

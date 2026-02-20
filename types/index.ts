// Enums
export type Plan = 'FREE' | 'BASIC' | 'PRO'
export type UserRole = 'USER' | 'SUPER_USER'
export type StatementStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
export type TransactionType = 'PAYBILL' | 'TILL' | 'SEND_MONEY' | 'RECEIVE_MONEY' | 'WITHDRAWAL' | 'DEPOSIT' | 'AIRTIME' | 'OTHER'
export type Category = 'SALES' | 'SUPPLIER_PAYMENT' | 'UTILITY' | 'SALARY' | 'WITHDRAWAL' | 'TRANSFER' | 'AIRTIME' | 'UNCATEGORIZED'
export type ReportType = 'MONTHLY_SUMMARY' | 'KRA_EXPORT' | 'CASH_FLOW'
export type SubStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'

// User Types
export interface User {
  id: string
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  phone: string | null
  businessName: string | null
  plan: Plan
  planExpiresAt: Date | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

// Statement Types
export interface Statement {
  id: string
  userId: string
  fileName: string
  fileUrl: string
  status: StatementStatus
  periodStart: string | null
  periodEnd: string | null
  totalIn: number
  totalOut: number
  netFlow: number
  createdAt: string
  updatedAt: string
  transactions?: Transaction[]
  insight?: Insight | null
}

// Transaction Types
export interface Transaction {
  id: string
  statementId: string
  date: Date
  type: TransactionType
  amount: number
  balance: number | null
  reference: string | null
  counterparty: string | null
  description: string | null
  category: Category
  isIncoming: boolean
}

// Insight Types
export interface Insight {
  id: string
  statementId: string
  topCustomers: TopCustomer[]
  topExpenses: TopExpense[]
  peakDays: PeakDay[]
  monthlySummary: MonthlySummary[]
  aiSummary: string
  recommendations: Recommendation[]
  healthScore: number
  createdAt: string
}

export interface TopCustomer {
  name: string
  totalAmount: number
  transactionCount: number
}

export interface TopExpense {
  category: string
  amount: number
  percentage: number
}

export interface PeakDay {
  dayOfWeek: string
  averageAmount: number
}

export interface MonthlySummary {
  month: string
  totalIn: number
  totalOut: number
  netFlow: number
}

export interface Recommendation {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

// Report Types
export interface Report {
  id: string
  userId: string
  statementId: string
  type: ReportType
  fileUrl: string | null
  createdAt: string
  statement?: Statement
}

// Subscription Types
export interface Subscription {
  id: string
  userId: string
  paystackSubId: string | null
  plan: Plan
  status: SubStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  createdAt: Date
  updatedAt: Date
}

// Raw Transaction (from PDF parsing)
export interface RawTransaction {
  date: Date
  description: string
  amount: number
  balance: number | null
  isIncoming: boolean
  reference: string | null
  counterparty: string | null
}

// API Response Types
export interface UploadResponse {
  statementId: string
  status: StatementStatus
}

export interface SubscribeResponse {
  authorizationUrl: string
}

export interface ReportResponse {
  reportId: string
  fileUrl: string
}

export interface CronResponse {
  sent?: number
  cleaned?: number
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  businessName?: string
  password: string
  confirmPassword: string
}

export interface SettingsFormData {
  name: string
  businessName?: string
  phone?: string
}

export interface PasswordChangeFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Chart Data Types
export interface CashFlowChartData {
  date: string
  income: number
  expenses: number
}

export interface TopCustomersChartData {
  name: string
  amount: number
}

export interface CategoryChartData {
  category: string
  amount: number
  percentage: number
  fill: string
}

// NextAuth Extension
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      plan?: Plan
      role?: UserRole
      businessName?: string | null
    }
  }

  interface User {
    id: string
    plan: Plan
    role: UserRole
    businessName: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    plan: Plan
    role: UserRole
    businessName: string | null
  }
}

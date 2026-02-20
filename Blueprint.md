# M-Pesa Business Analytics — Technical Blueprint

> AI-powered M-Pesa statement analyzer for Kenyan SMEs.
> Upload M-Pesa PDF → Instant business insights, cash flow reports, KRA-ready exports.

---

## Stack

- **Framework:** Next.js 14+ (App Router, Full Stack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Forms & Validation:** React Hook Form + Zod
- **ORM:** Prisma + pg adapter
- **Database:** PostgreSQL
- **Auth:** NextAuth.js v5
- **State Management:** Zustand (client state)
- **Server State / Fetching:** TanStack React Query
- **Notifications (UI):** Sonner — on every user action (login, upload, errors, success)
- **Email:** Resend + React Email
- **File Storage:** Cloudinary
- **AI SDK:** Vercel AI SDK v4
- **AI Model:** Groq — llama-3.1-70b-versatile (analysis) / llama-3.1-8b-instant (chat)
- **Chat UI:** assistant-ui + prompt-kit
- **PDF Parsing:** pdf-parse (Node.js)
- **Charts:** Recharts
- **Payments:** Paystack (KES)
- **WhatsApp:** Twilio WhatsApp API
- **Cron:** Vercel Cron Jobs

---

## Project File Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (marketing)/
│   │   ├── page.tsx                        # Landing page
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── statements/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── reports/
│   │   │   └── page.tsx
│   │   ├── chat/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       ├── upload/
│       │   └── route.ts                    # POST — upload M-Pesa PDF to Cloudinary
│       ├── analyze/
│       │   └── route.ts                    # POST — trigger AI analysis (internal)
│       ├── statements/
│       │   ├── route.ts                    # GET all statements for user
│       │   └── [id]/
│       │       └── route.ts                # GET single statement + transactions + insight
│       ├── chat/
│       │   └── route.ts                    # POST — streaming AI chat with Groq
│       ├── reports/
│       │   └── route.ts                    # GET all, POST generate report
│       ├── billing/
│       │   ├── subscribe/
│       │   │   └── route.ts                # POST — initialize Paystack payment
│       │   └── webhook/
│       │       └── route.ts                # POST — Paystack signed webhook events
│       ├── whatsapp/
│       │   └── webhook/
│       │       └── route.ts                # POST — Twilio inbound WhatsApp messages
│       └── cron/
│           ├── monthly-reports/
│           │   └── route.ts                # GET — send monthly summary emails
│           └── cleanup/
│               └── route.ts                # GET — mark stuck statements as FAILED
├── components/
│   ├── ui/                                 # shadcn/ui auto-generated components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   ├── statements/
│   │   ├── UploadZone.tsx
│   │   ├── StatementCard.tsx
│   │   ├── StatementList.tsx
│   │   └── ProcessingStatus.tsx
│   ├── dashboard/
│   │   ├── StatsCards.tsx
│   │   ├── CashFlowChart.tsx
│   │   ├── TopCustomersChart.tsx
│   │   ├── CategoryBreakdownChart.tsx
│   │   ├── TransactionsTable.tsx
│   │   └── RecommendationCards.tsx
│   ├── chat/
│   │   └── AiChat.tsx                      # assistant-ui wrapper component
│   ├── reports/
│   │   ├── ReportCard.tsx
│   │   └── GenerateReportButton.tsx
│   └── shared/
│       ├── StatusBadge.tsx
│       ├── PlanBadge.tsx
│       ├── HealthScoreGauge.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── auth.ts                             # NextAuth config
│   ├── prisma.ts                           # Prisma client singleton
│   ├── groq.ts                             # Groq + AI SDK client setup
│   ├── cloudinary.ts                       # Cloudinary config + upload helper
│   ├── resend.ts                           # Resend client setup
│   ├── paystack.ts                         # Paystack helpers
│   ├── pdf-parser.ts                       # M-Pesa PDF text extraction + structuring
│   ├── mpesa-analyzer.ts                   # Core AI analysis logic + Zod schema
│   ├── plan-guard.ts                       # Reusable plan limit enforcement functions
│   └── utils.ts                            # General utility functions
├── stores/
│   └── useAppStore.ts                      # Zustand store for sidebar + selected statement
├── hooks/
│   ├── useStatements.ts                    # React Query hooks for statement CRUD
│   ├── useInsights.ts                      # React Query hook for insight data
│   └── useSubscription.ts                  # React Query hook for billing state
├── emails/
│   ├── Welcome.tsx                         # React Email — on registration
│   ├── StatementReady.tsx                  # React Email — on analysis complete
│   ├── SubscriptionConfirmed.tsx           # React Email — on plan upgrade
│   └── MonthlySummary.tsx                  # React Email — monthly cron
├── prisma/
│   └── schema.prisma
├── types/
│   └── index.ts                            # Shared TypeScript types
├── middleware.ts                            # Auth route protection
├── vercel.json                              # Cron schedule config
└── .env
```

---

## Database Schema — `prisma/schema.prisma`

### Models

**User**
Fields: id, name, email (unique), emailVerified, image, phone (optional), businessName (optional), plan (enum: FREE / BASIC / PRO, default FREE), planExpiresAt (optional), password (optional, for credentials auth), createdAt, updatedAt.
Relations: one-to-many with Statement, Report. One-to-one with Subscription.

**Account**
Standard NextAuth OAuth account model. Fields: id, userId (FK), type, provider, providerAccountId, refresh_token, access_token, expires_at, token_type, scope, id_token, session_state.
Unique constraint on [provider, providerAccountId].

**Session**
Standard NextAuth session model. Fields: id, sessionToken (unique), userId (FK), expires.

**Statement**
Fields: id, userId (FK), fileName, fileUrl (Cloudinary URL), status (enum: PENDING / PROCESSING / DONE / FAILED, default PENDING), periodStart (optional DateTime), periodEnd (optional DateTime), totalIn (Float, default 0), totalOut (Float, default 0), netFlow (Float, default 0), createdAt, updatedAt.
Relations: one-to-many with Transaction. One-to-one with Insight. One-to-many with Report.

**Transaction**
Fields: id, statementId (FK), date (DateTime), type (enum: PAYBILL / TILL / SEND_MONEY / RECEIVE_MONEY / WITHDRAWAL / DEPOSIT / AIRTIME / OTHER), amount (Float), balance (Float optional), reference (optional), counterparty (optional), description (optional), category (enum: SALES / SUPPLIER_PAYMENT / UTILITY / SALARY / WITHDRAWAL / TRANSFER / AIRTIME / UNCATEGORIZED, default UNCATEGORIZED), isIncoming (Boolean).

**Insight**
Fields: id, statementId (FK, unique), topCustomers (Json), topExpenses (Json), peakDays (Json), monthlySummary (Json), aiSummary (String), recommendations (Json), healthScore (Int), createdAt.
Relation: one-to-one with Statement.

**Report**
Fields: id, userId (FK), statementId (FK), type (enum: MONTHLY_SUMMARY / KRA_EXPORT / CASH_FLOW), fileUrl (optional, Cloudinary URL), createdAt.

**Subscription**
Fields: id, userId (FK, unique), paystackSubId (optional), plan (enum: FREE / BASIC / PRO), status (enum: ACTIVE / CANCELLED / PAST_DUE, default ACTIVE), currentPeriodStart (DateTime), currentPeriodEnd (DateTime), createdAt, updatedAt.
Relation: one-to-one with User.

---

## Environment Variables — `.env`

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GROQ_API_KEY=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=hello@yourdomain.com
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Shared TypeScript Types — `types/index.ts`

```typescript
export type Plan = 'FREE' | 'BASIC' | 'PRO'
export type StatementStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
export type TransactionType = 'PAYBILL' | 'TILL' | 'SEND_MONEY' | 'RECEIVE_MONEY' | 'WITHDRAWAL' | 'DEPOSIT' | 'AIRTIME' | 'OTHER'
export type Category = 'SALES' | 'SUPPLIER_PAYMENT' | 'UTILITY' | 'SALARY' | 'WITHDRAWAL' | 'TRANSFER' | 'AIRTIME' | 'UNCATEGORIZED'
export type ReportType = 'MONTHLY_SUMMARY' | 'KRA_EXPORT' | 'CASH_FLOW'
export type SubStatus = 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'

export interface Statement {
  id: string
  userId: string
  fileName: string
  fileUrl: string
  status: StatementStatus
  periodStart?: string
  periodEnd?: string
  totalIn: number
  totalOut: number
  netFlow: number
  createdAt: string
  transactions?: Transaction[]
  insight?: Insight
}

export interface Transaction {
  id: string
  statementId: string
  date: string
  type: TransactionType
  amount: number
  balance?: number
  reference?: string
  counterparty?: string
  description?: string
  category: Category
  isIncoming: boolean
}

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

export interface Report {
  id: string
  userId: string
  statementId: string
  type: ReportType
  fileUrl?: string
  createdAt: string
}

export interface Subscription {
  id: string
  userId: string
  plan: Plan
  status: SubStatus
  currentPeriodStart: string
  currentPeriodEnd: string
}
```

---

## Auth — `lib/auth.ts`

- NextAuth.js v5 with two providers: Google OAuth and Credentials
- Credentials provider: hash passwords with bcryptjs on register, compare on login
- Prisma adapter persists accounts and sessions to PostgreSQL
- Session strategy: `jwt`
- Callbacks: include `user.id`, `user.plan`, and `user.businessName` in JWT token and session

## Middleware — `middleware.ts`

- Use NextAuth `auth()` to protect all dashboard routes
- Redirect unauthenticated users to `/login`
- Matcher: `['/dashboard/:path*', '/statements/:path*', '/reports/:path*', '/chat/:path*', '/settings/:path*']`

---

## API Routes — Full Contracts

### `POST /api/upload`
- Auth required
- Plan check: FREE users limited to 1 statement per calendar month — query Statement count for current month before proceeding. Return 403 with upgrade message if exceeded.
- Input: `multipart/form-data` with field `file` (PDF only — validate MIME type)
- Process: validate file is PDF → upload buffer to Cloudinary folder `mpesa-statements/{userId}/` → create Statement record (status: PENDING) → fire background POST to `/api/analyze` (fire-and-forget) → return statement ID immediately
- Response: `{ statementId: string, status: 'PENDING' }`
- Errors: 401 unauthorized, 403 plan limit exceeded, 400 invalid file type

---

### `POST /api/analyze`
- Internal only — called server-to-server, not from the browser
- Input: JSON body `{ statementId: string, fileBuffer: string }` (base64 encoded PDF)
- Process:
  1. Update Statement status to PROCESSING
  2. Decode base64 buffer and run pdf-parse to extract raw text
  3. Run regex parser to structure text into typed transaction array
  4. Send transaction array to Groq via AI SDK `generateObject` with Zod schema
  5. Bulk insert Transactions to DB via Prisma `createMany`
  6. Create Insight record with AI response data
  7. Update Statement: status DONE, totalIn, totalOut, netFlow, periodStart, periodEnd
  8. Trigger Resend email: StatementReady template
- Error handling: any failure in the pipeline catches and sets Statement status to FAILED — never leaves a statement stuck in PROCESSING

---

### `GET /api/statements`
- Auth required
- Returns all Statements for authenticated user ordered by `createdAt` descending
- Response: `Statement[]`

### `GET /api/statements/[id]`
- Auth required — verify statement belongs to the requesting user (filter by userId)
- Fetch Statement + nested Transactions + Insight in a single Prisma query with includes
- Response: Full `Statement` object with `transactions` and `insight` nested

---

### `POST /api/chat`
- Auth required
- Input: `{ messages: Message[], statementId?: string }` (AI SDK message format)
- Process: if `statementId` provided, fetch Insight from DB and inject as system prompt context → call Groq via AI SDK `streamText` → stream response back using `toDataStreamResponse()`
- The system prompt instructs the AI to respond in plain English with Kenyan SME business context
- Response: AI SDK data stream (consumed by assistant-ui on the client)

---

### `GET /api/reports`
- Auth required
- Returns all Reports for authenticated user ordered by `createdAt` descending
- Response: `Report[]`

### `POST /api/reports`
- Auth required
- Plan check: `KRA_EXPORT` type requires PRO plan — return 403 with upgrade message if not PRO
- Input: `{ statementId: string, type: ReportType }`
- Process: fetch Statement + Insight → generate report content → store on Cloudinary → create Report record in DB → return download URL
- Response: `{ reportId: string, fileUrl: string }`

---

### `POST /api/billing/subscribe`
- Auth required
- Input: `{ plan: 'BASIC' | 'PRO' }`
- Process: initialize Paystack transaction with user email, amount in KES (×100 for pesewas), Paystack plan code from env, callback URL, and metadata with plan name → return Paystack authorization URL
- Response: `{ authorizationUrl: string }`

### `POST /api/billing/webhook`
- No session auth — validate Paystack HMAC-SHA512 webhook signature using `PAYSTACK_WEBHOOK_SECRET`
- Return 200 immediately before processing (Paystack requires fast response)
- Events handled:
  - `charge.success` → update User plan field, create or update Subscription record, send SubscriptionConfirmed email
  - `subscription.disable` → downgrade User plan to FREE, update Subscription status to CANCELLED
  - `invoice.payment_failed` → update Subscription status to PAST_DUE

---

### `POST /api/whatsapp/webhook`
- No session auth — validate Twilio request signature using `TWILIO_AUTH_TOKEN`
- Input: Twilio form-encoded POST body
- Process:
  1. Extract sender phone number, message body, media count and media URL
  2. Look up User in DB by phone number — if no match, reply with registration instructions
  3. Check User plan is PRO — if not, reply with upgrade message and stop
  4. If PDF attached: download from Twilio media URL → parse → analyze → reply with formatted WhatsApp summary message including AI summary, totalIn, totalOut, healthScore, and dashboard link
  5. If text message only: reply with bot usage instructions
- Response: 200 OK (Twilio requires fast response)

---

### `GET /api/cron/monthly-reports`
- Header required: `Authorization: Bearer ${CRON_SECRET}` — return 401 if missing or invalid
- Process: query all Users with BASIC or PRO plan → for each, fetch previous month's Statements and aggregate totals → send MonthlySummary email via Resend
- Response: `{ sent: number }`

### `GET /api/cron/cleanup`
- Header required: `Authorization: Bearer ${CRON_SECRET}` — return 401 if missing or invalid
- Process: query all Statements where status is PENDING or PROCESSING and `updatedAt` is older than 15 minutes → update status to FAILED
- Response: `{ cleaned: number }`

---

## Core Logic — `lib/pdf-parser.ts`

```
export async function parseMpesaStatement(buffer: Buffer): Promise<{
  transactions: RawTransaction[]
  periodStart: string
  periodEnd: string
  accountHolder: string
}>

Steps:
1. Run pdf-parse on buffer — extracts full raw text across all pages
2. Match statement period using regex on "Statement Period" label
3. Match account holder name using regex
4. Run transaction row regex across entire text body:
   - Each transaction row starts with a date pattern: DD/MM/YYYY HH:MM:SS
   - Extract per row: date/time, description text, amount, running balance
   - Extract reference code from description (alphanumeric ~10 chars)
   - Determine isIncoming: match description against keyword list
     - Incoming: "received", "paid to you", "deposit", "reversal"
     - Outgoing: "sent", "payment to", "withdraw", "airtime", "buy goods"
5. Return typed RawTransaction array + metadata
```

**RawTransaction shape:**
`{ date, description, amount, balance, isIncoming, reference }`

**Edge cases to handle:**
- Multi-page PDFs (pdf-parse concatenates all pages automatically)
- Transactions with reference only and no counterparty name
- Reversal transactions (flagged by keyword, treated as incoming)
- Statements with zero transactions (return error — do not proceed to analysis)

---

## Core Logic — `lib/mpesa-analyzer.ts`

```
export async function analyzeTransactions(
  transactions: RawTransaction[]
): Promise<InsightObject>

Steps:
1. If transactions.length > 200, batch: send first 200 for full analysis,
   aggregate remaining into summary totals to append to prompt
2. Call Groq via AI SDK generateObject:
   - model: "llama-3.1-70b-versatile"
   - schema: InsightZodSchema (see below)
   - system: role and output rules prompt
   - user: transaction data + batch summary if applicable
3. Return validated structured insight object
```

**InsightZodSchema fields:**
- `categorizedTransactions` — array: `{ reference, category, counterparty }` per transaction
- `topCustomers` — top 10 by total incoming amount: `{ name, totalAmount, transactionCount }`
- `topExpenses` — by category: `{ category, amount, percentage }`
- `peakDays` — ranked by avg volume: `{ dayOfWeek, averageAmount }`
- `monthlySummary` — per month: `{ month, totalIn, totalOut, netFlow }`
- `aiSummary` — string: 2–3 plain English sentences readable by a non-accountant
- `recommendations` — array: `{ title, description, priority: 'high' | 'medium' | 'low' }`
- `healthScore` — integer 0–100 based on: revenue consistency, expense ratio, net flow trend

**System prompt must include:**
- Role: "You are a financial advisor for Kenyan small business owners analyzing M-Pesa transactions."
- Kenyan context: reference M-Pesa transaction types, KRA compliance, common SME business types
- Identify recurring counterparties as customers (incoming) or suppliers (outgoing) by frequency
- aiSummary must be readable by a non-accountant business owner — no jargon
- healthScore above 70 requires consistent positive net flow across the period
- Output rule: return only the JSON object matching the schema — no preamble or explanation

---

## Zustand Store — `stores/useAppStore.ts`

```typescript
interface AppStore {
  selectedStatementId: string | null
  setSelectedStatement: (id: string | null) => void
  sidebarOpen: boolean
  toggleSidebar: () => void
}
```

Initial state: `selectedStatementId` is null, `sidebarOpen` is true.
Persist `sidebarOpen` to localStorage.

---

## React Query Hooks

### `hooks/useStatements.ts`
- `useStatements()` — GET `/api/statements`, query key `['statements']`
- `useStatement(id: string)` — GET `/api/statements/[id]`, query key `['statements', id]`. Set `refetchInterval` dynamically: poll every 3 seconds while status is PENDING or PROCESSING, stop when DONE or FAILED.

### `hooks/useInsights.ts`
- `useInsight(statementId: string)` — derived from `useStatement`, returns the nested `insight` field. No separate API call needed.

### `hooks/useSubscription.ts`
- `useSubscription()` — GET `/api/billing/subscription`, query key `['subscription']`
- `useSubscribe()` — POST mutation to `/api/billing/subscribe` → on success redirect to Paystack authorization URL

---

## Component Specs

### `UploadZone.tsx`
- Drag-and-drop zone accepting only `.pdf` files
- Click-to-browse fallback
- Show selected file name preview after selection
- Framer Motion scale animation on drag-over state
- On submit: POST to `/api/upload` as multipart/form-data
- Show animated progress bar during upload (Framer Motion)
- On success: `toast.success("Statement uploaded! Analysis starting...")` → redirect to `/statements/[id]`
- On error: `toast.error("Upload failed. Please try again.")`
- Enforce plan limit client-side hint: if FREE user already has 1 statement this month, show upgrade prompt before upload

### `StatementCard.tsx`
Props: `statement: Statement`
Renders:
- File name and upload date (relative: "2 hours ago")
- `StatusBadge`: yellow=PENDING, orange=PROCESSING (pulsing), green=DONE, red=FAILED
- Period range if available
- totalIn (green), totalOut (red), netFlow (blue or red depending on sign)
- Health score badge if DONE
- Action: click card → navigate to `/statements/[id]`
- Animate in with Framer Motion `fadeInUp` on mount

### `ProcessingStatus.tsx`
Props: `status: StatementStatus`
Renders:
- Full-page loading state shown on `/statements/[id]` while status is PENDING or PROCESSING
- Animated spinner or progress indicator (Framer Motion)
- Status label: "Uploading..." / "Analyzing your transactions..." / "Almost done..."
- Auto-dismisses and reveals dashboard content when TanStack Query detects DONE status

### `StatsCards.tsx`
Renders 4 cards in a responsive row with Framer Motion stagger entrance:
- Total Revenue (period totalIn, green, TrendingUp icon)
- Total Expenses (period totalOut, red, TrendingDown icon)
- Net Cash Flow (netFlow, blue if positive / red if negative)
- Business Health Score (healthScore out of 100, purple, gauge icon)

### `CashFlowChart.tsx`
- Recharts AreaChart with two data series: income (green fill) and expenses (red fill)
- X-axis: date labels from monthlySummary
- Responsive container wrapper
- Custom tooltip showing exact KES amounts

### `TopCustomersChart.tsx`
- Recharts horizontal BarChart
- Top 5 customers ranked by totalAmount
- Y-axis: customer names, X-axis: KES amount
- Custom label showing formatted amount

### `CategoryBreakdownChart.tsx`
- Recharts PieChart with category segments
- Color coded per category enum
- Custom legend below chart

### `TransactionsTable.tsx`
- Paginated table: 10 rows per page (shadcn Pagination)
- Columns: Date, Counterparty, Category badge, Type, Amount (green if incoming / red if outgoing), Balance
- Row hover highlight
- Filter by isIncoming toggle

### `RecommendationCards.tsx`
- One card per recommendation from Insight
- Priority badge: high=red, medium=yellow, low=green
- Title and description
- Icon based on priority (AlertCircle, Info, CheckCircle from Lucide)

### `AiChat.tsx`
- Wraps assistant-ui `AssistantRuntimeProvider` and `Thread` components
- Connects to `/api/chat` via Vercel AI SDK `useChat` hook
- Passes current `statementId` from Zustand store in request body for context injection
- Shown on `/chat` page with statement selector dropdown at top

Update the blueprint's AiChat.tsx component to use:

useChat from ai/react for streaming
shadcn ScrollArea for the message list
shadcn Textarea + Button for the input
Framer Motion for message entrance animations

follow the above instructions

---

## Page Specs

### `/` — Landing Page
- Hero section: headline, subheadline, CTA button to `/register`
- "How it works" section: 3-step flow (Upload → Analyze → Insights)
- Pricing plan cards (3 plans)
- Footer with links

### `/pricing`
- Detailed plan comparison table: Free vs Basic vs Pro
- Upgrade buttons link to `/register` (unauthenticated) or trigger Paystack flow (authenticated)

### `/login`
- Email/password form (React Hook Form + Zod)
- Google OAuth button
- Link to `/register`
- Sonner toast on success / failure

### `/register`
- Fields: name, email, businessName, password, confirmPassword
- On success: send Welcome email via Resend → redirect to `/dashboard`
- Sonner toast on success / error

### `/dashboard`
- Stats row: `StatsCards` — pulls from most recent DONE statement
- Cash flow chart: `CashFlowChart`
- Top customers: `TopCustomersChart`
- Recent transactions: `TransactionsTable` (last 5 only)
- AI recommendations: `RecommendationCards`
- "Upload New Statement" button top right → navigates to `/statements`
- Empty state if no statements yet: prompt to upload first statement

### `/statements`
- "Upload Statement" button top right → opens `UploadZone` in a Dialog
- `StatementList`: list of all `StatementCard` components ordered by `createdAt` descending
- Empty state if none

### `/statements/[id]`
- Show `ProcessingStatus` while status is PENDING or PROCESSING
- Once DONE: full analysis view with all chart components + `TransactionsTable` (paginated)
- AI summary block: plain text card with `aiSummary`
- Health score gauge: `HealthScoreGauge`
- `RecommendationCards`
- "Generate Report" button → calls POST `/api/reports`
- "Chat about this statement" button → navigates to `/chat` with this statement pre-selected

### `/reports`
- List of all generated reports as `ReportCard` components
- Each card: type label, statement period, created date, download button
- "Generate Report" button → Dialog with StatementSelector + ReportType selector
- Empty state if none

### `/chat`
- Statement selector dropdown at top (select which statement to query about)
- `AiChat` component fills rest of page
- Placeholder prompt suggestions via prompt-kit if no messages yet

### `/settings`
- Profile section: name, email (read-only), businessName, phone — React Hook Form + Zod
- Billing section: current plan badge, next billing date, upgrade/cancel button
- Password change section (Credentials users only)
- Danger zone: delete account button
- Sonner toasts on all save actions

---

## Email Templates

### `emails/Welcome.tsx`
- Subject: `"Welcome to M-Pesa Analytics 🎉"`
- Body: personalized greeting with businessName, 3-step quick start guide, CTA button → `${APP_URL}/statements`

### `emails/StatementReady.tsx`
- Subject: `"Your M-Pesa analysis is ready 📊"`
- Body: health score badge, aiSummary text, top 3 recommendations, CTA button → `${APP_URL}/statements/[id]`

### `emails/SubscriptionConfirmed.tsx`
- Subject: `"You're now on the [Plan] plan ✅"`
- Body: new plan name, full feature list for that plan, next billing date, support link

### `emails/MonthlySummary.tsx`
- Subject: `"📈 Your [Month] business summary"`
- Body: totalIn, totalOut, netFlow for last month, top customer name, health score, CTA button → `${APP_URL}/dashboard`

---

## Vercel Cron — `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/monthly-reports",
      "schedule": "0 9 1 * *"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 * * * *"
    }
  ]
}
```

Both cron routes must validate `Authorization: Bearer ${CRON_SECRET}` header and return 401 if missing or invalid.

---

## Build Sequence (Execute in Order)

1. Scaffold Next.js 14 with TypeScript, Tailwind, shadcn/ui init
2. Install all dependencies: `bcryptjs @ai-sdk/groq groq-sdk ai @assistant-ui/react @assistant-ui/react-ai-sdk pdf-parse cloudinary next-cloudinary resend @react-email/components @react-email/render recharts framer-motion zustand @tanstack/react-query @tanstack/react-query-devtools next-auth@beta @auth/prisma-adapter prisma @prisma/client zod react-hook-form @hookform/resolvers sonner twilio`
3. Configure `.env` with all variables
4. Write `prisma/schema.prisma` with all models → run `npx prisma migrate dev --name init` → run `npx prisma generate`
5. Write `lib/prisma.ts` (singleton pattern)
6. Write `types/index.ts`
7. Write `lib/auth.ts` + `middleware.ts`
8. Build `/login` and `/register` pages + auth layout
9. Write `lib/groq.ts`
10. Write `lib/cloudinary.ts`
11. Write `lib/resend.ts`
12. Write `lib/paystack.ts`
13. Write `lib/pdf-parser.ts` — test against a real M-Pesa PDF before proceeding
14. Write `lib/mpesa-analyzer.ts` — test Groq response and Zod schema validation
15. Write `lib/plan-guard.ts`
16. Write all API routes in this order: `upload` → `analyze` → `statements` → `statements/[id]` → `chat` → `reports` → `billing/subscribe` → `billing/webhook` → `whatsapp/webhook` → `cron/monthly-reports` → `cron/cleanup`
17. Write `stores/useAppStore.ts`
18. Write all React Query hooks: `useStatements` → `useInsights` → `useSubscription`
19. Build shared components: `StatusBadge`, `PlanBadge`, `HealthScoreGauge`, `EmptyState`
20. Build layout: `Sidebar`, `Header`, `MobileNav`, dashboard layout wrapper
21. Build statement components: `UploadZone`, `StatementCard`, `StatementList`, `ProcessingStatus`
22. Build dashboard components: `StatsCards`, `CashFlowChart`, `TopCustomersChart`, `CategoryBreakdownChart`, `TransactionsTable`, `RecommendationCards`
23. Build `/statements` and `/statements/[id]` pages
24. Build `/dashboard` page
25. Build `AiChat` component → build `/chat` page
26. Build report components: `ReportCard`, `GenerateReportButton` → build `/reports` page
27. Build `/settings` page
28. Build marketing pages: `/` landing and `/pricing`
29. Write all email templates
30. Write `vercel.json`
31. Test full flow: register → upload statement → wait for analysis → view dashboard → generate report → upgrade plan → chat with AI → receive email
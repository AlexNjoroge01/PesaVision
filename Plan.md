# M-Pesa Business Analytics — Product Blueprint

> AI-powered M-Pesa statement analyzer for Kenyan SMEs.
> Upload your M-Pesa PDF → Get instant business insights, cash flow reports, and KRA-ready exports.

---

## What We Are Building

A SaaS web application for Kenyan small business owners who receive payments via M-Pesa. They download their M-Pesa statement PDF, upload it to the platform, and the AI analyzes every transaction — categorizing income, expenses, identifying top customers, peak business days, and generating a plain-English business health report. The owner gets a clean dashboard they can actually understand, without needing an accountant.

---

## Business Model

| Plan | Price | What They Get |
|---|---|---|
| Free | Ksh 0 | 1 statement analysis per month |
| Basic | Ksh 499/month | Unlimited statements, full dashboard, downloadable reports |
| Pro | Ksh 1,499/month | Everything in Basic + KRA-ready CSV export + WhatsApp bot |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, Full Stack) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Animations | Framer Motion |
| Forms & Validation | React Hook Form + Zod |
| ORM | Prisma + pg adapter |
| Database | PostgreSQL |
| Auth | NextAuth.js v5 |
| State Management | Zustand |
| Server State / Fetching | TanStack React Query |
| Notifications (UI) | Sonner — on every user action (login, upload, error, success) |
| Email | Resend + React Email |
| File Storage | Cloudinary |
| AI SDK | Vercel AI SDK v4 |
| AI Model | Groq (llama-3.1-70b) |
| Chat UI | assistant-ui + prompt-kit |
| PDF Parsing | pdf-parse (Node.js) |
| Charts | Recharts |
|
| Payments | Paystack (KES support) |
| WhatsApp | Twilio WhatsApp API |

---

## System Architecture Overview

The application has three main layers:

**Frontend** — Next.js App Router pages. Users interact with the dashboard, upload statements, view charts, and chat with the AI advisor. All data fetching is managed by TanStack React Query. Client state (sidebar, selected statement) lives in Zustand.

**Backend** — Next.js API routes handle all business logic: authentication, file uploads, triggering AI analysis, generating reports, processing payments, and receiving WhatsApp messages.

**Data Layer** — PostgreSQL database accessed via Prisma ORM. Cloudinary stores the raw PDF files. Groq processes the AI analysis. Paystack handles subscriptions. Twilio handles WhatsApp.

### How a Statement Analysis Works (Data Flow)
```
User uploads PDF
      ↓
PDF stored 
      ↓
Statement record created in database (status: PENDING)
      ↓
Analysis job triggered in background
      ↓
pdf-parse extracts raw transaction text from PDF
      ↓
Regex parser structures transactions into clean data
      ↓
Structured transactions sent to Groq AI
      ↓
AI categorizes transactions + generates insights JSON
      ↓
Insights and transactions saved to database
      ↓
Statement status updated to DONE
      ↓
Dashboard auto-refreshes (TanStack Query polling)
      ↓
Email notification sent to user via Resend
```

---

## Database Structure

**User** — account info, business name, current plan (FREE / BASIC / PRO), plan expiry date.

**Account & Session** — managed by NextAuth for OAuth and session handling.

**Statement** — each uploaded M-Pesa PDF. Stores Cloudinary file URL, processing status (PENDING / PROCESSING / DONE / FAILED), statement period dates, total in/out/net flow.

**Transaction** — every individual line item parsed from the PDF. Linked to a Statement. Stores date, amount, balance, counterparty name, transaction type, category, and direction (incoming/outgoing).

**Insight** — the AI-generated analysis for a statement. Stores top customers, expense breakdown, peak days, monthly summary, AI summary text, recommendations, and health score. One-to-one with Statement.

**Report** — generated downloadable reports (monthly summary, KRA export). Stores the Cloudinary URL of the generated file.

**Subscription** — tracks the user's Paystack subscription ID, plan, status, and billing period.

---

## Application Pages

### Public Pages
- **Landing Page** (`/`) — hero, how it works, pricing, CTA to sign up
- **Pricing Page** (`/pricing`) — detailed plan comparison with upgrade buttons

### Auth Pages
- **Login** (`/login`) — email/password + Google OAuth
- **Register** (`/register`) — name, email, business name, password

### Dashboard Pages (protected)
- **Dashboard** (`/dashboard`) — overview: stats cards, charts, AI summary, recommendations
- **Statements** (`/statements`) — list of all uploaded statements with status badges
- **Statement Detail** (`/statements/[id]`) — full analysis: all charts + full transaction table
- **Reports** (`/reports`) — list of generated reports with download links
- **AI Chat** (`/chat`) — conversational interface to ask questions about business data
- **Settings** (`/settings`) — profile, business name, password change, billing management

---

## Phase-by-Phase Build Plan

---

### Phase 1 — Project Foundation
Set up the Next.js project with TypeScript and Tailwind. Install all dependencies. Initialize Prisma with the database schema and run the first migration. Configure shadcn/ui and the folder structure. **Outcome:** blank Next.js app running with the database connected.

---

### Phase 2 — Authentication
Build the complete auth system using NextAuth v5 with Google OAuth and email/password. Create login and register pages with React Hook Form + Zod validation. Add route protection middleware. Add Sonner toasts on every auth event: login success, login failure, account created, logged out. **Outcome:** users can create accounts, log in, and be protected from accessing dashboard pages without auth.

---

### Phase 3 — PDF Upload
Build the file upload flow. Drag-and-drop upload component accepts only PDF files. On upload: store on Cloudinary, create a Statement record (status: PENDING), trigger analysis in background. Show progress bar during upload. Redirect to the statement detail page showing a loading state. Sonner toasts for success and errors. **Outcome:** users can upload a PDF and see it saved with PENDING status.

---

### Phase 4 — PDF Parsing
Build the M-Pesa PDF text extraction logic. Use pdf-parse to pull raw text from the PDF. Write a parser that reads M-Pesa's statement format and extracts: date/time, description, amount, running balance, and reference number for every transaction. Determine incoming vs outgoing from description keywords. Handle all M-Pesa transaction types: Paybill, Till Number, Send Money, Withdraw, Deposit. **Outcome:** a raw PDF becomes a clean, structured array of transactions.

---

### Phase 5 — AI Analysis Engine
Use Vercel AI SDK + Groq to analyze the structured transactions. Send the transactions to Groq (llama-3.1-70b) and use generateObject with a Zod schema to get back structured JSON containing: categorized transactions, top customers by revenue, expense breakdown by category, peak business days, monthly in/out/net summary, a plain-English business summary, actionable recommendations, and a health score (0–100). Save everything to the Insight and Transaction tables. Update Statement status to DONE. Send a "your analysis is ready" email. **Outcome:** uploading a PDF triggers a full AI analysis saved to the database.

---

### Phase 6 — Dashboard & Visualizations
Build the main dashboard using TanStack React Query for data fetching. Display: four stats cards with Framer Motion animations (total revenue, total expenses, net cash flow, health score); a cash flow area chart (Recharts) showing income vs expenses over time; a horizontal bar chart of top 5 customers; a pie chart of expense categories; a paginated transactions table with category badges and color-coded amounts; AI recommendation cards with priority badges. Dashboard auto-refreshes while a statement is processing. **Outcome:** users see their full business analysis visually.

---

### Phase 7 — AI Chat Interface
Build the conversational AI advisor using assistant-ui + Vercel AI SDK streaming. The chat API route uses Groq. When opened from a statement page, the current statement's insights are injected into the AI's system prompt as context. The AI answers questions in plain English with Kenyan business context. Example: "Who are my best customers?", "Why is my cash flow low?", "What should I focus on?" **Outcome:** users can have a conversation with an AI advisor about their specific business data.

---

### Phase 8 — Reports & Exports
Build report generation. Monthly Summary Report: a printable page with business name, period, all key metrics, top customers, category breakdown — exportable as PDF. KRA Export: a CSV file formatted for iTax filing — gated to Pro plan only. Non-Pro users see an upgrade prompt. All generated reports stored on Cloudinary, listed on the Reports page with download buttons. Sonner toasts for generation success and errors. **Outcome:** users can download reports; Pro users can export KRA-ready files.

---

### Phase 9 — Subscriptions & Billing
Build the Paystack subscription system. Pricing page with three plan cards. Clicking upgrade initializes a Paystack payment in KES. Build a Paystack webhook that listens for payment events: on success, update user plan in DB; on cancellation, downgrade to FREE. Send a subscription confirmation email on upgrade. Free plan limit (1 statement/month) enforced at the upload API — if exceeded, return an error with upgrade prompt. **Outcome:** full billing cycle works end-to-end.

---

### Phase 10 — Email Notifications
Build all transactional emails using React Email + Resend. Three templates: Welcome Email (on registration — quick start steps, link to upload); Statement Ready Email (on analysis complete — health score, top insight, dashboard link); Subscription Confirmed Email (on upgrade — feature list, next billing date). **Outcome:** users receive automated emails at every key moment.

---

### Phase 11 — WhatsApp Bot (Pro Plan Only)
Build WhatsApp integration using Twilio. Start with Twilio WhatsApp Sandbox (no Meta approval needed for development). Webhook receives incoming messages. When a user sends a PDF: parse it, analyze it, reply with a WhatsApp message containing the AI summary, total in/out, health score, and dashboard link. When a user sends text: reply with usage instructions. Gate behind Pro plan. For production: apply for a dedicated WhatsApp number through Twilio (they handle Meta verification). **Outcome:** Pro users can analyze statements directly from WhatsApp.

---


---

### Phase 13 — Deployment
Database: PostgreSQL  run Prisma migrations. File storage. Email: configure custom domain on Resend with DNS records. Payments: go live on Paystack with KES enabled. Deploy Next.js to Vercel, connect GitHub for auto-deployments, set all environment variables, configure custom domain. **Outcome:** application is live and accessible.

---

## Environment Variables Needed

| Variable | Source |
|---|---|
| DATABASE_URL | Supabase |
| NEXTAUTH_URL | Your domain |
| NEXTAUTH_SECRET | Generated locally |
| GOOGLE_CLIENT_ID | Google Cloud Console |
| GOOGLE_CLIENT_SECRET | Google Cloud Console |
| GROQ_API_KEY | console.groq.com |
| RESEND_API_KEY | resend.com |
| PAYSTACK_PUBLIC_KEY | Paystack dashboard |
| PAYSTACK_SECRET_KEY | Paystack dashboard |
| PAYSTACK_WEBHOOK_SECRET | Paystack dashboard |
| TWILIO_ACCOUNT_SID | Twilio console |
| TWILIO_AUTH_TOKEN | Twilio console |
| TWILIO_WHATSAPP_NUMBER | Twilio console |

---

## Build Order Summary

```
Phase 1  → Project setup + database schema
Phase 2  → Authentication (login, register, route protection)
Phase 3  → PDF upload 
Phase 4  → PDF parsing (extract M-Pesa transactions)
Phase 5  → AI analysis engine (Groq + save insights)
Phase 6  → Dashboard + visualizations (charts, tables)
Phase 7  → AI chat interface (assistant-ui + streaming)
Phase 8  → Reports + KRA export
Phase 9  → Subscriptions + Paystack billing
Phase 10 → Email notifications (Resend + React Email)
Phase 11 → WhatsApp bot (Twilio )
Phase 12 → Cron jobs (monthly emails, stuck jobs cleanup)
Phase 13 → Deployment (Supabase + Vercel + domain)
```

---

*Blueprint v2.0 — M-Pesa Analytics SaaS*
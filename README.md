# ECP Real Estate Media Operations Platform

A production-grade, multi-tenant real estate media operations platform built with Next.js 14 and Supabase.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Next.js 14 (App Router)                  │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│ │
│  │  │  Admin UI   │ │ Customer UI │ │   Photographer App     ││ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────────┘│ │
│  │  ┌─────────────────────────────────────────────────────────┐│ │
│  │  │              API Routes & Server Actions                 ││ │
│  │  └─────────────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                         SUPABASE                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Postgres   │ │     Auth     │ │   Storage    │            │
│  │  (RLS + Views)│ │ (Multi-Role) │ │   (Media)    │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │   Realtime   │ │ Edge Functions│ │   pgvector   │            │
│  │ (Live Updates)│ │  (AI + Jobs) │ │ (Embeddings) │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│    OpenAI    │      │    Stripe    │      │   HubSpot    │
│  (QC + Chat) │      │  (Payments)  │      │    (CRM)     │
└──────────────┘      └──────────────┘      └──────────────┘
```

## 🚀 Features

### Core Platform
- **Multi-Tenant Architecture**: Company → Market → User hierarchy with RLS
- **Role-Based Access**: Super Admin, Company Admin, Market Manager, Sales Rep, Photographer, Editor, QC Reviewer, Customer
- **Time Zone Aware**: All scheduling respects market-specific timezones

### Order Management
- Full order lifecycle: Draft → Scheduled → Shot → Edited → QC → Delivered
- Multi-appointment orders
- Dynamic pricing with bundles and coupons
- Rush orders and travel fees

### AI-Powered QC
- GPT-4 Vision analysis of every photo
- Automated scoring (0-100)
- Issue detection: exposure, blur, composition, dust spots
- Pass/Warning/Fail workflow with override capability
- Photographer performance tracking

### Smart Scheduling
- AI-optimized photographer assignment
- Route optimization
- Availability management
- Conflict detection
- Daily optimization at 5:30 PM per market

### Photographer App Features
- GPS check-in/check-out
- Mileage tracking
- Equipment checklist
- Real-time schedule updates
- QC feedback loop
- Earnings dashboard

### Finance & Payroll
- Customer invoicing (Stripe integration)
- Photographer payroll (8th & 24th)
- Commission tracking
- Incentive programs
- Mileage reimbursement
- QuickBooks sync

### Analytics
- Materialized views for fast dashboards
- KPI tracking and snapshots
- Market performance comparison
- Photographer utilization
- QC trends

## 📦 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **AI**: OpenAI GPT-4 Vision, GPT-4 Turbo
- **Payments**: Stripe
- **CRM**: HubSpot (sync)
- **Messaging**: Twilio (SMS), SendGrid (Email)
- **Maps**: Google Maps, Mapbox
- **Hosting**: Vercel

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase CLI
- Supabase account
- Vercel account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/ecp-platform.git
   cd ecp-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Start Supabase locally**
   ```bash
   npx supabase start
   ```

5. **Run database migrations**
   ```bash
   npx supabase db push
   ```

6. **Generate TypeScript types**
   ```bash
   npm run db:generate-types
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# SendGrid
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# HubSpot
HUBSPOT_API_KEY=your-hubspot-key

# Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token

# Cron Secret (for Vercel cron jobs)
CRON_SECRET=your-cron-secret
```

## 📁 Project Structure

```
ecp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, register)
│   │   ├── (dashboard)/        # Dashboard layouts and pages
│   │   └── api/                # API routes
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   └── ...                 # Feature components
│   ├── lib/
│   │   ├── supabase/           # Supabase clients
│   │   ├── auth/               # Auth provider
│   │   └── utils.ts            # Utility functions
│   └── types/                  # TypeScript types
├── supabase/
│   ├── migrations/             # Database migrations
│   │   ├── 00001_core_schema.sql
│   │   ├── 00002_orders_schema.sql
│   │   ├── 00003_qc_schema.sql
│   │   ├── 00004_finance_schema.sql
│   │   ├── 00005_operations_schema.sql
│   │   ├── 00006_analytics_schema.sql
│   │   └── 00007_rls_policies.sql
│   └── functions/              # Edge Functions
│       ├── qc-analyze/
│       ├── qc-batch-process/
│       ├── schedule-optimize/
│       ├── daily-schedule-optimizer/
│       ├── generate-invoice/
│       ├── process-upload/
│       ├── send-notification/
│       ├── sync-hubspot/
│       └── ai-chat/
├── vercel.json                 # Vercel configuration
└── package.json
```

## 🔐 Security

### Row Level Security (RLS)

All tables have RLS policies enforcing:
- Multi-tenant isolation (company_id)
- Role-based access control
- User-specific data access

### Authentication

- Supabase Auth with JWT
- Email/password and OAuth support
- Session management via middleware

## 📊 Database Schema

The database includes 40+ tables organized into:

- **Core**: companies, markets, users, user_roles, permissions
- **Customers**: customers, customer_contacts
- **Photographers**: photographers, photographer_markets
- **Products**: product_categories, products, bundles
- **Orders**: orders, order_items, properties, appointments
- **Media**: deliverables, media_assets, upload_jobs
- **QC**: qc_jobs, qc_results, qc_issues, qc_scores
- **Finance**: invoices, commissions, bonuses, mileage_logs
- **Operations**: availability_blocks, equipment, messages, tasks
- **Analytics**: kpi_definitions, kpi_snapshots, dashboards

## 🚢 Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

### Supabase

1. Create a new Supabase project
2. Run migrations: `npx supabase db push`
3. Deploy Edge Functions: `npx supabase functions deploy`

## 📝 License

MIT License - see LICENSE file for details.

## 🧪 Testing

The platform includes comprehensive testing at multiple levels:

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run E2E tests with Playwright
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run all tests with coverage
npm run test:coverage
```

### Test Coverage Requirements
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## 🔒 Production Hardening

This platform includes several production-critical features:

### Error Handling
- Centralized error system with typed error codes
- Structured logging for debugging
- Sentry integration for error tracking

### Security
- Input validation with Zod schemas
- Rate limiting on all endpoints
- CSRF protection
- Security headers
- Audit logging for compliance

### Reliability
- Retry logic with exponential backoff
- Circuit breakers for external services
- Idempotency keys for duplicate prevention
- Database transactions with rollback

### Observability
- Prometheus-compatible metrics endpoint
- Health check endpoint for load balancers
- Structured JSON logging in production

### Feature Flags
- Company-level feature toggles
- Percentage-based rollouts
- Environment-specific flags

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run tests: `npm run test`
4. Run lint: `npm run lint`
5. Commit your changes
6. Push to the branch
7. Open a Pull Request

## 📞 Support

For support, email support@ecpplatform.com or join our Slack community.

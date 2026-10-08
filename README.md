# TaxFeeder

> The only client portal built specifically for tax preparers. Set up in 5 minutes. Clients don't need passwords.

**Live:** [https://taxfeeder.com](https://taxfeeder.com)

---

## What is TaxFeeder?

TaxFeeder is a client document collection portal for tax preparers, bookkeepers, and accountants.

Instead of chasing clients via email, text, and voicemail, you send them a **magic link**. They click it, see a checklist of documents you need, and upload directly from their phone. No passwords. No app downloads. No friction.

## Why TaxFeeder vs. TaxDome / Canopy?

| | TaxFeeder | TaxDome | Canopy |
|---|---|---|---|
| **Price** | $29/mo | $74/mo | $99/mo |
| **Setup time** | 5 minutes | 2-3 weeks | 1-2 weeks |
| **Client login** | Magic link (none) | Password required | Password required |
| **Scope** | Doc collection only | Full practice mgmt | Full practice mgmt |
| **Tax templates** | Pre-built | Generic | Generic |

## Tech Stack

- **Frontend:** Next.js 15 + Tailwind CSS
- **Backend:** Next.js API Routes + Supabase (PostgreSQL + Auth)
- **File Storage:** AWS S3 + CloudFront
- **Payments:** Stripe (subscriptions + webhooks)
- **Email:** Resend (transactional)
- **SMS:** Twilio (Pro plan reminders)
- **Hosting:** Vercel

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/kjelili/taxfeeder.git
cd taxfeeder
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Required services to set up:
- [Supabase](https://supabase.com) — Database + Auth
- [Stripe](https://stripe.com) — Payments
- [AWS S3](https://aws.amazon.com/s3) — File storage
- [Resend](https://resend.com) — Email
- [Twilio](https://twilio.com) — SMS (optional, Pro plan)

### 3. Database Setup

Run the migration in Supabase SQL Editor:

```sql
-- Copy contents of supabase/migrations/001_initial_schema.sql
```

### 4. Stripe Webhook

For local development:
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

In production, set the webhook endpoint to:
```
https://app.taxfeeder.com/api/webhooks/stripe
```

Listen for these events:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
taxfeeder/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   └── api/
│       ├── requests/
│       │   ├── route.ts            # List / create requests
│       │   └── [id]/
│       │       ├── route.ts        # Get single request
│       │       ├── upload-url/     # Pre-signed S3 URL
│       │       └── documents/      # Confirm upload
│       ├── clients/
│       │   └── route.ts            # CRUD clients
│       ├── templates/
│       │   └── route.ts            # List templates
│       ├── reminders/
│       │   └── trigger/
│       │       └── route.ts        # Send reminders
│       ├── waitlist/
│       │   └── route.ts            # Landing page signup
│       └── webhooks/
│           └── stripe/
│               └── route.ts        # Stripe webhook handler
├── lib/
│   ├── supabase.ts                 # Supabase admin client
│   ├── s3.ts                       # S3 pre-signed URL generator
│   ├── auth.ts                     # Session verification
│   └── email.ts                    # Resend email helpers
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── .env.example
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/requests?status=` | List document requests |
| POST | `/api/requests` | Create new request + magic link |
| GET | `/api/requests/[id]?token=` | Get request (public via token) |
| POST | `/api/requests/[id]/upload-url?token=` | Generate S3 upload URL |
| POST | `/api/requests/[id]/documents?token=` | Confirm file upload |
| GET | `/api/clients` | List clients |
| POST | `/api/clients` | Create client |
| GET | `/api/templates` | List templates |
| POST | `/api/reminders/trigger` | Send manual reminder |
| POST | `/api/waitlist` | Join waitlist |
| POST | `/api/webhooks/stripe` | Stripe webhook |

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Solo** | $29/mo | 1 user, 50 clients, email reminders, 5 templates |
| **Pro** | $59/mo | 3 users, unlimited clients, SMS reminders, branding |
| **Team** | $99/mo | Unlimited users, API, white-label, analytics |

## Security

- AES-256 encryption at rest
- Secure pre-signed URLs for file uploads (files never touch our servers)
- Row Level Security (RLS) on all database tables
- SOC 2 Type 1 preparation in progress
- Magic links expire and can be regenerated

## Roadmap

- [ ] Direct integrations with Drake, ProSeries, Lacerte
- [ ] AI-powered document classification
- [ ] Mobile app for accountants
- [ ] Client mobile app (optional)
- [ ] Multi-language support

## License

MIT

---

Built with ❤️ for tax preparers who value their time.

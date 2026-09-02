# Loop — Full-Stack SaaS for Client Feedback & Approvals

A production-grade SaaS tool that pins client feedback to the exact spot on a design file and turns "looks good" into a timestamped approval.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite |
| Styling | CSS design tokens (custom properties) |
| Backend | Node.js + Express |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth (email/password) |
| File Storage | Supabase Storage |
| Payments | Stripe (test mode) |
| Real-time | Supabase Realtime |

## Quick Start

### 1. Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Storage** > Create a new bucket named `files`, set it to **Public**
4. Copy your **Project URL** and **anon key** from Settings > API

### 2. Set up Stripe (free, test mode)

1. Go to [stripe.com](https://stripe.com) and create an account (stay in **Test mode**)
2. Create two Products: `Solo ($9/mo)` and `Studio ($29/mo)` with monthly recurring prices
3. Copy the `price_XXXX` IDs for each
4. Copy your **Secret key** (`sk_test_...`) from Developers > API keys
5. Install [Stripe CLI](https://stripe.com/docs/stripe-cli) for webhook testing

### 3. Configure environment variables

```bash
# Server
cp server/.env.example server/.env
# Fill in your Supabase + Stripe values

# Client
cp client/.env.local.example client/.env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 4. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 5. Run development servers

Terminal 1 (server):
```bash
cd server && npm run dev
```

Terminal 2 (client):
```bash
cd client && npm run dev
```

Terminal 3 (Stripe webhooks):
```bash
stripe listen --forward-to localhost:3001/webhook/stripe
```

The app runs at **http://localhost:5173**

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with product mockup |
| `/signup` | Create account (email + password) |
| `/login` | Sign in |
| `/onboarding` | First-time setup with value prop + create first project |
| `/dashboard` | Inbox view — all projects with status badges |
| `/project/:id` | **Core feature** — upload file, click to pin comments, approve |
| `/pricing` | Plan selection with real Stripe checkout |
| `/settings` | Profile, billing management, sign out |

## Core Feature Flow

1. Sign up → land on onboarding → create first project
2. Upload a design file (drag & drop or click)
3. Click anywhere on the file → pin drops → comment form appears
4. Comment saves with normalized x/y coordinates (works at any screen size)
5. Real-time: comments appear live via Supabase Realtime
6. Click "Mark as approved" → green approval chip with timestamp

## Stripe Test Card

```
Card:   4242 4242 4242 4242
Expiry: Any future date
CVC:    Any 3 digits
```

## Project Structure

```
├── index.html          # Static landing page (original)
├── case-study.md       # Design case study
├── supabase/
│   └── schema.sql      # Database schema + RLS policies
├── server/
│   ├── server.js       # Express entry point
│   ├── lib/            # Supabase admin client, auth middleware
│   └── routes/         # auth, projects, files, comments, approvals, stripe
└── client/
    ├── vite.config.js   # Dev server + API proxy
    └── src/
        ├── lib/         # Supabase client, API wrapper, auth helpers
        ├── components/  # Layout, PinMarker, StatusBadge, Spinner
        └── pages/       # Landing, Login, Signup, Onboarding, Dashboard,
                         # Project, Settings, Pricing
```

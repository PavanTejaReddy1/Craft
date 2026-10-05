# CRAFT — Ideas. Talent. Built.

A full-stack technology project marketplace built with React, Tailwind CSS, Node.js, Express, and MongoDB.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 1. Configure the backend
```bash
cd server
cp .env.example .env
# Edit .env — set MONGODB_URI, JWT_SECRET, etc.
```

### 2. Start the backend
```bash
cd server
npm run dev
# API runs on http://localhost:5000
```

### 3. Start the frontend
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

## Project Structure

```
craft/
├── server/                 # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── constants/      # Shared constants (statuses, roles, etc.)
│   │   ├── controllers/    # Route handlers (auth, projects, offers, etc.)
│   │   ├── middleware/      # Auth, validation, error handling, upload
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Email, notifications, payment abstraction
│   │   └── utils/          # JWT, crypto, audit logger, response helpers
│   └── uploads/            # Local file storage (swap with S3 in prod)
│
└── client/                 # React + Tailwind CSS SPA
    └── src/
        ├── api/            # Axios instance + typed API calls
        ├── components/     # Reusable UI (Button, Modal, Avatar, etc.)
        │   ├── ui/
        │   ├── layout/     # Navbar, Sidebar, AppLayout, PublicLayout
        │   └── cards/      # ProjectCard, DeveloperCard, OfferCard
        ├── constants/      # Frontend constants (categories, labels, etc.)
        ├── contexts/       # AuthContext
        ├── hooks/          # useNotifications, useDebounce
        ├── pages/          # All page components organized by role
        │   ├── public/     # Landing, Projects, Developers
        │   ├── auth/       # Login, Register, ForgotPassword, etc.
        │   ├── shared/     # Dashboard, Workspace, Profile, Settings
        │   ├── client/     # PostProject, ProjectOffers
        │   └── admin/      # AdminDashboard, AdminUsers, AdminReports
        └── utils/          # cn(), format helpers
```

## API Reference

Base URL: `http://localhost:5000/api/v1`

| Group | Prefix |
|---|---|
| Auth | `/auth` |
| Profiles | `/profile` |
| Projects | `/projects` |
| Offers | `/offers` |
| Contracts & Milestones | `/contracts` |
| Messages | `/messages` |
| Notifications | `/notifications` |
| Reviews | `/reviews` |
| Reports | `/reports` |
| Admin | `/admin` |

## Core User Flow

```
Register → Create Profile → Post Project → Browse Project
  → Submit Offer → View Offers → Compare Developers
  → Accept Offer → Active Project → Milestones
  → Complete Project → Review
```

## Environment Variables

See `server/.env.example` for all required variables.

Key variables:
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for signing JWTs (change in production)
- `CLIENT_URL` — Frontend URL (for CORS and email links)
- `EMAIL_*` — SMTP credentials for transactional email

## Payment Integration

The payment service is built as an abstraction layer in `server/src/services/paymentService.js`. It currently uses a mock provider. To integrate Razorpay or Stripe:

1. Create a new provider file in `server/src/services/providers/`
2. Implement the same interface: `createOrder`, `capturePayment`, `refund`
3. Switch the provider in `paymentService.js`

# Mae Chaem Agroforestry DB

ระบบฐานข้อมูลโครงการปลูกป่าอเนกประสงค์ในพื้นที่คทช. แม่แจ่ม

## Tech Stack

- **Next.js** (App Router) — frontend & API routes, optimised for Netlify
- **Tailwind CSS** — utility-first styling
- **Clerk** — authentication & user management
- **Neon Serverless Postgres + PostGIS** — geospatial database
- **MapLibre GL JS** — interactive vector map
- **Sarabun** — Thai/Latin font loaded from Google Fonts

## Getting Started

1. Copy the environment variable template and fill in your values:

   ```bash
   cp .env.local.example .env.local
   ```

2. Install dependencies and start the development server:

   ```bash
   npm install
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Environment Variables

See `.env.local.example` for the full list of required variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | Svix signing secret for the Clerk webhook |

## Deploy on Netlify

This project is configured for Netlify deployment. Connect your GitHub repository in the Netlify dashboard and set the environment variables above in **Site settings → Environment variables**.

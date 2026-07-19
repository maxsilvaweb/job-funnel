# Job Funnel Tracker

> Job hunting isn't a luck problem — it's a conversion-rate problem.

Track your job applications through a funnel, measure conversion
rates at each stage, and get actionable diagnostics on where to
focus your effort.

Based on the methodology from
[Job Hunting is a Funnel Problem](https://www.scottypeterson.net/blog/job-hunting-is-a-funnel-problem).

Built by [Max Silva](https://github.com/maxsilvaweb).

---

## The Idea

| Stage             | What it measures         | Healthy rate |
| ----------------- | ------------------------ | ------------ |
| Applications sent | Top of funnel            | —            |
| Responses         | Is your CV converting?   | 10–20%       |
| Screening         | Initial fit              | 50–70%       |
| Technical         | Can you pass interviews? | 40–60%       |
| Final round       | Culture / team fit       | 50%          |
| Offer             | Bottom of funnel         | 20–40%       |

The app diagnoses your weakest stage and tells you what to fix.

---

## Stack

- **Next.js 15** + React 19 + TypeScript
- **Supabase** — Postgres + Auth + RLS
- **TanStack Query** + **TanStack Form**
- **Recharts** — funnel visualisation
- **dnd-kit** — Kanban drag and drop
- **Zod** — form validation
- **Tailwind CSS**
- **GitHub Actions** CI/CD → **Vercel**

---

## Features

- Add, edit and delete applications
- Kanban board with drag and drop stage progression
- Table view with sorting
- Funnel visualisation chart
- Stage-by-stage conversion rates
- Automated diagnosis engine
- Weekly application targets with projection
- Applications needed per offer calculator
- Stage timeline per application
- Source tracking
- Row Level Security — your data stays private

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/maxsilvaweb/job-funnel.git
cd job-funnel

# 2. Install
npm install

# 3. Set up Supabase
# Create a project at https://supabase.com
# Run supabase/migrations/001_initial_schema.sql in SQL Editor

# 4. Environment variables
cp .env.local.example .env.local
# Add your Supabase URL and anon key

# 5. Run
npm run dev
```

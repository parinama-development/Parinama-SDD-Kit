# aibcg — AI Business Consulting Group Website

## Overview

Modern, minimal, premium website for **AIBCG — AI Business Consulting Group**. A marketing site showcasing services, industries served, clients, and career opportunities.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Email**: EmailJS
- **Hosting**: Firebase (parinama-aibcg)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — Hero, About, Services, Industries, Clients |
| `/careers` | Careers page with open roles + resume submission form |
| `/contact` | Contact / consultation request form |

## Project Structure

```
app/
  layout.tsx         — Root layout (Navbar + Footer)
  page.tsx           — Home page
  careers/page.tsx   — Careers page
  contact/page.tsx   — Contact page
  globals.css        — Tailwind + global styles
components/
  Navbar.tsx         — Sticky glass navbar
  Footer.tsx         — Footer with links
  home/
    Hero.tsx         — Landing hero with animated nodes
    About.tsx        — Company overview
    Services.tsx     — 8-service card grid
    Industries.tsx   — 5 industries served
    Clients.tsx      — 9-client portfolio grid
  careers/
    CareersHero.tsx  — Careers landing section
    OpenRoles.tsx    — Expandable role cards (5 positions)
    ResumeForm.tsx   — File upload + submission form
  contact/
    ContactPage.tsx  — Full contact form + sidebar
```

## Color Palette

| Token | Value |
|-------|-------|
| Navy | `#111827` |
| Accent (Orange) | `#F97316` |
| Surface | `#F9FAFB` |
| Muted gray | `#6B7280` |

## Environment Variables

Copy `env.example` to `.env.local` and fill in:

```bash
# EmailJS — contact + careers forms
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_CAREERS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=

# BCC recipients for form submissions (comma-separated emails)
NEXT_PUBLIC_BCC_EMAILS=
```

## Build & Deploy

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # Next.js static export → out/
firebase deploy --only hosting   # Firebase project: parinama-aibcg
```

**Live**: https://parinama-aibcg.web.app

## Key Features

1. **Hero Section** — Animated nodes visualization
2. **Services Grid** — 8 service cards
3. **Industries** — 5 industries served
4. **Client Portfolio** — 9-client grid
5. **Careers Page** — Open roles with expandable cards
6. **Resume Submission** — File upload form with EmailJS
7. **Contact Form** — Consultation request with EmailJS
8. **Responsive Design** — Mobile-first with Tailwind CSS
9. **Animations** — Framer Motion for smooth transitions
10. **Form Validation** — React Hook Form + Zod schema validation

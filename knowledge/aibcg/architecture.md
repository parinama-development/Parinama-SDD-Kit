# aibcg — Architecture

## System Overview

AIBCG Website is a modern, minimal, premium marketing site for AI Business Consulting Group. It's a static Next.js application with Firebase hosting, featuring animated sections, form submissions via EmailJS, and a clean design system.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| Email | EmailJS |
| Hosting | Firebase (parinama-aibcg) |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  Browser (Next.js 14)                         │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │  Home Page (/)       │  │  Careers Page (/careers)    │  │
│  │  - Hero (Animated)   │  │  - Careers Hero             │  │
│  │  - About              │  │  - Open Roles               │  │
│  │  - Services Grid      │  │  - Resume Form              │  │
│  │  - Industries         │  └────────────────────────────┘  │
│  │  - Clients Portfolio  │                                  │
│  └──────────────────────┘  ┌────────────────────────────┐  │
│                            │  Contact Page (/contact)    │  │
│                            │  - Contact Form             │  │
│                            │  - Sidebar Info              │  │
│                            └────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    EmailJS (Form Submissions)                  │
│  - Contact form submissions                                   │
│  - Resume submissions                                         │
│  - BCC email recipients                                       │
└─────────────────────────────────────────────────────────────┘
```

## Component Structure

```
app/
  layout.tsx                 — Root layout (Navbar + Footer)
  page.tsx                   — Home page
  careers/page.tsx           — Careers page
  contact/page.tsx           — Contact page
  globals.css                — Tailwind + global styles

components/
  Navbar.tsx                 — Sticky glass navbar
  Footer.tsx                 — Footer with links

  home/
    Hero.tsx                 — Landing hero with animated nodes
    About.tsx                — Company overview
    Services.tsx             — 8-service card grid
    Industries.tsx           — 5 industries served
    Clients.tsx              — 9-client portfolio grid

  careers/
    CareersHero.tsx          — Careers landing section
    OpenRoles.tsx            — Expandable role cards (5 positions)
    ResumeForm.tsx           — File upload + submission form

  contact/
    ContactPage.tsx          — Full contact form + sidebar
```

## Data Flow

### Contact Form Submission

1. User navigates to `/contact`
2. User fills contact form (name, email, message)
3. React Hook Form validates with Zod schema
4. On submit → EmailJS `send()` called
5. EmailJS sends email to configured recipients
6. BCC recipients notified (if configured)
7. Success/error message displayed

### Resume Submission

1. User navigates to `/careers`
2. User expands role card to see details
3. User fills resume form (name, email, role, file upload)
4. React Hook Form validates with Zod schema
5. On submit → EmailJS `send()` called with file attachment
6. EmailJS sends email with resume to configured recipients
7. BCC recipients notified (if configured)
8. Success/error message displayed

## Key Design Patterns

### Static Export

Next.js configured for static export (`output: 'export'`). No server — all pages pre-rendered at build time.

### Component-Based Architecture

Each page is composed of reusable components:
- `Navbar` and `Footer` shared across all pages
- Section components (Hero, About, Services) reusable
- Form components (ResumeForm, ContactPage) self-contained

### Animation with Framer Motion

- `Hero.tsx` uses animated nodes visualization
- Smooth transitions for page sections
- Hover effects on cards and buttons

### Form Validation

- React Hook Form for form state management
- Zod schemas for validation
- Type-safe form data

### Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive grid layouts
- Touch-friendly interactions

## Color System

| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#111827` | Headings, text, backgrounds |
| Accent (Orange) | `#F97316` | Buttons, highlights, CTAs |
| Surface | `#F9FAFB` | Card backgrounds, sections |
| Muted gray | `#6B7280` | Secondary text, borders |

## Environment Configuration

```bash
# EmailJS — contact + careers forms
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_CAREERS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=

# BCC recipients for form submissions (comma-separated emails)
NEXT_PUBLIC_BCC_EMAILS=
```

## Deployment

```bash
npm run build              # Next.js static export → out/
firebase deploy --only hosting   # Firebase project: parinama-aibcg
```

Static export means no server — all content pre-rendered at build time.

## Key Features

1. **Animated Hero** — Framer Motion nodes visualization
2. **Services Grid** — 8 service cards with hover effects
3. **Industries Section** — 5 industries served
4. **Client Portfolio** — 9-client grid
5. **Careers Page** — Expandable role cards
6. **Resume Upload** — File upload with EmailJS
7. **Contact Form** — Form validation with EmailJS
8. **Responsive Design** — Mobile-first with Tailwind
9. **Sticky Navbar** — Glass morphism effect
10. **SEO Ready** — Metadata, structured data

## Security Considerations

### EmailJS Public Key

EmailJS public key is exposed in client-side code. This is acceptable as EmailJS has rate limiting and template-based email sending (no arbitrary email content).

### No Backend

No server means no server-side authentication or authorization. All logic runs in the browser.

### Form Validation

Client-side validation with Zod prevents invalid submissions, but server-side validation is not possible without a backend.

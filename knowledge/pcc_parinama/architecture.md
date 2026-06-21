# pcc_parinama — Architecture

## System Overview

Parinama College Counseling is a content-driven website where all copy (counselor bios, program descriptions, workshop dates, testimonials) is managed via Firebase Remote Config. The site is a static React + Vite application with Firebase hosting, featuring dynamic content loading without code deploys.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React + Vite |
| Language | JavaScript |
| Routing | React Router DOM |
| Content Management | Firebase Remote Config |
| Forms | EmailJS |
| Hosting | Firebase (parinama-pcc) |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  Browser (Vite + React)                        │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │  Home Page (/)       │  │  Counselors (/counselors)   │  │
│  │  - Hero              │  │  - Counselor Profiles       │  │
│  │  - Overview          │  │  - Bios from Remote Config │  │
│  │  - Services          │  └────────────────────────────┘  │
│  └──────────────────────┘                                  │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │  Programs (/programs)│  │  Workshops (/workshops)    │  │
│  │  - Programs from RC  │  │  - Workshops from RC        │  │
│  └──────────────────────┘  └────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Contact Section (all pages)                          │  │
│  │  - EmailJS Contact Form                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Firebase Remote │  │ EmailJS         │  │ Firebase Hosting│
│ Config          │  │ (Contact Form)  │  │ (Static Site)   │
│ - Counselors    │  │ - Send emails   │  │ - parinama-pcc  │
│ - Programs      │  │ - BCC recipients│  │                 │
│ - Workshops     │  │                 │  │                 │
│ - Testimonials  │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Component Structure

```
src/
  firebase.js               — Firebase Remote Config initialization
  App.jsx                   — Root component with routing
  pages/
    Home.jsx                — Home page (hero, overview, services)
    Counselors.jsx          — Counselor profiles page
    Programs.jsx            — Programs page
    Workshops.jsx           — Workshops page
  components/
    ContactForm.jsx         — EmailJS contact form
    Navbar.jsx              — Navigation
    Footer.jsx              — Footer
```

## Data Flow

### Remote Config Initialization

1. App loads → `firebase.js` initializes Firebase
2. Remote Config fetched with 5-minute cache (production)
3. If credentials missing (local dev) → Graceful degradation
4. Sections render empty rather than crashing

### Content Loading

1. Component mounts (e.g., Counselors page)
2. Remote Config value fetched (e.g., `counselors`)
3. JSON parsed and rendered
4. If value missing → Empty state shown

### Contact Form Submission

1. User fills contact form (name, email, message)
2. Form submitted → EmailJS `send()` called
3. EmailJS sends email to configured recipients
4. Success/error message displayed

## Key Design Patterns

### Remote Config-Driven Content

All content lives in Firebase Remote Config:
- `counselors` — Array of counselor objects with bios
- `programs` — Array of program descriptions
- `workshops` — Array of workshop objects with dates
- `testimonials` — Array of testimonial quotes

Update content without code deploy:
1. Edit Remote Config in Firebase Console
2. Publish changes
3. Site picks up on next load (5-minute cache)

### Graceful Degradation

If Firebase credentials missing (local dev without `.env`):
- Remote Config initialization fails silently
- Sections render empty
- No crashes or errors

### Static Site

Vite builds static assets. No server — all logic runs in the browser.

### Client-Side Routing

React Router DOM for client-side navigation. No page reloads.

## Remote Config Keys

| Key | Type | Description |
|-----|------|-------------|
| `counselors` | JSON Array | Counselor profiles with bios |
| `programs` | JSON Array | Program descriptions |
| `workshops` | JSON Array | Workshop listings with dates |
| `testimonials` | JSON Array | Testimonial quotes |
| `hero_title` | String | Home page hero title |
| `hero_subtitle` | String | Home page hero subtitle |

See `FIREBASE_REMOTE_CONFIG_GUIDE.md` for full key reference.

## Environment Configuration

```bash
# Firebase (Remote Config)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# EmailJS (contact form)
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

## Deployment

```bash
npm run build              # Vite → dist/
firebase deploy --only hosting   # Firebase project: parinama-pcc
```

## Cache Strategy

- **Production**: 5-minute cache for Remote Config
- **Development**: No cache (or shorter cache for testing)
- Cache controlled via Firebase Remote Config settings

## Key Features

1. **Remote Config Content** — Update copy without redeploy
2. **Counselor Profiles** — Dynamic bios from Remote Config
3. **Program Listings** — Programs from Remote Config
4. **Workshop Schedule** — Workshops with dates from Remote Config
5. **Contact Form** — EmailJS integration
6. **Graceful Degradation** — Empty states if Remote Config unavailable
7. **5-Minute Cache** — Remote Config cached in production
8. **Static Site** — No server, Firebase hosting

## Security Considerations

### Firebase Public Config

Firebase config is exposed in client-side code. This is acceptable as Firebase has security rules and Remote Config is read-only for public clients.

### EmailJS Public Key

EmailJS public key is exposed. This is acceptable as EmailJS has rate limiting and template-based email sending.

### No Backend

No server means no server-side authentication. All content is public.

### Remote Config Access

Remote Config is read-only for public clients. Write access requires Firebase admin SDK with service account credentials (not exposed in client code).

## Documentation

- `FIREBASE_REMOTE_CONFIG_GUIDE.md` — Full key references and setup
- `FAQ_REMOTE_CONFIG_EXAMPLE.md` — Examples and FAQ
- `DEPLOYMENT_VERIFICATION_CHECKLIST.md` — Deployment verification
- `WEBSITE_STRUCTURE_NOTES.md` — Website structure notes
- `FREE_IMAGE_SERVICES.md` — Free image services

# pcc_parinama — Parinama College Counseling

## Overview

Website for **Parinama College Counseling** — college admissions guidance for students in the Austin area. Content is driven at runtime by Firebase Remote Config (no redeploy needed to update copy, counselors, programs, or workshop listings). Contact form uses EmailJS.

Live at **https://parinama-pcc.web.app**

## Technology Stack

- **Framework**: React + Vite
- **Language**: JavaScript
- **Routing**: React Router DOM
- **Content Management**: Firebase Remote Config
- **Forms**: EmailJS
- **Hosting**: Firebase (parinama-pcc)

## Pages

| Route | What |
|-------|------|
| `/` | Home — hero, overview, services |
| `/counselors` | Counselor profiles |
| `/programs` | Programs offered |
| `/workshops` | Upcoming workshops |
| Contact section | EmailJS contact form |

## Content Management — Firebase Remote Config

All copy (counselor bios, program descriptions, workshop dates, testimonials) lives in **Firebase Remote Config** on the `parinama-pcc` project. Update content without a code deploy:

1. Go to Firebase Console → Remote Config
2. Edit the relevant key/value pairs
3. Publish changes — site picks them up on next load (5-minute cache in production)

`src/firebase.js` initializes Remote Config. If credentials are missing (local dev without `.env`), the site degrades gracefully — sections render empty rather than crashing.

**Documentation**:
- `FIREBASE_REMOTE_CONFIG_GUIDE.md` — Full key references
- `FAQ_REMOTE_CONFIG_EXAMPLE.md` — Examples and FAQ
- `DEPLOYMENT_VERIFICATION_CHECKLIST.md` — Deployment verification
- `WEBSITE_STRUCTURE_NOTES.md` — Website structure notes
- `FREE_IMAGE_SERVICES.md` — Free image services

## Environment Variables

Copy `env.example` to `.env` and fill in:

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

## Build & Deploy

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Vite → dist/
firebase deploy --only hosting   # Firebase project: parinama-pcc
```

## Key Features

1. **Remote Config Content** — Update copy without redeploy
2. **Counselor Profiles** — Dynamic counselor bios from Remote Config
3. **Program Listings** — Programs offered from Remote Config
4. **Workshop Schedule** — Upcoming workshops from Remote Config
5. **Contact Form** — EmailJS integration
6. **Graceful Degradation** — Sections render empty if Remote Config unavailable
7. **5-Minute Cache** — Remote Config cached for 5 minutes in production
8. **Firebase Hosting** — Static site deployment

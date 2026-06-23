# Quickstart Guide: PDS User Authentication and Workflow Assignment

**Feature:** 017 - PDS User Authentication and Workflow Assignment
**Date:** 2026-06-22

---

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to Google Sheets with the PDS Parinama spreadsheet
- Resend account for email (free tier available)
- Git repository access

---

## Development Setup

### 1. Install Dependencies

```bash
cd pds_parinama
npm install bcryptjs jsonwebtoken
```

**New Dependencies:**
- `bcryptjs`: Password hashing (pure JS, no native dependencies)
- `jsonwebtoken`: JWT token generation for sessions

### 2. Environment Variables

Add to `.env.local`:

```bash
# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Resend API Key (for password reset emails)
RESEND_API_KEY=re_xxxxxxxxxxxxxx

# Session Configuration
SESSION_MAX_AGE=604800  # 7 days in seconds
```

### 3. Google Sheets Setup

Create three new tabs in the PDS Parinama Google Sheet:

**Tab: `users`**
Headers (row 1):
```
id,email,password_hash,full_name,phone,age_group,location,permit_status,created_at,updated_at,reset_token,reset_token_expires_at
```

**Tab: `workflows`**
Headers (row 1):
```
id,name,age_group,steps
```

Seed data (rows 2-5):
```
wf-001,Teen License Journey,under18,"[{""order"":1,""title"":""Parent books DPS appointment"",""description"":""Book at txdpsscheduler.com"",""action_url"":""https://txdpsscheduler.com"",""action_label"":""Book Appointment""},{""order"":2,""title"":""Submit VOE"",""description"":""Submit Verification of Enrollment from school""},{""order"":3,""title"":""Complete teen driver education"",""description"":""Complete Module 1 for DE-964"",""action_url"":""https://affiliate-url"",""action_label"":""Start Course""},{""order"":4,""title"":""Get learner permit"",""description"":""Get your Restriction B permit""},{""order"":5,""title"":""Behind-the-wheel practice"",""description"":""Schedule driving lessons""},{""order"":6,""title"":""Road test"",""description"":""Schedule your official road test""}]"
wf-002,Young Adult License Journey,18-24,"[{""order"":1,""title"":""Complete adult driver education"",""description"":""6-hour online course"",""action_url"":""https://affiliate-url"",""action_label"":""Start Course""},{""order"":2,""title"":""Take written exam"",""description"":""Take exam at DPS"",""action_url"":""https://txdpsscheduler.com"",""action_label"":""Schedule Exam""},{""order"":3,""title"":""Get learner permit"",""description"":""Get your learner permit""},{""order"":4,""title"":""Behind-the-wheel practice"",""description"":""Schedule driving lessons""},{""order"":5,""title"":""Road test"",""description"":""Schedule your official road test""}]"
wf-003,Adult License Journey,25+,"[{""order"":1,""title"":""Take written exam"",""description"":""Take exam at DPS or complete course to skip line"",""action_url"":""https://txdpsscheduler.com"",""action_label"":""Schedule Exam""},{""order"":2,""title"":""Get learner permit"",""description"":""Get your learner permit""},{""order"":3,""title"":""Behind-the-wheel practice"",""description"":""Schedule driving lessons""},{""order"":4,""title"":""Road test"",""description"":""Schedule your official road test""}]"
wf-004,License Holder Journey,license-holder,"[{""order"":1,""title"":""Review advanced techniques"",""description"":""Review advanced driving techniques""},{""order"":2,""title"":""Schedule refresher lessons"",""description"":""Schedule refresher driving lessons""},{""order"":3,""title"":""Practice parallel parking"",""description"":""Practice parallel parking skills""},{""order"":4,""title"":""Road test refresh"",""description"":""Schedule road test refresh if needed""}]"
```

**Tab: `user_progress`**
Headers (row 1):
```
id,user_id,workflow_id,current_step,completed_steps,updated_at
```

### 4. Google Apps Script Updates

Update `google-apps-script/Code.gs` to handle new tables:

```javascript
// Add to existing doPost function
function handleUserWrite(action, payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'createUser') {
    const usersSheet = sheet.getSheetByName('users');
    const id = Utilities.getUuid();
    const timestamp = new Date().toISOString();
    usersSheet.appendRow([
      id,
      payload.email,
      payload.password_hash,
      payload.full_name,
      payload.phone,
      payload.age_group,
      payload.location,
      payload.permit_status,
      timestamp,
      timestamp,
      '',
      ''
    ]);
    return { success: true, user_id: id };
  }
  
  if (action === 'updateUser') {
    const usersSheet = sheet.getSheetByName('users');
    const data = usersSheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === payload.user_id);
    if (rowIndex > 0) {
      const row = rowIndex + 1;
      if (payload.location) usersSheet.getRange(row, 7).setValue(payload.location);
      if (payload.password_hash) usersSheet.getRange(row, 3).setValue(payload.password_hash);
      if (payload.reset_token) usersSheet.getRange(row, 11).setValue(payload.reset_token);
      if (payload.reset_token_expires_at) usersSheet.getRange(row, 12).setValue(payload.reset_token_expires_at);
      usersSheet.getRange(row, 10).setValue(new Date().toISOString());
    }
    return { success: true };
  }
  
  if (action === 'createUserProgress') {
    const progressSheet = sheet.getSheetByName('user_progress');
    const id = Utilities.getUuid();
    const timestamp = new Date().toISOString();
    progressSheet.appendRow([
      id,
      payload.user_id,
      payload.workflow_id,
      payload.current_step,
      JSON.stringify(payload.completed_steps || []),
      timestamp
    ]);
    return { success: true, progress_id: id };
  }
  
  if (action === 'updateUserProgress') {
    const progressSheet = sheet.getSheetByName('user_progress');
    const data = progressSheet.getDataRange().getValues();
    const rowIndex = data.findIndex(row => row[0] === payload.progress_id);
    if (rowIndex > 0) {
      const row = rowIndex + 1;
      if (payload.current_step) progressSheet.getRange(row, 4).setValue(payload.current_step);
      if (payload.completed_steps) progressSheet.getRange(row, 5).setValue(JSON.stringify(payload.completed_steps));
      progressSheet.getRange(row, 6).setValue(new Date().toISOString());
    }
    return { success: true };
  }
  
  return { success: false, error: 'Unknown action' };
}
```

### 5. Start Development Server

```bash
npm run dev
```

The dev server will start at `http://localhost:3000`.

---

## File Structure

```
pds_parinama/
├── lib/
│   ├── auth.ts                    # NEW: Authentication utilities
│   ├── password.ts                # NEW: Password hashing
│   ├── session.ts                 # NEW: Session management
│   └── workflow-assignment.ts     # NEW: Workflow assignment logic
├── app/
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts  # NEW: Registration endpoint
│       │   ├── login/route.ts     # NEW: Login endpoint
│       │   ├── logout/route.ts    # NEW: Logout endpoint
│       │   └── reset-password/
│       │       ├── route.ts       # NEW: Request reset
│       │       └── confirm/route.ts # NEW: Confirm reset
│       ├── user/
│       │   └── profile/
│       │       ├── route.ts       # NEW: Get profile
│       │       └── update/route.ts # NEW: Update profile
│       └── workflow/
│           ├── route.ts           # NEW: Get workflow
│           └── step/
│               └── complete/route.ts # NEW: Complete step
├── components/
│   ├── auth/
│   │   ├── RegisterForm.tsx       # NEW: Registration form
│   │   ├── LoginForm.tsx          # NEW: Login form
│   │   └── PasswordReset.tsx      # NEW: Password reset forms
│   ├── workflow/
│   │   ├── WorkflowDisplay.tsx    # NEW: Display workflow steps
│   │   ├── ProgressIndicator.tsx  # NEW: Progress indicator
│   │   └── StepCard.tsx           # NEW: Individual step card
│   └── profile/
│       └── ProfileEditor.tsx      # NEW: Profile editor
└── framework/
    └── api/
        └── auth-client.ts         # NEW: Auth-specific data access
```

---

## Testing Setup

### Unit Tests

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### Manual Testing

1. **Registration:**
   - Navigate to `http://localhost:3000`
   - Click "Start My Driving Journey"
   - Fill registration form
   - Verify user created in Google Sheets
   - Verify workflow assigned
   - Verify progress record created

2. **Login:**
   - Navigate to `http://localhost:3000`
   - Click "Log In"
   - Enter credentials
   - Verify session created
   - Verify workflow and progress displayed

3. **Progress Tracking:**
   - Log in as user
   - Navigate to workflow page
   - Click "Mark as Complete" on a step
   - Verify progress updated in Google Sheets
   - Verify next step displayed

4. **Password Reset:**
   - Log out
   - Click "Forgot Password"
   - Enter email
   - Check email for reset link
   - Click reset link
   - Set new password
   - Verify can log in with new password

---

## Common Issues

### Issue: Google Sheets API quota exceeded

**Solution:**
- Increase cache TTL in SheetsClient
- Batch reads where possible
- Check API quota in Google Cloud Console

### Issue: Password reset email not received

**Solution:**
- Check Resend API key is valid
- Check email in spam folder
- Verify Resend dashboard for delivery status
- Check environment variables are set

### Issue: Session not persisting

**Solution:**
- Verify JWT_SECRET is set in .env.local
- Check cookie settings (HttpOnly, Secure)
- Verify session MaxAge is not too short
- Check browser console for cookie errors

### Issue: Workflow not assigned

**Solution:**
- Verify workflows table has data
- Check age_group matches workflow age_group
- Verify workflow assignment logic in auth.ts
- Check Google Apps Script logs for errors

---

## Development Workflow

1. Create feature branch from Tousif
2. Implement according to plan.md
3. Write tests for new code
4. Test manually
5. Update documentation
6. Submit for review

---

## Deployment Checklist

- [ ] All environment variables set in production
- [ ] Google Sheets tabs created and seeded
- [ ] Google Apps Script updated and deployed
- [ ] Resend API key configured
- [ ] JWT_SECRET set to strong random value
- [ ] HTTPS enabled (required for Secure cookies)
- [ ] Database backups configured
- [ ] Monitoring and logging set up
- [ ] Rate limiting configured
- [ ] Security headers configured

---

## Resources

- [bcryptjs documentation](https://www.npmjs.com/package/bcryptjs)
- [jsonwebtoken documentation](https://www.npmjs.com/package/jsonwebtoken)
- [Next.js cookies API](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [Resend documentation](https://resend.com/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)

# PulseMail — AI-Powered Inbox Management Platform

A full-featured, production-quality email client built entirely with **vanilla HTML, CSS, and JavaScript** — no frameworks, no dependencies. Features real **Gmail API integration** via Google OAuth 2.0 and six intelligent AI-powered inbox management tools.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Gmail API](https://img.shields.io/badge/Gmail_API-EA4335?style=flat&logo=gmail&logoColor=white)
![OAuth 2.0](https://img.shields.io/badge/OAuth_2.0-4285F4?style=flat&logo=google&logoColor=white)

---

## Live Features

### Core Email Client
- **Real Gmail Integration** — Sign in with your Google account, read/send/star/trash real emails
- **Demo Mode** — Fully functional offline mode with seeded data (no setup needed)
- **Multi-page App** — Inbox, Sent, Starred, Drafts, Trash, Compose, Settings + AI pages
- **Real-time Search** — Full-text search across all emails
- **Category Tabs** — Filter by Primary, Social, Promotions, Updates
- **Dark Mode** — System-wide theme toggle persisted in localStorage
- **Responsive Design** — Adapts from mobile to desktop with sidebar collapse

### AI Feature 1: Follow-up Reminder Agent
Tracks every email you open. If you haven't replied within a configurable time window, the system surfaces a reminder notification.

- Tracks opened emails with timestamps and view counts
- Detects unreplied messages past threshold (default 24 hours)
- **Reminder bell** in header with live badge count
- Dropdown panel showing pending follow-ups
- Dedicated **Reminders Dashboard** with stats (Overdue / Snoozed / Completed)
- Snooze (push forward 24h) and Mark Complete actions
- All state persisted in localStorage

### AI Feature 2: Email Summarizer
Every email gets an AI-generated summary panel with extracted intelligence.

- **Collapsible summary card** above email body
- Short summary extracted from email content using weighted sentence scoring
- **Priority detection** — Urgent / High / Normal / Low with color-coded badges
- **Action item extraction** — Parses "please...", "could you...", "need to..." patterns
- **Date/time extraction** — Finds deadlines, meeting times, relative dates
- Word count, estimated read time, auto-categorization (Meeting, Financial, Development, etc.)

### AI Feature 3: Subscription Tracker
Dedicated management page that auto-detects newsletter and promotional senders.

- Analyzes inbox to identify subscription/newsletter senders
- **Stats dashboard** — Total Subscriptions, Active, Muted, Total Emails
- Filter tabs: All / Active / Muted / Unsubscribed
- Per-sender metrics: email count, last received, category
- Actions: **Unsubscribe**, **Mute** (hide future emails), **Resubscribe**
- Category detection: Social, Promotions, Developer Tools, Financial, Newsletter

### AI Feature 4: Smart Reply Suggestions
Context-aware quick reply chips displayed when viewing any email.

- Detects 10+ email types: question, meeting, deadline, review, invitation, issue, update, proposal, appreciation, document sharing
- Shows 5 most relevant reply suggestions as clickable chip buttons
- Clicking inserts text into inline compose area
- Editable before sending — textarea with Send/Cancel
- Sending auto-marks the follow-up reminder as "replied"

### AI Feature 5: Focus Mode
Toggle in the header that filters inbox to show only what matters.

- **Animated toggle switch** with Focus label
- When ON: hides promotional, social, newsletter, and low-priority emails
- Shows only important, urgent, personal, and starred messages
- **Focus banner** with stats: "Hiding X of Y emails (Z% noise removed)"
- Preference remembered across sessions via localStorage
- Smooth CSS transitions for showing/hiding content

### AI Feature 6: Duplicate Email Detection
Identifies and groups repeated/similar emails in your inbox.

- Detects exact subject matches, same-sender similar subjects, same-sender same content
- Jaccard similarity algorithm for fuzzy subject matching (>70% threshold)
- **Warning banner** in inbox with group count and total duplicates
- **Review modal** showing grouped duplicates with sender, subject, count
- Actions: Archive Duplicates, Delete Duplicates, Dismiss
- Dismissed groups saved so warnings don't reappear

---

## Architecture

```
Project_2/
├── index.html                          # Auth page (Google OAuth + Demo login)
├── README.md
│
├── pages/
│   ├── inbox.html                      # Main inbox with Focus Mode + Duplicates
│   ├── mail.html                       # Email view with Summarizer + Smart Replies
│   ├── compose.html                    # Compose new email / Reply / Forward
│   ├── sent.html                       # Sent emails
│   ├── starred.html                    # Starred emails
│   ├── drafts.html                     # Draft emails
│   ├── trash.html                      # Trash
│   ├── reminders.html                  # Follow-up Reminders dashboard
│   ├── subscriptions.html              # Subscription Tracker page
│   └── settings.html                   # App settings + Gmail API config
│
├── assets/
│   ├── css/
│   │   ├── main.css                    # CSS entry point (imports all modules)
│   │   ├── base/
│   │   │   ├── variables.css           # Design tokens, colors, spacing, shadows
│   │   │   ├── reset.css               # CSS reset + scrollbar styling
│   │   │   └── typography.css          # Font sizes, weights, headings
│   │   ├── components/
│   │   │   ├── sidebar.css             # Dark gradient sidebar
│   │   │   ├── header.css              # Frosted-glass header with backdrop blur
│   │   │   ├── email-list.css          # Email items, toolbar, tabs
│   │   │   ├── buttons.css             # Button variants (primary, secondary, ghost)
│   │   │   ├── forms.css               # Input fields, labels, validation
│   │   │   ├── toast.css               # Toast notifications
│   │   │   ├── reminder.css            # Reminder bell, dropdown, dashboard cards
│   │   │   ├── summarizer.css          # AI summary card, priority badges
│   │   │   ├── smart-reply.css         # Reply chips, inline compose
│   │   │   ├── focus-mode.css          # Focus toggle switch, banner
│   │   │   └── duplicate.css           # Duplicate banner, review modal
│   │   └── pages/
│   │       ├── auth.css                # Glassmorphism login page
│   │       ├── app-layout.css          # Main app layout grid
│   │       ├── compose.css             # Compose email form
│   │       ├── mail-view.css           # Single email view
│   │       ├── settings.css            # Settings cards, toggles
│   │       └── subscriptions.css       # Subscription tracker UI
│   │
│   └── js/
│       ├── storage.js                  # localStorage abstraction layer
│       ├── gmail-api.js                # Gmail REST API wrapper (OAuth tokens)
│       ├── mail-service.js             # Data layer — Gmail API + demo fallback
│       ├── main.js                     # App entry point, auth guard, theme
│       ├── components/
│       │   ├── sidebar.js              # Sidebar with nav, badges, storage meter
│       │   ├── header.js               # Header with search, focus toggle, reminders
│       │   ├── email-list.js           # Reusable email list renderer
│       │   └── toast.js                # Toast notification system
│       ├── services/
│       │   ├── reminder-service.js     # Follow-up tracking + snooze logic
│       │   ├── summarizer-service.js   # NLP-style text analysis + summarization
│       │   ├── subscription-service.js # Subscription detection + management
│       │   ├── smart-reply-service.js  # Context-based reply generation
│       │   ├── focus-mode-service.js   # Email filtering + preference storage
│       │   └── duplicate-service.js    # Similarity detection + grouping
│       └── pages/
│           ├── auth.js                 # Google OAuth + demo login
│           ├── inbox.js                # Inbox with focus + duplicates
│           ├── mail.js                 # Email view with summarizer + replies
│           ├── compose.js              # Compose/reply/forward logic
│           ├── sent.js                 # Sent page controller
│           ├── starred.js              # Starred page controller
│           ├── drafts.js               # Drafts page controller
│           ├── trash.js                # Trash page controller
│           ├── reminders.js            # Reminders dashboard controller
│           ├── subscriptions.js        # Subscriptions page controller
│           └── settings.js             # Settings page controller
```

---

## Technical Highlights

### Clean Separation of Concerns
| Layer | Role | Files |
|-------|------|-------|
| **Services** | Business logic, data processing, AI algorithms | `services/*.js` |
| **Components** | Reusable UI elements injected dynamically | `components/*.js` |
| **Pages** | Page-specific controllers binding services to UI | `pages/*.js` |
| **Storage** | localStorage abstraction with namespacing | `storage.js` |
| **API** | Gmail REST API wrapper with token management | `gmail-api.js` |

### Design System
- **CSS Variables** — 60+ design tokens for colors, spacing, shadows, transitions
- **Glassmorphism** — Frosted glass effects with `backdrop-filter: blur()`
- **Dark/Light themes** — Full theme support via `[data-theme="dark"]` selectors
- **CSS Animations** — Page transitions, card entrances, toast slides, pulse effects
- **Mobile-first responsive** — Sidebar collapses, hamburger menu, fluid layouts

### Gmail API Integration
- **Google Identity Services** (GIS) for OAuth 2.0 token flow
- Scopes: `gmail.readonly`, `gmail.send`, `gmail.modify`, `userinfo.profile`, `userinfo.email`
- Direct REST API calls to `https://gmail.googleapis.com/gmail/v1/`
- MIME parsing: base64url decoding, HTML/plain text extraction from multipart messages
- Automatic token expiry handling with redirect to login

### AI / NLP Techniques (Pure JavaScript)
- **Weighted sentence scoring** for summary extraction (position, keyword density)
- **Keyword pattern matching** for priority detection (urgent/important/low-priority signals)
- **Regex-based entity extraction** for dates, times, action items
- **Email type classification** using keyword dictionaries (10+ categories)
- **Jaccard similarity** for duplicate subject-line comparison
- **Sender fingerprinting** for subscription detection (domain patterns, sender names)

---

## Getting Started

### Quick Start (Demo Mode)
```bash
# Clone and serve
cd Project_2
python3 -m http.server 8765

# Open http://localhost:8765
# Click "Sign In (Demo)" with any email/password
```

### Real Gmail Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Gmail API** (APIs & Services → Library)
4. Create **OAuth 2.0 Client ID** (Credentials → Create Credentials)
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:8765`
5. Copy the Client ID
6. Open PulseMail → Click **"Sign in with Google"**
7. Paste your Client ID when prompted
8. Authorize with your Google account

---

## Design Principles

- **Zero Dependencies** — Pure HTML, CSS, JavaScript. No React, no Tailwind, no npm.
- **Modular Architecture** — Each feature is an independent service module
- **Progressive Enhancement** — Works in demo mode, enhanced with real Gmail
- **Offline-first** — All AI features work with localStorage, no server needed
- **Professional Code Quality** — Clean naming, separated concerns, reusable components
- **Accessible** — Semantic HTML, ARIA labels, keyboard navigable
- **Performant** — No build step, minimal DOM manipulation, efficient rendering

---

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 90+     |
| Firefox | 88+     |
| Safari  | 14+     |
| Edge    | 90+     |

---

## Skills Demonstrated

- Vanilla JavaScript (ES6+) — async/await, destructuring, template literals, modules
- CSS3 — Variables, Grid, Flexbox, animations, glassmorphism, backdrop-filter
- REST API Integration — OAuth 2.0, Gmail API, fetch with auth headers
- Data Persistence — localStorage with namespaced abstraction layer
- NLP / Text Analysis — Sentence scoring, regex extraction, similarity algorithms
- Component Architecture — Reusable, dynamically rendered UI components
- Responsive Design — Mobile-first with breakpoints and adaptive layouts
- State Management — Service layer pattern with centralized data flow

---

*Built as a portfolio project demonstrating advanced frontend skills with real-world API integration and AI-powered features.*

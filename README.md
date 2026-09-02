# MEDILOOP — "Share. Connect. Save Lives."

> A production-grade B2B medical equipment sharing and rental web application designed for healthcare facilities in Tier-2, Tier-3, semi-urban, and rural communities.

---

## 🏥 Problem & Solution

**The Problem:**
Small and rural healthcare facilities frequently struggle to access costly medical equipment when needed—especially during critical ICU surges, equipment breakdowns, or emergency trauma cases. This leads to delayed diagnoses, preventable referrals, and revenue loss, while high-value medical devices in nearby facilities remain underutilized.

**The Solution:**
**Mediloop** connects healthcare facilities requiring medical equipment with verified partner healthcare facilities that have idle capacity for temporary rental.

---

## 🌟 Complete End-to-End User Journey (10+ Screens)

1. **Screen 1: Splash / Onboarding (`/`)**
   - Brand identity, tagline *"Share. Connect. Save Lives."*, impact metrics, and equipment preview.
2. **Screen 2: Login / Sign Up (`/login`, `/signup`)**
   - Authentication with 1-click demo autofill pills for instant customer & provider simulation.
3. **Screen 3: Home / Dashboard (`/dashboard`)**
   - Live greeting for *City Care Hospital*, dynamic search bar, quick actions, category carousel with item counts, and nearby verified equipment.
4. **Screens 4 & 5: Search Equipment & Live Results (`/search`)**
   - Real-time search query matching and multi-dimensional filters (Category, Distance, Price Range, Availability status, Sorting) with live result count counter.
5. **Screen 6: Equipment Details (`/equipment/[id]`)**
   - Full technical and clinical specification sheet (Model, Year, Condition, Included Accessories, Delivery Options, Last Biomedical Calibration Date, Power/Battery specs, Provider profile).
6. **Screen 7: Request Equipment Form (`/equipment/[id]/request`)**
   - Date range picker with automatic rental days calculation, daily price estimate, clinical purpose dropdown, urgency level, and instant validation.
7. **Screen 8: Request Sent Confirmation (`/request-sent/[id]`)**
   - Confirmation receipt with request tracking ID and immediate database persistence.
8. **Screen 9: My Requests (`/requests`)**
   - Tabbed status manager (`All`, `Pending`, `Accepted`, `Rejected`) with real-time status badges and direct booking link.
9. **Screen 10: Booking Confirmation (`/booking-confirmed/[id]`)**
   - Confetti celebration, confirmed booking number (`#ML-2026-XXXX`), dates, and logistics overview.
10. **Screen 11: My Bookings (`/bookings`)**
    - Tabbed view (`Confirmed`, `Active`, `Completed`) with automated total price calculation ($ days × ₹/day).
11. **Screen 12: Digital Rental Pass (`/bookings/[id]`)**
    - Printable official medical pass with QR code, provider signature verification, and express logistics tracking.
12. **Screen 13: Healthcare Facility Profile (`/profile`)**
    - Hospital details (Tier, Inpatient bed capacity, Address, Registration, Contact).
13. **Screen 14: Provider Operations Hub (`/provider`)**
    - Metrics (Listed Equipment, Pending Requests, Active Rentals, Revenue ₹), incoming requests queue with **[Accept Request]** & **[Reject Request]** actions, and **[List New Equipment]** modal.

---

## 🔑 Demo Accounts & Quick Role Switcher

Use the interactive **"Simulating: [Facility Name]"** pill in the top header or log in directly with:

| Role | Hospital / Facility | Email | Password |
| :--- | :--- | :--- | :--- |
| **Requester / Customer** | City Care Hospital (Tier-3) | `demo@mediloop.com` | `demo123` |
| **Equipment Provider** | City Hospital & Research (Tier-2) | `provider@mediloop.com` | `demo123` |
| **Specialty Provider** | HealthPlus Trauma Clinic (Semi-Urban) | `vikram@healthplus.com` | `demo123` |

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend:** Next.js Route Handlers, Server Components, Cookie Session Handling.
- **Database & ORM:** Prisma ORM, SQLite (`prisma/dev.db`).
- **Assets:** High-resolution vector SVGs in `/public/equipment/` with guaranteed fallback handlers.

---

## 🚀 Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Push database schema & seed realistic equipment data
npm run db:push
npm run db:seed

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

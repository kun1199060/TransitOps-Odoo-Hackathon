# TransitOps — Fleet Command Console

Smart Transport Operations Platform · Odoo Hackathon 2026

## Kya Bana Hua Hai (already built)

- ✅ Login/Signup with 4 roles (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst)
- ✅ Dashboard with live KPIs
- ✅ Vehicle Registry — full CRUD, unique reg no. validation
- ✅ Driver Management — full CRUD, license expiry warning
- ✅ Trip Dispatcher — full lifecycle (Draft→Dispatched→Completed→Cancelled) with ALL mandatory business rules
- ✅ Maintenance — auto status flip (Available ↔ In Shop)
- ✅ Fuel & Expense tracking
- ✅ Analytics — fuel efficiency, utilization, ROI, cost chart
- ✅ Settings & RBAC matrix

## Setup Steps (5 minutes)

### 1. Firebase Project Banao
1. Jao: https://console.firebase.google.com
2. "Add project" → naam do (jaise `transitops-hackathon`) → Continue
3. Left sidebar → **Build → Authentication** → "Get started" → **Email/Password** provider ko enable karo
4. Left sidebar → **Build → Firestore Database** → "Create database" → **Start in test mode** (hackathon ke liye theek hai) → enable
5. Left sidebar → **Project Settings** (gear icon) → scroll down to "Your apps" → click **Web icon (`</>`)** → app naam do → "Register app"
6. Jo `firebaseConfig` object dikhega, use copy kar lo

### 2. Config Paste Karo
`src/lib/firebase.js` file kholo aur apna copied config paste karo (jaha `YOUR_API_KEY` likha hai wahan).

### 3. Install & Run
```bash
npm install
npm run dev
```

Browser mein `http://localhost:5173` khul jayega.

### 4. Test Karo
1. Signup page pe naya account banao (koi bhi role select karo, jaise "Dispatcher")
2. Login ho jaoge, Dashboard dikhega
3. **Fleet** page pe jaake pehle kuch vehicles add karo
4. **Drivers** page pe kuch drivers add karo
5. **Trips** page pe trip banao — dekhoge ki system automatically capacity check karta hai, expired/suspended drivers ko hide karta hai

## Business Rules Jo Implement Hain (`src/lib/rules.js` file dekho)

Sab rules ek hi file mein hain taaki demo/explain karna easy ho:
- Vehicle registration number unique hona chahiye
- Retired/In Shop vehicles dispatch list mein nahi dikhte
- Expired license / suspended drivers assign nahi ho sakte
- Cargo weight > vehicle capacity → dispatch blocked
- Dispatch → vehicle + driver dono "On Trip"
- Complete → dono wapas "Available"
- Cancel dispatched trip → dono wapas "Available"
- Maintenance record banate hi vehicle "In Shop"
- Maintenance close karte hi vehicle "Available" (agar retired nahi hai)

## Agla Kya Karna Hai (extend karne ke liye)

- Analytics ROI calculation abhi assume kar raha hai revenue = ₹15/km — apne data ke hisab se adjust karo `src/pages/Analytics.jsx` mein
- CSV export add karna ho to `papaparse` library already installable hai
- PDF export bonus feature hai, time bache to add karo

## Folder Structure

```
src/
  components/     → Sidebar, StatusPill (reusable UI)
  context/        → AuthContext (login state, RBAC)
  lib/            → firebase.js, rules.js (business logic), useCollection.js
  pages/          → Login, Dashboard, Fleet, Drivers, Trips, Maintenance, Fuel, Analytics, Settings
```

## Design System

Theme: "Fleet Command Console" — dark dispatch-console aesthetic
- Background: `#0A0D12` (deep charcoal)
- Accent: `#FF9B3D` (amber signal light — like real dispatch systems)
- Fonts: Space Grotesk (headings), Inter (body), JetBrains Mono (data/numbers)
- Status colors: green=Available, blue=On Trip, amber=In Shop, red=Retired/Suspended

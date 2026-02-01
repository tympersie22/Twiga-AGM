# Twiga AGM – Property Management System

Property Management System (PMS) for **Twiga Residence**: booking engine, Flutterwave payments (mobile money + card), and admin dashboard. Built for East Africa (Tanzania/Zanzibar).

## Features

- **Guest booking site** – Next.js 14, room selection, dates, 50% deposit
- **Payments** – Flutterwave: mobile money (M-Pesa, Airtel, Tigo), card, pay on arrival
- **Admin dashboard** – Stats, recent bookings, charts (Firestore)
- **Firebase** – Firestore, Cloud Functions (initiate payment, webhook, poll, refund, confirm/cancel booking, iCal)
- **Shared package** – Types and utils (`@twiga/shared`)

## Project structure

```
Twiga-AGM/
├── apps/
│   ├── web/          # Guest booking (Next.js, port 3000)
│   └── admin/        # Admin dashboard (Next.js, port 3001)
├── packages/
│   ├── shared/       # Types, validation, formatting, errors
│   └── functions/    # Firebase Cloud Functions (payments, bookings, iCal)
├── package.json
├── turbo.json
└── README.md
```

## Quick start

### Prerequisites

- Node.js 18+
- Firebase project
- Flutterwave account (Tanzania)

### 1. Clone and install

```bash
git clone https://github.com/tympersie22/Twiga-AGM.git
cd Twiga-AGM
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
# Edit .env.local with:
# - NEXT_PUBLIC_FIREBASE_* (from Firebase Console)
# - NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY
# - FLUTTERWAVE_SECRET_KEY (in Firebase Functions config)
# - NEXT_PUBLIC_WEB_URL, NEXT_PUBLIC_ADMIN_URL
```

### 3. Run locally

```bash
# From repo root
npm run dev
```

- Guest site: http://localhost:3000  
- Admin: http://localhost:3001  

### 4. Firebase setup

- Create a Firebase project and enable Firestore, Auth (e.g. Email/Password or Anonymous for guests).
- Deploy rules and (optionally) init data:

```bash
cd packages/functions
npm install
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules
# Optional: run firestore-init to seed company, property, rooms
```

- Deploy Cloud Functions (set `FLUTTERWAVE_SECRET_KEY`, `WEB_URL` in Firebase config):

```bash
cd packages/functions
npm run build
firebase deploy --only functions
```

- In Flutterwave dashboard, set webhook URL to your `handleFlutterwaveWebhook` function URL.

### 5. Push to GitHub

From your machine (outside this environment), in the project folder:

```bash
cd /path/to/Twiga-AGM
git init
git add .
git commit -m "feat: Twiga AGM PMS – web, admin, functions, shared"
git remote add origin https://github.com/tympersie22/Twiga-AGM.git
git branch -M main
git push -u origin main
```

## Scripts

| Command | Description |
|--------|--------------|
| `npm run dev` | Run web + admin in dev (Turbo) |
| `npm run build` | Build all apps/packages |
| `npm run deploy:functions` | Deploy Firebase Functions |
| `npm run deploy:web` | Deploy web app (e.g. Vercel) |
| `npm run deploy:admin` | Deploy admin app (e.g. Vercel) |

## Payment flow

1. Guest selects room and dates on **web** → continues to payment.
2. **PaymentForm** calls Cloud Function `initiatePayment` (auth required; use Anonymous Auth for guests if desired).
3. Function creates booking + payment in Firestore and returns Flutterwave `paymentLink`.
4. Client redirects to Flutterwave; user pays (mobile money or card).
5. Flutterwave sends webhook to `handleFlutterwaveWebhook` → payment and booking status updated.
6. Optional: `pollPaymentStatus` for mobile money until webhook is received.

## Security

- Firestore rules: admins per company; guests can read/update own booking by email.
- Webhook: verify Flutterwave signature (verif-hash / verificationhash) in `handleFlutterwaveWebhook`.
- Keep `FLUTTERWAVE_SECRET_KEY` and Firebase keys in env/secrets only.

## License

MIT.

---

**Twiga AGM** – Dar es Salaam, Tanzania.

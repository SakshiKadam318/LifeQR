# ❤️‍🔥 LifeQR — Emergency Medical Identity

> **One QR Code. One Tap. One Life Saved.**

LifeQR is a full-stack emergency medical identity app. When you're in an accident and can't speak, a rescuer scans your QR code (on your helmet, bike, wallet card, or car dashboard) and instantly gets your medical info and can call your family — with one tap.

---

## 🚀 Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd lifeqr

# Install backend
cd backend
cp .env.example .env
npm install

# Install frontend
cd ../frontend
npm install
```

### 2. Start the backend

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### 3. Start the frontend

```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

### 4. Open in browser

Go to **http://localhost:3000** — register, fill your profile, generate your QR, and print your card!

---

## 📁 Project Structure

```
lifeqr/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server entry
│   │   ├── models/db.js          # SQLite database + schema
│   │   ├── middleware/auth.js    # JWT authentication
│   │   └── routes/
│   │       ├── auth.js           # Register / Login
│   │       ├── profile.js        # Medical profile + contacts
│   │       ├── qr.js             # QR generation + scan logs
│   │       └── public.js         # Public scan endpoint (no auth)
│   ├── data/                     # SQLite database file (auto-created)
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/index.html
    └── src/
        ├── App.js                # Router setup
        ├── index.js / index.css  # Entry + global styles
        ├── context/AuthContext.js
        ├── components/Navbar.js
        └── pages/
            ├── Home.js           # Landing page
            ├── Login.js          # Sign in
            ├── Register.js       # Create account
            ├── Dashboard.js      # Overview + stats
            ├── Profile.js        # Medical info + contacts editor
            ├── QRPage.js         # QR generator + printable cards
            ├── ScanPage.js       # 🚨 Rescue page (what rescuers see)
            └── ScanLogs.js       # Scan history
```

---

## 🔑 Key Features

### For the QR Card Owner
- ✅ Register & login securely (JWT + bcrypt)
- ✅ Fill medical profile: blood type, allergies, conditions, medications
- ✅ Add emergency contacts (family phone numbers — hidden from public)
- ✅ Generate unique QR code (refreshable, expires in 30 days)
- ✅ **4 printable card styles:**
  - 💳 Wallet Card (85×54mm)
  - 🪖 Helmet Sticker (60×60mm square)
  - 🚗 Car/Dashboard Card (120×60mm wide)
  - 🪪 ID Badge (54×85mm portrait)
- ✅ View full scan history (who scanned, when, where)

### For the Rescuer (Scan Page)
- ✅ No app needed — works in any phone browser
- ✅ Fingerprint verification gate (accountability logging)
- ✅ Shows: name, blood type, allergies, conditions, medications
- ✅ **"Call Now" button** — number hidden, one tap calls the family
- ✅ Multiple emergency contacts in priority order
- ✅ "View on Maps" to share accident location
- ✅ Works without internet (if cached)

### Security & Safety
- ✅ Every scan logged with: timestamp, IP address, fingerprint hash, GPS location
- ✅ Phone numbers never displayed — only "Call Now" button
- ✅ QR tokens can be refreshed (old ones instantly deactivated)
- ✅ JWT-secured API with bcrypt passwords

---

## 🖨️ Printing Your QR Card

1. Go to **My QR** → choose your card style
2. Click **Print [Card Name]**
3. A print-ready page opens — use Ctrl+P / Cmd+P
4. **Recommended:** Print on 200gsm cardstock
5. **For helmets/bikes:** Use weatherproof vinyl sticker paper
6. **For wallets:** Laminate after printing
7. Test scan with your phone before placing permanently!

---

## 🗄️ Database Schema

| Table | Description |
|---|---|
| `users` | Login credentials (email + hashed password) |
| `profiles` | Medical info (blood type, allergies, etc.) |
| `emergency_contacts` | Family contacts (private, call-only) |
| `qr_tokens` | Active QR codes with expiry |
| `scan_logs` | Every scan event with fingerprint + location |

---

## 🔮 Suggested Next Features

| Feature | Description |
|---|---|
| 📱 SMS on scan | Auto-SMS family when QR is scanned (Twilio) |
| 🌍 Multi-language | Auto-detect rescuer's phone language |
| 📄 PDF medical report | Downloadable for hospitals |
| 🔔 Push notifications | Alert owner when QR is scanned |
| 🏥 Hospital integration | Direct API to nearby hospital emergency |
| ⌚ Watch/wearable QR | NFC + QR for smartwatch band |

---

## 💻 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router v6 |
| Styling | Pure CSS (no frameworks) |
| Backend | Node.js, Express.js |
| Database | SQLite via better-sqlite3 |
| Auth | JWT + bcrypt |
| QR Generation | `qrcode` npm package |
| Fingerprint | WebAuthn API (device biometrics) |

---

## 📄 License

MIT — Free to use, modify, and deploy.

---

*LifeQR — Because in an emergency, every second counts.*

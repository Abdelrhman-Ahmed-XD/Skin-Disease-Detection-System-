# 🩺 SkinSight — Skin Disease Detection System

A full-stack mobile application built with **React Native (Expo)** and a **Flask** backend for AI-powered skin disease detection. Users can photograph skin conditions, get AI analysis, and track moles over time.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Environment Setup](#environment-setup)
6. [Firebase Setup](#firebase-setup)
7. [Google Sign-In Setup](#google-sign-in-setup)
8. [Facebook Sign-In Setup](#facebook-sign-in-setup)
9. [Cloudinary Setup](#cloudinary-setup)
10. [Flask Backend Setup](#flask-backend-setup)
11. [Deploying Flask — Choose Your Option](#deploying-flask--choose-your-option)
12. [Running the App](#running-the-app)
13. [Building for Production](#building-for-production)
14. [Common Issues](#common-issues)
15. [Security Reminders](#security-reminders)

---

## Project Overview

SkinSight allows users to:
- Capture or upload photos of skin conditions
- Get AI-powered analysis using CNN and UNet models
- Track moles over time on a body map
- Sign in with Email, Google, or Facebook
- Reset passwords via OTP email verification

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native + Expo (TypeScript) |
| Navigation | Expo Router |
| Backend | Python Flask |
| Database | Firebase Firestore |
| Authentication | Firebase Auth |
| Image Storage | Cloudinary |
| AI Models | TensorFlow/Keras (CNN) + PyTorch (UNet) |
| Deployment | Fly.io / Render / Railway / Oracle Cloud / DigitalOcean |

---

## Prerequisites

Make sure you have the following installed before starting:

- **Node.js** v18 or higher → [nodejs.org](https://nodejs.org)
- **Python** 3.9 or higher → [python.org](https://python.org)
- **Expo CLI** → `npm install -g expo-cli`
- **Git** → [git-scm.com](https://git-scm.com)
- **Android Studio** (for Android emulator) or a physical device with **Expo Go**
- A **Google account** (for Firebase & Google Sign-In)
- A **Facebook Developer account** (for Facebook Sign-In)

---

## Project Structure

```
Skin-Disease-Detection-System/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout & auth guard
│   ├── Login1.tsx              # Login screen
│   ├── SignUp.tsx              # Sign up screen
│   ├── Forgetpassword.tsx      # Forgot password
│   ├── Resetpassword.tsx       # Reset password
│   └── Screensbar/             # Main app screens
├── Firebase/
│   ├── firebaseConfig.ts       # Firebase initialization
│   └── firestoreService.ts     # Firestore helpers
├── assets/                     # Images, fonts
├── android/                    # Android native project
├── Backend/                    # Flask backend
│   ├── app.py                  # Main Flask app
│   ├── config.py               # Firebase + Gmail config
│   ├── email_templates.py      # HTML email templates
│   ├── requirements.txt        # Python dependencies
│   ├── fly.toml                # Fly.io deployment config
│   ├── render.yaml             # Render deployment config
│   ├── railway.toml            # Railway deployment config
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py             # Auth routes
│   │   └── emails.py           # Email routes
│   └── serviceAccountKey.json  # Firebase Admin (never commit!)
├── .env                        # Environment variables (never commit!)
├── app.json                    # Expo config
└── package.json
```

---

## Environment Setup

### 1. Clone the repository

```bash
git clone https://github.com/Abdelrhman-Ahmed-XD/Skin-Disease-Detection-System.git
cd Skin-Disease-Detection-System
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Create your `.env` file

Create a `.env` file in the **project root** (same level as `package.json`):

```env
# ── Gmail SMTP (Flask backend) ────────────────────
GMAIL_EMAIL=
GMAIL_PASSWORD=

# ── Flask Backend URL ─────────────────────────────
# Uncomment ONE option below depending on where you run the backend:

# Option A — Local (find your IP with `ipconfig` on Windows):
EXPO_PUBLIC_FLASK_URL=http://192.168.x.x:5000

# Option B — Fly.io:
# EXPO_PUBLIC_FLASK_URL=https://skinsight-backend.fly.dev

# Option C — Render:
# EXPO_PUBLIC_FLASK_URL=https://skinsight-backend.onrender.com

# Option D — Railway:
# EXPO_PUBLIC_FLASK_URL=https://your-app.up.railway.app

# Option E — Oracle Cloud / VPS:
# EXPO_PUBLIC_FLASK_URL=http://your-server-ip:5000

# ── Cloudinary ────────────────────────────────────
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=
EXPO_PUBLIC_CLOUDINARY_API_KEY=
EXPO_PUBLIC_CLOUDINARY_API_SECRET=
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

# ── Firebase ──────────────────────────────────────
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=

# ── Google Sign-In ────────────────────────────────
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=

# ── Facebook Sign-In ──────────────────────────────
EXPO_PUBLIC_FACEBOOK_APP_ID=
EXPO_PUBLIC_FACEBOOK_APP_SECRET=
EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN=
```

> ⚠️ **Never commit your `.env` file to GitHub.** Make sure `.env` is in your `.gitignore`.

---

## Firebase Setup

### 1. Create a Firebase project
- Go to [console.firebase.google.com](https://console.firebase.google.com)
- Click **Add project** → name it `SkinSight` → click **Create project**

### 2. Enable Authentication
- Go to **Authentication → Sign-in method**
- Enable **Email/Password**
- Enable **Google** (paste your Web Client ID when prompted)
- Enable **Facebook** (paste your Facebook App ID and Secret when prompted)
- Copy the **OAuth redirect URI** Firebase gives you for Facebook — you will need it later

### 3. Create Firestore Database
- Go to **Firestore Database → Create database**
- Choose **Start in production mode** → select your region → click **Enable**

### 4. Get your Firebase config
- Go to **Project Settings** (gear icon ⚙️) → **Your apps**
- Click **Add app** → choose **Web** (</>)
- Register the app → copy the config values into your `.env`

---

## Google Sign-In Setup

### 1. Go to Google Cloud Console
- Visit [console.cloud.google.com](https://console.cloud.google.com)
- Select your Firebase project from the dropdown

### 2. Configure OAuth Consent Screen
- Go to **APIs & Services → OAuth consent screen**
- Choose **External** → click **Create**
- Fill in App name (`SkinSight`), support email, and developer email
- Click **Save and Continue** through all steps

### 3. Create OAuth Client IDs
Go to **APIs & Services → Credentials → + Create Credentials → OAuth 2.0 Client ID**

**Web Client ID:**
- Type: **Web application**
- Name: `SkinSight Web`
- Authorized redirect URI:
  ```
  https://auth.expo.io/@your-expo-username/SkinDisease
  ```
- Paste the Client ID into `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

**Android Client ID:**
- Type: **Android**
- Package name: `com.samuelmilad.skindisease`
- SHA-1 fingerprint — run from inside the `android/` folder:
  ```bash
  keytool -list -v -keystore app/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```
- SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- Paste the Client ID into `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

**iOS Client ID:**
- Type: **iOS**
- Bundle ID: `com.samuelmilad.skindisease`
- Paste the Client ID into `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

---

## Facebook Sign-In Setup

### 1. Create a Facebook App
- Go to [developers.facebook.com](https://developers.facebook.com)
- Click **My Apps → Create App → Consumer**
- Enter app name `SkinSight` → click **Create App**

### 2. Get your credentials
- Go to **Settings → Basic**
  - Copy **App ID** → paste into `EXPO_PUBLIC_FACEBOOK_APP_ID` and `app.json`
  - Click **Show** next to App Secret → paste into `EXPO_PUBLIC_FACEBOOK_APP_SECRET`
- Go to **Settings → Advanced**
  - Copy **Client Token** → paste into `EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN` and `app.json`

### 3. Add Facebook Login product
- Click **Add Product → Facebook Login → Set Up**
- Go to **Facebook Login → Settings**
- Under **Valid OAuth Redirect URIs** add:
  ```
  https://your-project-id.firebaseapp.com/__/auth/handler
  ```

### 4. Configure app.json
```json
[
  "react-native-fbsdk-next",
  {
    "appID": "your_facebook_app_id",
    "clientToken": "your_facebook_client_token",
    "displayName": "SkinSight",
    "advertiserIDCollectionEnabled": false,
    "autoLogAppEventsEnabled": false,
    "isAutoInitEnabled": true
  }
]
```

---

## Cloudinary Setup

### 1. Create a Cloudinary account
- Go to [cloudinary.com](https://cloudinary.com) and sign up for free

### 2. Get your credentials
From the dashboard copy:
- **Cloud Name** → `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`
- **API Key** → `EXPO_PUBLIC_CLOUDINARY_API_KEY`
- **API Secret** → `EXPO_PUBLIC_CLOUDINARY_API_SECRET`

### 3. Create an Upload Preset
- Go to **Settings → Upload → Upload presets → Add upload preset**
- Set Signing Mode to **Unsigned**
- Name it `skinsight_uploads`
- Paste the name into `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

---

## Flask Backend Setup

### 1. Navigate to the Backend folder
```bash
cd Backend
```

### 2. Create and activate a virtual environment

**Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

**Mac/Linux:**
```bash
python -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Add Firebase Admin SDK credentials
- Go to Firebase Console → **Project Settings → Service Accounts**
- Click **Generate new private key** → download the JSON file
- Save it as `serviceAccountKey.json` inside the `Backend/` folder

> ⚠️ Add `serviceAccountKey.json` to `.gitignore` — never push this to GitHub.

### 5. Run locally
```bash
python app.py
```

The backend runs on `http://localhost:5000`.

> **Running on a physical device?** Your phone and computer must be on the same WiFi. Find your computer's local IP by running `ipconfig` on Windows or `ifconfig` on Mac/Linux (look for the `192.168.x.x` address). Then update your `.env`:
> ```env
> EXPO_PUBLIC_FLASK_URL=http://192.168.x.x:5000
> ```
> Replace `x.x` with your actual IP. Run `npx expo start --clear` after changing it.

---

## Deploying Flask — Choose Your Option

| Option | Cost | SMTP Email | AI Models | Difficulty |
|---|---|---|---|---|
| **A — Local** | Free | ✅ | ✅ | Easy (dev only) |
| **B — Fly.io** | Free | ✅ | ⚠️ 256MB RAM | Easy |
| **C — Render** | Free | ❌ Blocked | ❌ Too small | Easy |
| **D — Railway** | Free ($5 credit) | ❌ Blocked | ❌ Too small | Easy |
| **E — Oracle Cloud** | Free forever | ✅ | ✅ 24GB RAM | Medium |
| **F — DigitalOcean** | ~$6/month | ✅ | ✅ | Medium |
| **G — Google Cloud** | Pay-as-you-go | ✅ | ✅ | Medium |

> **Recommended path:** Use **Fly.io** now → switch to **Oracle Cloud** or **DigitalOcean** when adding AI models.

---

### Option A — Local (Development Only)

No deployment needed. Just run Flask locally and connect your phone on the same WiFi.

```bash
cd Backend
python app.py
```

Update `.env` with your local IP:
```env
EXPO_PUBLIC_FLASK_URL=http://192.168.x.x:5000
```

Then restart Expo:
```bash
npx expo start --clear
```

---

### Option B — Fly.io ✅ Recommended Free Option

✅ No credit card · ✅ SMTP email works · ⚠️ 256MB RAM (upgrade when adding AI models)

#### 1. Install Fly.io CLI

**Windows (PowerShell):**
```powershell
powershell -ExecutionPolicy Bypass -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**Mac/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

#### 2. Sign up and login
```bash
fly auth signup   # opens browser — sign up with GitHub (no card needed)
fly auth login    # if you already have an account
```

#### 3. Add fly.toml inside Backend folder

```toml
app = "skinsight-backend"
primary_region = "cdg"

[build]

[env]
  PORT = "5000"

[http_service]
  internal_port = 5000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory = "256mb"
  cpu_kind = "shared"
  cpus = 1
```

#### 4. Deploy
```bash
cd Backend
fly deploy
```

#### 5. Set environment variables
```bash
fly secrets set GMAIL_EMAIL=your_gmail@gmail.com
fly secrets set GMAIL_PASSWORD=your_app_password
fly secrets set FIREBASE_SERVICE_ACCOUNT_JSON='paste entire serviceAccountKey.json contents here'
```

#### 6. Get your live URL
```bash
fly status
```
Your URL: `https://skinsight-backend.fly.dev`

#### 7. Update `.env`
```env
EXPO_PUBLIC_FLASK_URL=https://skinsight-backend.fly.dev
```

#### 8. Redeploy after changes
```bash
cd Backend && fly deploy
```

#### 9. View live logs
```bash
fly logs
```

> When ready to add AI models, scale up:
> ```bash
> fly scale memory 2048
> ```

---

### Option C — Render (Free, Limited)

⚠️ SMTP email is **blocked** on free tier · Sleeps after 15 min inactivity

#### 1. Add render.yaml inside Backend folder

```yaml
services:
  - type: web
    name: skinsight-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
```

#### 2. Push to GitHub, then go to [render.com](https://render.com)
- New → Web Service → connect repo
- Root Directory: `Backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn app:app`

#### 3. Add environment variables

| Key | Value |
|---|---|
| `GMAIL_EMAIL` | your Gmail |
| `GMAIL_PASSWORD` | your app password |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | entire contents of `serviceAccountKey.json` |

#### 4. Update `.env`
```env
EXPO_PUBLIC_FLASK_URL=https://skinsight-backend.onrender.com
```

---

### Option D — Railway (Free $5 credit, Limited)

⚠️ SMTP email is **blocked** · Requires credit card after free credit runs out

#### 1. Add railway.toml inside Backend folder

```toml
[build]
builder = "nixpacks"
buildCommand = "pip install -r requirements.txt"

[deploy]
startCommand = "gunicorn app:app"
restartPolicyType = "on_failure"
```

#### 2. Go to [railway.app](https://railway.app) → sign up with GitHub
- New Project → Deploy from GitHub repo
- Root Directory: `Backend`

#### 3. Add environment variables in Railway dashboard → Variables tab

| Key | Value |
|---|---|
| `GMAIL_EMAIL` | your Gmail |
| `GMAIL_PASSWORD` | your app password |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | entire contents of `serviceAccountKey.json` |

#### 4. Update `.env`
```env
EXPO_PUBLIC_FLASK_URL=https://your-app.up.railway.app
```

---

### Option E — Oracle Cloud (Free Forever) ✅ Best Long-Term Free Option

✅ Free forever · ✅ 4 CPUs + 24GB RAM · ✅ SMTP works · ✅ Supports AI models  
Requires credit card for identity verification (€0.95 temporary hold, automatically refunded)

#### 1. Create account
- Go to [cloud.oracle.com](https://cloud.oracle.com) → sign up → choose **Always Free** tier

#### 2. Create a VM instance
- Compute → Instances → Create Instance
- Image: **Ubuntu 22.04**
- Shape: **VM.Standard.A1.Flex** (4 CPUs, 24GB RAM — Always Free)
- Download the SSH key pair when prompted

#### 3. Open firewall port
- Networking → Virtual Cloud Networks → Security Lists → Add Ingress Rule
- Protocol: TCP, Port: 5000

#### 4. Connect and set up server
```bash
ssh -i your-key.pem ubuntu@your-server-ip

sudo apt update && sudo apt upgrade -y
sudo apt install python3 python3-pip python3-venv git -y

git clone https://github.com/Abdelrhman-Ahmed-XD/Skin-Disease-Detection-System.git
cd Skin-Disease-Detection-System/Backend

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export GMAIL_EMAIL=your_gmail@gmail.com
export GMAIL_PASSWORD=your_app_password
export FIREBASE_SERVICE_ACCOUNT_JSON='paste entire serviceAccountKey.json contents'

gunicorn app:app --bind 0.0.0.0:5000 --daemon
```

#### 5. Update `.env`
```env
EXPO_PUBLIC_FLASK_URL=http://your-server-ip:5000
```

---

### Option F — DigitalOcean (~$6/month) ✅ Best Paid Option

✅ Simple setup · ✅ SMTP works · ✅ Supports AI models · $200 free credit for 60 days

#### 1. Create a Droplet
- Go to [digitalocean.com](https://digitalocean.com) → Create → Droplets
- Image: **Ubuntu 22.04**
- Plan: **Basic $6/month** (1 CPU, 1GB RAM) or **$12/month** (2GB RAM for AI models)

#### 2. Follow same server setup as Oracle Cloud (steps 3–5 above)

---

### Option G — Google Cloud (Pay-as-you-go)

$300 free credit for 90 days, then pay-as-you-go.

- Go to [cloud.google.com](https://cloud.google.com)
- Compute Engine → VM Instances → Create
- Choose **e2-medium** (2 vCPUs, 4GB RAM)
- Follow same server setup as Oracle Cloud

---

## Running the App

### 1. Start the Flask backend (local development)
```bash
cd Backend
.venv\Scripts\activate   # Windows
python app.py
```

### 2. Start the Expo dev server
```bash
npx expo start --clear
```

### 3. Open on your device
- **Physical device:** Install [Expo Go](https://expo.dev/go) and scan the QR code
- **Android emulator:** Press `a` in the terminal
- **iOS simulator:** Press `i` in the terminal (Mac only)

---

## Building for Production

### 1. Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### 2. Configure EAS
```bash
eas build:configure
```

### 3. Build for Android
```bash
eas build --platform android
```

### 4. Build for iOS
```bash
eas build --platform ios
```

---

## Common Issues

| Error | Fix |
|---|---|
| `Firebase: Error (auth/invalid-api-key)` | Run `npx expo start --clear` to reload env variables |
| `Client Id androidClientId must be defined` | Add `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` to `.env` |
| `missing appID in the plugin properties` | Add Facebook plugin config with `appID` to `app.json` |
| `Keystore file does not exist` | Run keytool from inside the `android/` folder |
| Flask connection refused on device | Use your local IP instead of `localhost` in `.env` |
| Email not received | Check spam folder; verify Gmail app password is correct |
| `Network is unreachable` on server | SMTP port blocked — switch to Fly.io, Oracle, or DigitalOcean |
| Render/Railway email fails | SMTP is blocked on these platforms — use Option B, E, or F |
| Render first request is slow | Free tier sleeps after 15 min inactivity — expected behavior |
| Fly.io build fails | Check `Backend/fly.toml` exists and `primary_region` is correct |
| `Tag mismatch` Gradle error | Clear Gradle cache: `rd /s /q "%USERPROFILE%\.gradle\caches"` |

---

## Security Reminders

- ✅ Add `.env` to `.gitignore`
- ✅ Never commit `serviceAccountKey.json` to GitHub
- ✅ Store Firebase credentials as `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable on all platforms
- ✅ Keep Facebook App Secret server-side only
- ✅ Rotate any API keys that were accidentally pushed to GitHub
- ✅ Use Gmail App Passwords (not your real Gmail password) for SMTP
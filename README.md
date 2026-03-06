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
11. [Deploying Flask to Render](#deploying-flask-to-render)
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
- Reset passwords via Firebase email verification

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
| Deployment | Render (Flask backend) |

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
- A **Render account** (free) → [render.com](https://render.com)

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
├── backend/                    # Flask backend
│   ├── app.py                  # Main Flask app
│   ├── requirements.txt        # Python dependencies
│   ├── render.yaml             # Render deployment config
│   └── serviceAccountKey.json  # Firebase Admin (never commit!)
├── .env                        # Environment variables (never commit!)
├── app.json                    # Expo config
└── package.json
```

---

## Environment Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Skin-Disease-Detection-System.git
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

# ── Flask Backend ─────────────────────────────────
# Local development:
EXPO_PUBLIC_FLASK_URL=http://192.168.x.x:5000
# After deploying to Render, replace with your Render URL:
# EXPO_PUBLIC_FLASK_URL=https://your-app-name.onrender.com
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
- Copy the SHA1 value and paste it into Google Cloud Console
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

### 1. Navigate to the backend folder
```bash
cd backend
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
- Save it as `serviceAccountKey.json` inside the `backend/` folder

> ⚠️ Add `serviceAccountKey.json` to `.gitignore` — never push this to GitHub.

### 5. Run locally
```bash
python app.py
```

The backend runs on `http://localhost:5000`.

> When testing on a **physical device**, replace `localhost` with your machine's local IP address (e.g. `http://192.168.1.5:5000`). Find your IP by running `ipconfig` on Windows or `ifconfig` on Mac/Linux.

---

## Deploying Flask to Render

### 1. Prepare your backend for deployment

Create a `render.yaml` file inside your `backend/` folder:

```yaml
services:
  - type: web
    name: skinsight-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
```

Make sure the bottom of your `app.py` looks like this:

```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

Make sure `gunicorn` is in your `requirements.txt` (it already is).

### 2. Handle Firebase credentials for Render

Since you cannot upload files to Render on the free tier, store your Firebase credentials as an environment variable instead.

Open your `serviceAccountKey.json`, copy the entire contents, and update your `app.py` to load it like this:

```python
import json, os
from firebase_admin import credentials, initialize_app

service_account_info = json.loads(os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON"))
cred = credentials.Certificate(service_account_info)
initialize_app(cred)
```

### 3. Push your code to GitHub

```bash
git add .
git commit -m "Prepare Flask backend for Render deployment"
git push
```

### 4. Create a Render account
- Go to [render.com](https://render.com)
- Sign up using your **GitHub account** (free, no credit card needed)

### 5. Create a new Web Service
- Click **New → Web Service**
- Connect your GitHub repository
- Fill in the settings:

| Setting | Value |
|---|---|
| Name | `skinsight-backend` |
| Root Directory | `backend` |
| Runtime | `Python 3` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app` |
| Instance Type | `Free` |

### 6. Add environment variables
In the **Environment Variables** section add:

| Key | Value |
|---|---|
| `GMAIL_EMAIL` | your Gmail address |
| `GMAIL_PASSWORD` | your Gmail app password |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | paste the entire contents of `serviceAccountKey.json` |

### 7. Deploy
- Click **Create Web Service**
- Render builds and deploys automatically — takes 2-3 minutes
- Your live backend URL will be:
  ```
  https://skinsight-backend.onrender.com
  ```

### 8. Update your frontend `.env`
```env
EXPO_PUBLIC_FLASK_URL=https://skinsight-backend.onrender.com
```

Then restart Expo:
```bash
npx expo start --clear
```

### 9. Redeploying after changes
Every time you push to GitHub, Render automatically redeploys your backend. You can also trigger a manual redeploy from the Render dashboard at any time.

> ⚠️ **Free tier note:** The app sleeps after 15 minutes of inactivity. The first request after sleeping takes ~30 seconds to respond. When you add TensorFlow and PyTorch models later, you will need to upgrade to a paid plan as they require more RAM than the free tier allows.

---

## Running the App

### 1. Start the Flask backend (local development)
```bash
cd backend
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
| Flask connection refused on device | Use your local IP address instead of `localhost` |
| Render first request is slow | Free tier sleeps after inactivity — this is expected |
| Render build fails | Check that `gunicorn` is in `requirements.txt` |
| `Tag mismatch` Gradle error | Clear Gradle cache: `rd /s /q "%USERPROFILE%\.gradle\caches"` |

---

## Security Reminders

- ✅ Add `.env` to `.gitignore`
- ✅ Never commit `serviceAccountKey.json` to GitHub
- ✅ Store Firebase credentials as an environment variable on Render
- ✅ Keep Facebook App Secret server-side only
- ✅ Rotate any API keys that were accidentally pushed to GitHub
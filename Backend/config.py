import os
import json
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv

load_dotenv()

# ── Gmail ─────────────────────────────────────────────────────────────────────
GMAIL_EMAIL    = os.getenv('GMAIL_EMAIL', '').strip()
GMAIL_PASSWORD = os.getenv('GMAIL_PASSWORD', '').replace(' ', '').strip()

# ── Firebase Admin SDK ────────────────────────────────────────────────────────
if not firebase_admin._apps:
    # On Render: credentials are stored as an environment variable
    # Locally:   credentials are loaded from serviceAccountKey.json
    service_account_env = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')

    if service_account_env:
        # Running on Render — load from env variable
        service_account_info = json.loads(service_account_env)
        cred = credentials.Certificate(service_account_info)
        print("✅ Firebase Admin SDK initialized (from environment variable)")
    else:
        # Running locally — load from file
        service_account_path = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')
        cred = credentials.Certificate(service_account_path)
        print("✅ Firebase Admin SDK initialized (from serviceAccountKey.json)")

    firebase_admin.initialize_app(cred)

print("🚀 Flask backend starting...")
print(f"📧 Gmail Email: {GMAIL_EMAIL}")
print(f"🔑 Gmail Password: {'✅ Found (16 chars)' if len(GMAIL_PASSWORD) == 16 else '⚠️ Check password - should be 16 chars'}")
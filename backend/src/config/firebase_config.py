import os
import firebase_admin
from firebase_admin import credentials, auth, db
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        # For development, we'll use a service account key
        # In production, this should be set via environment variables
        
        # Check if Firebase is already initialized
        if not firebase_admin._apps:
            # For demo purposes, we'll create a mock configuration
            # In production, you would use actual Firebase credentials
            
            # Option 1: Use service account key file (recommended for production)
            # cred = credentials.Certificate('path/to/serviceAccountKey.json')
            
            # Option 2: Use environment variables (for demo)
            # For now, we'll use the default credentials which will work in development
            try:
                cred = credentials.ApplicationDefault()
                firebase_admin.initialize_app(cred, {
                    'databaseURL': 'https://eduquest-demo-default-rtdb.firebaseio.com'
                })
                print("✅ Firebase initialized successfully")
            except Exception as e:
                print(f"⚠️  Firebase initialization failed: {e}")
                print("📝 Note: Firebase features will be limited in demo mode")
                # Initialize without credentials for demo
                firebase_admin.initialize_app()
        
        return True
    except Exception as e:
        print(f"❌ Firebase initialization error: {e}")
        return False

def verify_firebase_token(id_token):
    """Verify Firebase ID token"""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Token verification error: {e}")
        return None

def get_user_by_uid(uid):
    """Get user data from Firebase Auth"""
    try:
        user = auth.get_user(uid)
        return {
            'uid': user.uid,
            'email': user.email,
            'display_name': user.display_name,
            'photo_url': user.photo_url,
            'email_verified': user.email_verified
        }
    except Exception as e:
        print(f"Error getting user: {e}")
        return None


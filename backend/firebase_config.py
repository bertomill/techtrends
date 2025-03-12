import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def initialize_firebase():
    """
    Initialize Firebase Admin SDK with credentials.
    
    This function uses the Firebase configuration from environment variables.
    
    Returns:
        firestore.Client: Firestore database client or None if initialization fails
    """
    try:
        # Check if already initialized
        if not firebase_admin._apps:
            # Try to get credentials from environment variable
            cred_json = os.getenv('FIREBASE_CREDENTIALS_JSON')
            cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
            
            # Get Firebase configuration from environment variables
            project_id = os.getenv('FIREBASE_PROJECT_ID')
            
            if cred_json:
                # Use credentials from environment variable JSON
                cred = credentials.Certificate(json.loads(cred_json))
            elif cred_path:
                # Use credentials from file path
                cred = credentials.Certificate(cred_path)
            elif project_id:
                # Use project ID from environment variables
                firebase_config = {
                    "projectId": project_id
                }
                # Initialize with project ID only (requires default credentials or allows unauthenticated access)
                firebase_admin.initialize_app(options=firebase_config)
                print(f"Initialized Firebase with project ID: {project_id}")
            else:
                # For development only - use application default credentials
                # In production, always use proper credentials
                cred = None
                print("WARNING: Using application default credentials. This is not recommended for production.")
                firebase_admin.initialize_app(cred)
        
        # Get Firestore client
        db = firestore.client()
        print("Firebase Firestore connection successful!")
        return db
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        # For development, you might want to continue with a fallback
        return None 
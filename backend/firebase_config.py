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
            
            if cred_json:
                # Print first few characters to verify it's loading
                print(f"Found credentials JSON: {cred_json[:30]}...")
                
                try:
                    # Parse the JSON
                    cred_dict = json.loads(cred_json)
                    print("Successfully parsed JSON credentials")
                    
                    # Initialize with credentials
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                    print("Firebase initialized successfully with credentials!")
                except json.JSONDecodeError as je:
                    print(f"Error parsing JSON credentials: {je}")
                    return None
                except Exception as ce:
                    print(f"Error creating credentials: {ce}")
                    return None
            else:
                print("No Firebase credentials found in environment variables")
                # Try initializing with just project ID as fallback
                project_id = os.getenv('FIREBASE_PROJECT_ID')
                if project_id:
                    print(f"Attempting to initialize with project ID: {project_id}")
                    firebase_admin.initialize_app(options={"projectId": project_id})
                    print("Firebase initialized with project ID only!")
                else:
                    print("No project ID found either. Cannot initialize Firebase.")
                    return None
        else:
            print("Firebase already initialized")
        
        # Get Firestore client
        db = firestore.client()
        print("Firebase Firestore connection successful!")
        return db
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        # For development, you might want to continue with a fallback
        return None 
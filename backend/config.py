import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration settings
class Config:
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-for-development-only')
    DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't')
    
    # Data storage settings
    DATA_FOLDER = os.getenv('DATA_FOLDER', 'data')
    TRENDS_FILE = os.path.join(DATA_FOLDER, 'tech_trends.csv')
    
    # API Keys
    CLAUDE_API_KEY = os.getenv('CLAUDE_API_KEY', '')
    
    # Ensure data directory exists
    @classmethod
    def init_app(cls):
        os.makedirs(cls.DATA_FOLDER, exist_ok=True)

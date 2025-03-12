# Research Memo Generator - Backend

## Overview

The backend for the Research Memo Generator provides essential services for web content scraping, AI-powered memo generation, and data storage. It serves as the bridge between the frontend application and external services like Firebase and the Claude 3.7 API.

## Features

- **Web Scraping**: Extract content from web articles and YouTube videos
- **AI Integration**: Connect with Claude 3.7 Sonnet API for memo generation
- **Firebase Integration**: Store and retrieve memos in Firestore database
- **RESTful API**: Provide endpoints for the frontend to interact with

## Tech Stack

- **Framework**: Flask (Python)
- **Database**: Firebase Firestore
- **AI Integration**: Anthropic Claude 3.7 API
- **Web Scraping**: 
  - BeautifulSoup4 for web articles
  - youtube-transcript-api for YouTube videos
- **Authentication**: Firebase Authentication
- **Environment**: Python 3.9+

## Project Structure

```
backend/
├── app.py                  # Main Flask application
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (not in repo)
├── services/               # Service modules
│   ├── firebase_service.py # Firebase integration
│   ├── scraper_service.py  # Web scraping functionality
│   └── ai_service.py       # Claude API integration
├── models/                 # Data models
│   └── memo.py             # Memo data structure
├── routes/                 # API routes
│   ├── trends_routes.py    # Endpoints for trends/memos
│   └── scrape_routes.py    # Endpoints for scraping
└── utils/                  # Utility functions
    ├── error_handlers.py   # Error handling
    └── validators.py       # Input validation
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/trends` | GET | Retrieve all memos |
| `/api/trends/<id>` | GET | Retrieve a specific memo |
| `/api/trends` | POST | Create a new memo |
| `/api/trends/<id>` | DELETE | Delete a memo |
| `/api/scrape/webpage` | POST | Scrape content from a web article |
| `/api/scrape/youtube` | POST | Scrape content from a YouTube video |
| `/api/scrape-and-generate` | POST | Scrape content and generate a memo |

## Setup Instructions

### Prerequisites

- Python 3.9 or later
- Firebase account with Firestore database
- Anthropic API key (for Claude 3.7)

### Installation

1. Clone the repository (if you haven't already):
   ```bash
   git clone https://github.com/yourusername/research-memo-generator.git
   cd research-memo-generator/backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with your configuration:
   ```
   # Firebase Configuration
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-auth-domain
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-storage-bucket
   FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   FIREBASE_APP_ID=your-app-id
   FIREBASE_MEASUREMENT_ID=your-measurement-id
   FIREBASE_DATABASE_URL=your-database-url
   
   # Firebase Service Account
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/serviceAccountKey.json
   # OR
   FIREBASE_CREDENTIALS_JSON={"type": "service_account", ...}
   
   # Anthropic API
   ANTHROPIC_API_KEY=your-anthropic-api-key
   
   # Flask Configuration
   FLASK_ENV=development
   FLASK_DEBUG=1
   ```

5. Set up Firebase Service Account:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Generate a new private key and download the JSON file
   - Either:
     - Set the path to this file in your `.env` file as `GOOGLE_APPLICATION_CREDENTIALS`
     - OR copy the entire JSON content into your `.env` file as `FIREBASE_CREDENTIALS_JSON`

### Running the Application

Start the Flask server:
```bash
python app.py
```

The server will run on port 5001 by default (http://localhost:5001).

## Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Set up Firestore Database
3. Update Firestore security rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /tech_trends/{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
4. Generate a service account key as described in the installation section

## Troubleshooting

### Common Issues

- **Firebase Authentication**: Ensure your service account key is correctly set up
- **Port Conflict**: If port 5001 is already in use, modify the port in `app.py`
- **CORS Issues**: If experiencing CORS problems, check the CORS configuration in `app.py`
- **Dependency Issues**: Make sure all dependencies are installed with the correct versions

### Debugging

For more detailed logs, set `FLASK_DEBUG=1` in your `.env` file.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

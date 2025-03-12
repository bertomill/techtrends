# Research Memo Generator

A full-stack web application that helps users track emerging technology trends and generate structured research memos from web content using AI.

![Research Memo Generator](https://via.placeholder.com/800x400?text=Research+Memo+Generator)

## Project Overview

The Research Memo Generator is designed to streamline the process of researching emerging technology trends by:

1. **Scraping web content** from articles and YouTube videos
2. **Generating structured research memos** using Claude 3.7 Sonnet AI
3. **Organizing and storing** research findings by themes and topics
4. **Providing insights** into technology trends over time

This application is perfect for:
- Technology researchers
- Product managers
- Innovation teams
- Technology journalists
- Students and academics

## System Architecture

The application follows a modern full-stack architecture:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   Frontend  │     │   Backend   │     │  External APIs  │
│  (Next.js)  │────▶│   (Flask)   │────▶│  & Services     │
└─────────────┘     └─────────────┘     └─────────────────┘
       │                   │                     │
       │                   │                     │
       │                   ▼                     │
       │           ┌─────────────┐               │
       └──────────▶│  Firebase   │◀──────────────┘
                   │  Firestore  │
                   └─────────────┘
```

- **Frontend**: Next.js React application with Tailwind CSS and shadcn/ui components
- **Backend**: Flask Python application with RESTful API endpoints
- **Database**: Firebase Firestore for data storage
- **AI**: Claude 3.7 Sonnet API for memo generation
- **Web Scraping**: Custom services for extracting content from web articles and YouTube videos

## Key Features

- **Content Scraping**: Automatically extract relevant content from web articles and YouTube videos
- **AI-Powered Memo Generation**: Generate structured research memos with Claude 3.7 Sonnet
- **Trend Tracking**: Organize research by themes and track emerging technology trends
- **Modern UI**: Clean, responsive interface built with Next.js, Tailwind CSS, and shadcn/ui
- **Firebase Integration**: Secure and scalable data storage with Firebase Firestore

## Getting Started

### Prerequisites

- Node.js 18.x or later (for frontend)
- Python 3.9 or later (for backend)
- Firebase account
- Anthropic API key (for Claude 3.7)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/research-memo-generator.git
   cd research-memo-generator
   ```

2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configure environment variables:
   - Create `.env` file in the backend directory (see backend README)
   - Create `.env.local` file in the frontend directory (see frontend README)

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   python app.py
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
research-memo-generator/
├── frontend/                # Next.js frontend application
│   ├── app/                 # Next.js app directory
│   ├── public/              # Static assets
│   ├── README.md            # Frontend documentation
│   └── ...                  # Other frontend files
├── backend/                 # Flask backend application
│   ├── app.py               # Main Flask application
│   ├── services/            # Service modules
│   ├── README.md            # Backend documentation
│   └── ...                  # Other backend files
└── README.md                # Main project documentation
```

For detailed documentation on each component:
- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## Detailed Documentation

### Frontend

The frontend is built with Next.js and provides a modern, responsive user interface. It communicates with the backend API to fetch data and submit requests for memo generation.

See the [Frontend README](./frontend/README.md) for detailed setup instructions and documentation.

### Backend

The backend is built with Flask and provides RESTful API endpoints for the frontend. It handles web scraping, AI integration, and database operations.

See the [Backend README](./backend/README.md) for detailed setup instructions and documentation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Anthropic Claude](https://www.anthropic.com/claude) for AI capabilities
- [Firebase](https://firebase.google.com/) for database and authentication
- [Next.js](https://nextjs.org/) for the frontend framework
- [Flask](https://flask.palletsprojects.com/) for the backend framework
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling 
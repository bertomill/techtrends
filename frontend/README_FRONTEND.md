# Research Memo Generator - Frontend

## Overview

The Research Memo Generator is a web application that helps users track emerging technology trends and generate structured research memos from web content. The application allows users to:

1. **Generate Research Memos**: Input a URL (YouTube video or web article), research task, and theme to automatically generate a structured research memo.
2. **View Memos**: Browse, filter, and manage previously generated memos.
3. **Track Technology Trends**: Organize research by themes and track emerging technology trends.

## Features

- **Web Content Scraping**: Automatically extract content from web articles and YouTube videos
- **AI-Powered Memo Generation**: Uses Claude 3.7 Sonnet to analyze content and generate structured research memos
- **Modern UI**: Built with Next.js, Tailwind CSS, and shadcn/ui components
- **Responsive Design**: Works on desktop and mobile devices
- **Firebase Integration**: Store and retrieve memos using Firebase Firestore

## Tech Stack

- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS, shadcn/ui component library
- **State Management**: React Hooks (useState, useEffect)
- **API Communication**: Fetch API
- **Backend Integration**: Communicates with Flask backend for content scraping and memo generation
- **Database**: Firebase Firestore (via backend)

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── components/         # Reusable UI components
│   │   ├── data-display/   # Components for displaying data (MemoList, MemoCard)
│   │   ├── forms/          # Form components (ScrapeForm)
│   │   ├── layout/         # Layout components (MainLayout)
│   │   └── ui/             # UI components (Button, Card, Input, etc.)
│   ├── lib/                # Utility functions and helpers
│   ├── page.tsx            # Main application page
│   ├── memos/              # Memos page
│   ├── trends/             # Trends page
│   └── settings/           # Settings page
├── public/                 # Static assets
├── styles/                 # Global styles
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

## Setup Instructions

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Backend server running (see backend README)

### Installation

1. Clone the repository (if you haven't already):
   ```bash
   git clone https://github.com/yourusername/research-memo-generator.git
   cd research-memo-generator/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the frontend directory with your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

### Running the Application

1. Make sure the backend server is running on port 5001 (see backend README)

2. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
# or
yarn build
```

To start the production server:
```bash
npm run start
# or
yarn start
```

## Usage Guide

### Generating a Research Memo

1. On the home page, ensure you're on the "Generate Memo" tab
2. Enter a URL (YouTube video or web article)
3. Select the source type (Auto-detect, YouTube, or Web Article)
4. Enter your research task (what you want to learn from the content)
5. Specify a theme (e.g., AI, Blockchain, IoT)
6. Optionally add context about why this research is important
7. Click "Preview" to see the scraped content (optional)
8. Click "Generate Memo" to create your research memo
9. Wait for the memo to be generated (this may take a few moments)
10. Once generated, you'll be automatically switched to the "View Memos" tab to see your new memo

### Viewing Memos

1. Click on the "View Memos" tab on the home page
2. Browse through your generated memos
3. Use the delete button to remove unwanted memos

## Troubleshooting

### Common Issues

- **"Failed to fetch" error**: Ensure the backend server is running on port 5001
- **Styling issues**: Make sure Tailwind CSS is properly configured
- **Firebase errors**: Verify your Firebase configuration in the `.env.local` file

### Backend Connection

The frontend expects the backend to be running on `http://localhost:5001`. If your backend is running on a different port or host, you'll need to update the API endpoint URLs in:

- `frontend/app/page.tsx`
- `frontend/app/components/forms/scrape-form.tsx`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
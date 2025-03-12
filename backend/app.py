# This file contains the main code for our web application's backend server
# It handles requests from users and manages our data

# Import necessary tools and libraries that we'll need
import os  # For working with files and folders
import pandas as pd  # For organizing data in tables
import numpy as np  # For doing math calculations
from flask import Flask, request, jsonify, make_response  # For creating our web server
from flask_cors import CORS  # For allowing different websites to talk to our server
from config import Config  # Our custom settings
from firebase_config import initialize_firebase  # For connecting to our database
from scraper import ContentScraper, ClaudeAPI  # For getting information from websites
import time  # For working with time and dates
import re
from datetime import datetime
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup

# Create a new web application
# Think of this like opening a new store - we're setting up our shop!
app = Flask(__name__)
app.config.from_object(Config)  # Load our settings

# Configure CORS to allow requests from the frontend
# For production, we'll use environment variables to specify allowed origins
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000')
origins = allowed_origins.split(',')

# Configure CORS with additional options
cors = CORS(
    app,
    resources={
        r"/api/*": {
            "origins": origins,
            "allow_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        }
    }
)

# Add security headers to all responses
@app.after_request
def add_security_headers(response):
    # Add Content Security Policy header
    response.headers['Content-Security-Policy'] = (
        "default-src 'self';"
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://apis.google.com;"
        "style-src 'self' 'unsafe-inline';"
        "img-src 'self' data: https:;"
        "connect-src 'self' http://localhost:* https://firestore.googleapis.com https://*.firebaseio.com;"
        "frame-src 'self' https://*.firebaseapp.com https://*.firebase.com;"
        "font-src 'self' data:;"
    )
    # Add other security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

# Get everything ready to run
Config.init_app()  # Load our configuration settings

# Connect to our database (Firebase)
# This is like setting up our filing cabinet to store information
db = initialize_firebase()

# Set up our AI helper (Claude)
# This is like hiring an assistant to help analyze information
claude_api = ClaudeAPI()

# Give names to important things we'll use often
# Like labeling the drawers in our filing cabinet
TRENDS_COLLECTION = 'tech_trends'

# Define what information we want to store about each technology trend
# Like creating a form with specific fields to fill out
TREND_COLUMNS = [
    'research_task',  # What we want to learn about
    'news_links',     # Where we found the information
    'context',        # Why it's important
    'date_discovered',# When we found it
    'theme',          # What category it belongs to
    'analysis'        # Our detailed thoughts about it
]

def load_trends_data():
    """
    Get all our stored technology trends from our database.
    If we can't access the database, we'll use a backup file instead.
    It's like having both a digital and paper copy of our records.
    """
    if db:
        # Get data from our online database
        trends_ref = db.collection(TRENDS_COLLECTION)
        trends = trends_ref.stream()
        
        # Convert the data into a format we can work with
        trends_data = [trend.to_dict() for trend in trends]
        
        if trends_data:
            return pd.DataFrame(trends_data)
        else:
            return pd.DataFrame(columns=TREND_COLUMNS)
    else:
        # If database isn't available, use a backup file
        if os.path.exists(Config.TRENDS_FILE):
            return pd.read_csv(Config.TRENDS_FILE)
        else:
            return pd.DataFrame(columns=TREND_COLUMNS)

def save_trends_data(df):
    """
    Save our technology trends either to the database or backup file.
    Like making sure our records are properly filed away.
    """
    if db:
        # Save to online database
        trends_ref = db.collection(TRENDS_COLLECTION)
        delete_collection(trends_ref, 10)  # Clear old records
        
        # Add each new record
        for _, row in df.iterrows():
            trends_ref.add(row.to_dict())
    else:
        # Save to backup file if database isn't available
        df.to_csv(Config.TRENDS_FILE, index=False)

def delete_collection(coll_ref, batch_size):
    """
    Helper function to remove old records from our database.
    Like cleaning out old files to make room for new ones.
    """
    docs = coll_ref.limit(batch_size).stream()
    deleted = 0
    
    for doc in docs:
        doc.reference.delete()
        deleted += 1
        
    if deleted >= batch_size:
        return delete_collection(coll_ref, batch_size)

def generate_analysis(row):
    """
    Create a detailed report about a technology trend.
    Like writing a book report with specific sections.
    """
    # Get the important information
    research_task = row['research_task']
    theme = row['theme']
    context = row.get('context', '')
    
    # Create a structured report
    memo = f"""What happened:

Based on the research task: {research_task}

Why is this interesting:

{context}

Why we should be skeptical:

This technology/approach is still evolving and may face implementation challenges or competition from established solutions.

Enterprise Innovation POV:

This represents a potential opportunity for innovation within the enterprise context. Further investigation is needed to determine specific applications and ROI.

Next Steps:

1. Conduct deeper research into specific use cases
2. Identify potential partners or vendors in this space
3. Evaluate implementation requirements and costs
4. Consider a small proof-of-concept to test viability

Relevant Risks:

1. Technology immaturity or rapid evolution
2. Integration challenges with existing systems
3. Potential regulatory or compliance issues
4. Skill gaps within the organization
5. Uncertain ROI or business case"""

    return memo

# The rest of the file contains various functions that handle different types of requests
# from users, like getting information, adding new trends, updating existing ones,
# and analyzing web content. Each function is like a different service our store provides.

@app.route('/api/trends', methods=['GET'])
def get_trends():
    """Get a list of all technology trends we've stored."""
    df = load_trends_data()
    return jsonify(df.to_dict(orient='records'))

@app.route('/api/trends/filter', methods=['GET'])
def filter_trends():
    """Get a filtered and sorted list of technology trends."""
    # Get query parameters
    search_query = request.args.get('search', '').lower()
    theme_filter = request.args.get('theme', '')
    sort_by = request.args.get('sort_by', 'date_discovered')
    sort_order = request.args.get('sort_order', 'desc')
    
    # Load all trends
    df = load_trends_data()
    
    if df.empty:
        return jsonify([])
    
    # Apply filters
    if search_query:
        # Search in multiple columns
        df = df[
            df['research_task'].str.lower().str.contains(search_query, na=False) |
            df['context'].str.lower().str.contains(search_query, na=False) |
            df['theme'].str.lower().str.contains(search_query, na=False) |
            df['analysis'].str.lower().str.contains(search_query, na=False)
        ]
    
    if theme_filter:
        df = df[df['theme'].str.lower() == theme_filter.lower()]
    
    # Apply sorting
    if sort_by in df.columns:
        ascending = sort_order.lower() != 'desc'
        df = df.sort_values(by=sort_by, ascending=ascending)
    
    return jsonify(df.to_dict(orient='records'))

@app.route('/api/trends', methods=['POST'])
def add_trend():
    """Add a new technology trend to our records."""
    data = request.json
    
    # Make sure we have all required information
    for field in TREND_COLUMNS[:-1]:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Prepare the new record
    new_row = {field: data.get(field, '') for field in TREND_COLUMNS[:-1]}
    
    # Generate analysis report
    new_row['analysis'] = generate_analysis(new_row)
    
    # Save the new trend
    df = load_trends_data()
    
    if db:
        # Save to database
        doc_ref = db.collection(TRENDS_COLLECTION).add(new_row)
        # Check if doc_ref is a tuple and extract the first element if it is
        if isinstance(doc_ref, tuple) and len(doc_ref) > 0:
            new_row['id'] = doc_ref[0].id
        else:
            # Try to get the ID directly if it's not a tuple
            try:
                new_row['id'] = doc_ref.id
            except AttributeError:
                # If we can't get an ID, generate a random one
                new_row['id'] = f"trend-{int(time.time())}"
    else:
        # Save to backup file
        df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        save_trends_data(df)
    return jsonify(new_row), 201

@app.route('/api/trends/<string:trend_id>', methods=['PUT'])
def update_trend(trend_id):
    """Update an existing technology trend."""
    data = request.json
    
    if db:
        # Update in database
        doc_ref = db.collection(TRENDS_COLLECTION).document(trend_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({'error': 'Trend not found'}), 404
        
        # Get current data
        current_data = doc.to_dict()
        
        # Update fields
        for field in TREND_COLUMNS[:-1]:
            if field in data:
                current_data[field] = data[field]
        
        # Update analysis
        current_data['analysis'] = generate_analysis(current_data)
        
        # Save changes
        doc_ref.update(current_data)
        return jsonify(current_data), 200
    else:
        # Update in backup file
        df = load_trends_data()
        try:
            trend_idx = int(trend_id)
            
            if trend_idx < 0 or trend_idx >= len(df):
                return jsonify({'error': 'Trend not found'}), 404
            
            # Update fields
            for field in TREND_COLUMNS[:-1]:
                if field in data:
                    df.at[trend_idx, field] = data[field]
            
            # Update analysis
            row_data = df.iloc[trend_idx].to_dict()
            df.at[trend_idx, 'analysis'] = generate_analysis(row_data)
            
            save_trends_data(df)
            return jsonify(df.iloc[trend_idx].to_dict()), 200
        except ValueError:
            return jsonify({'error': 'Invalid ID format'}), 400

@app.route('/api/trends/<string:trend_id>', methods=['DELETE'])
def delete_trend(trend_id):
    """Remove a technology trend from our records."""
    if db:
        # Delete from database
        doc_ref = db.collection(TRENDS_COLLECTION).document(trend_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({'error': 'Trend not found'}), 404
        
        doc_ref.delete()
        return jsonify({'message': 'Trend deleted successfully'}), 200
    else:
        # Delete from backup file
        df = load_trends_data()
        try:
            trend_idx = int(trend_id)
            
            if trend_idx < 0 or trend_idx >= len(df):
                return jsonify({'error': 'Trend not found'}), 404
            
            df = df.drop(trend_idx).reset_index(drop=True)
            save_trends_data(df)
            
            return jsonify({'message': 'Trend deleted successfully'}), 200
        except ValueError:
            return jsonify({'error': 'Invalid ID format'}), 400

# Functions for getting information from websites and analyzing it

@app.route('/api/scrape/youtube', methods=['POST'])
def scrape_youtube():
    """Get the text from a YouTube video."""
    data = request.json
    
    if not data or 'url' not in data:
        return jsonify({'error': 'Missing URL parameter'}), 400
    
    url = data['url']
    transcript = ContentScraper.get_youtube_transcript(url)
    
    if transcript.startswith('Error'):
        return jsonify({'error': transcript}), 400
    
    return jsonify({'content': transcript}), 200

@app.route('/api/scrape/webpage', methods=['POST'])
def scrape_webpage():
    """Get the text from a webpage."""
    data = request.json
    
    if not data or 'url' not in data:
        return jsonify({'error': 'Missing URL parameter'}), 400
    
    url = data['url']
    content = ContentScraper.get_webpage_content(url)
    
    if content.startswith('Error'):
        return jsonify({'error': content}), 400
    
    return jsonify({'content': content}), 200

@app.route('/api/generate-memo', methods=['POST'])
def generate_memo_with_claude():
    """Use our AI assistant to analyze information and create a report."""
    data = request.json
    
    if not data:
        return jsonify({'error': 'Missing request data'}), 400
    
    if 'content' not in data or 'research_task' not in data:
        return jsonify({'error': 'Missing required fields: content and research_task'}), 400
    
    content = data['content']
    research_task = data['research_task']
    context = data.get('context', '')
    theme = data.get('theme', '')
    
    try:
        memo = claude_api.generate_memo(content, research_task, context, theme)
        
        if memo.startswith('Error'):
            return jsonify({'error': memo}), 400
        
        return jsonify({'analysis': memo}), 200
    except Exception as e:
        return jsonify({'error': f'Error generating memo: {str(e)}'}), 500

@app.route('/api/scrape-and-generate', methods=['POST'])
def scrape_and_generate():
    """Get information from websites and analyze it in one step."""
    data = request.json
    
    if not data:
        return jsonify({'error': 'Missing request data'}), 400
    
    if 'urls' not in data or 'research_task' not in data:
        return jsonify({'error': 'Missing required fields: urls and research_task'}), 400
    
    urls = data['urls']
    research_task = data['research_task']
    context = data.get('context', '')
    theme = data.get('theme', '')
    source_type = data.get('source_type', 'auto').lower()
    persona = data.get('persona', None)
    
    try:
        # Collect content from all URLs
        all_content = []
        
        for url in urls:
            # Figure out if it's a YouTube video or regular webpage
            current_source_type = source_type
            if current_source_type == 'auto':
                if 'youtube.com' in url or 'youtu.be' in url:
                    current_source_type = 'youtube'
                else:
                    current_source_type = 'webpage'
            
            # Get the content
            if current_source_type == 'youtube':
                content = ContentScraper.get_youtube_transcript(url)
            else:
                content = ContentScraper.get_webpage_content(url)
            
            if content.startswith('Error'):
                return jsonify({'error': f'Error scraping {url}: {content}'}), 400
            
            all_content.append(f"Source: {url}\n\n{content}\n\n")
        
        # Combine all content
        combined_content = "\n---\n".join(all_content)
        
        # Enhance context with persona information if available
        enhanced_context = context
        if persona:
            persona_info = f"This memo is prepared for {persona.get('name')}, {persona.get('position')}.\n"
            if persona.get('interests'):
                persona_info += f"Their interests include: {persona.get('interests')}\n"
            if persona.get('background'):
                persona_info += f"Background: {persona.get('background')}\n"
            
            # If there's existing context, append to it, otherwise use persona info as context
            if context:
                enhanced_context = f"{persona_info}\n{context}"
            else:
                enhanced_context = persona_info
        
        # Analyze the content
        memo = claude_api.generate_memo(combined_content, research_task, enhanced_context, theme)
        
        if memo.startswith('Error'):
            return jsonify({'error': memo}), 400
        
        # Save everything as a new trend
        new_trend = {
            'research_task': research_task,
            'news_links': urls,  # Store all URLs
            'context': enhanced_context,
            'date_discovered': pd.Timestamp.now().strftime('%Y-%m-%d'),
            'theme': theme,
            'analysis': memo
        }
        
        # Add persona information if available
        if persona:
            new_trend['persona'] = {
                'id': persona.get('id', f"persona-{int(time.time())}"),  # Provide a fallback ID if not present
                'name': persona.get('name', ''),
                'position': persona.get('position', '')
            }
        
        # Store the new trend
        if db:
            doc_ref = db.collection(TRENDS_COLLECTION).add(new_trend)
            # Check if doc_ref is a tuple and extract the first element if it is
            if isinstance(doc_ref, tuple) and len(doc_ref) > 0:
                new_trend['id'] = doc_ref[0].id
            else:
                # Try to get the ID directly if it's not a tuple
                try:
                    new_trend['id'] = doc_ref.id
                except AttributeError:
                    # If we can't get an ID, generate a random one
                    new_trend['id'] = f"trend-{int(time.time())}"
        else:
            df = load_trends_data()
            df = pd.concat([df, pd.DataFrame([new_trend])], ignore_index=True)
            save_trends_data(df)
        
        return jsonify(new_trend), 201
    except Exception as e:
        return jsonify({'error': f'Error processing request: {str(e)}'}), 500

@app.route('/api/check-claude-key', methods=['GET'])
def check_claude_key():
    """Check if our AI assistant is properly set up."""
    if not Config.CLAUDE_API_KEY:
        return jsonify({'status': 'error', 'message': 'Claude API key is not configured'}), 400
    
    return jsonify({'status': 'success', 'message': 'Claude API key is configured'}), 200

@app.route('/api/extract-date', methods=['POST'])
def extract_date_from_url():
    """
    Extract the publication date from a URL or its content.
    
    This function tries multiple methods to find a date:
    1. Look for date patterns in the URL itself
    2. Check for meta tags in the HTML that might contain dates
    3. Look for common date patterns in the page content
    
    Returns:
        JSON with extracted date or error message
    """
    data = request.get_json()
    
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required'}), 400
    
    url = data['url']
    
    try:
        # First, try to extract date from URL structure
        date_from_url = extract_date_from_url_pattern(url)
        if date_from_url:
            return jsonify({'date': date_from_url.strftime('%Y-%m-%d')})
        
        # If that fails, try to extract from content
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Try to extract date from meta tags
        date_from_meta = extract_date_from_meta_tags(soup)
        if date_from_meta:
            return jsonify({'date': date_from_meta.strftime('%Y-%m-%d')})
        
        # Try to extract date from content
        date_from_content = extract_date_from_content(soup)
        if date_from_content:
            return jsonify({'date': date_from_content.strftime('%Y-%m-%d')})
        
        # If all methods fail, return today's date
        return jsonify({'date': datetime.now().strftime('%Y-%m-%d'), 'note': 'Could not extract date, using current date'})
        
    except Exception as e:
        print(f"Error extracting date: {str(e)}")
        return jsonify({'error': str(e)}), 500

def extract_date_from_url_pattern(url):
    """Extract date from common URL patterns"""
    # Parse the URL
    parsed_url = urlparse(url)
    path = parsed_url.path
    query = parsed_url.query
    
    # Common date patterns in URLs
    patterns = [
        # Match YYYY/MM/DD in path
        r'/(\d{4})/(\d{1,2})/(\d{1,2})/',
        # Match YYYY-MM-DD in path
        r'/(\d{4})-(\d{1,2})-(\d{1,2})/',
        # Match date=YYYY-MM-DD in query
        r'[?&]date=(\d{4})-(\d{1,2})-(\d{1,2})',
        # Match published=YYYY-MM-DD in query
        r'[?&]published=(\d{4})-(\d{1,2})-(\d{1,2})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, path + '?' + query)
        if match:
            year = int(match.group(1))
            month = int(match.group(2))
            day = int(match.group(3))
            
            # Validate date components
            current_year = datetime.now().year
            if 1990 <= year <= current_year and 1 <= month <= 12 and 1 <= day <= 31:
                try:
                    return datetime(year, month, day)
                except ValueError:
                    # Invalid date like February 30
                    continue
    
    return None

def extract_date_from_meta_tags(soup):
    """Extract date from HTML meta tags"""
    # Common meta tags that might contain publication dates
    meta_tags = [
        'article:published_time',
        'article:modified_time',
        'og:published_time',
        'og:modified_time',
        'publication_date',
        'date',
        'pubdate'
    ]
    
    for tag_name in meta_tags:
        # Look for the meta tag
        meta_tag = soup.find('meta', property=tag_name) or soup.find('meta', attrs={'name': tag_name})
        
        if meta_tag and meta_tag.get('content'):
            date_str = meta_tag.get('content')
            try:
                # Try to parse ISO format date (YYYY-MM-DDTHH:MM:SS)
                date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                return date_obj
            except ValueError:
                try:
                    # Try other common formats
                    for fmt in ['%Y-%m-%d', '%Y/%m/%d', '%d-%m-%Y', '%d/%m/%Y']:
                        try:
                            return datetime.strptime(date_str, fmt)
                        except ValueError:
                            continue
                except:
                    continue
    
    return None

def extract_date_from_content(soup):
    """Extract date from page content using common patterns"""
    # Remove script and style elements
    for script in soup(["script", "style"]):
        script.extract()
    
    # Get text
    text = soup.get_text()
    
    # Common date formats in text
    date_patterns = [
        r'Published:?\s*(\w+\s+\d{1,2},\s+\d{4})',
        r'Posted:?\s*(\w+\s+\d{1,2},\s+\d{4})',
        r'Date:?\s*(\w+\s+\d{1,2},\s+\d{4})',
        r'(\d{1,2}\s+\w+\s+\d{4})',
        r'(\w+\s+\d{1,2}\s+\d{4})',
        r'(\d{4}-\d{2}-\d{2})'
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, text)
        if match:
            date_str = match.group(1)
            try:
                # Try different date formats
                for fmt in ['%B %d, %Y', '%d %B %Y', '%B %d %Y', '%Y-%m-%d']:
                    try:
                        return datetime.strptime(date_str, fmt)
                    except ValueError:
                        continue
            except:
                continue
    
    return None

# This block is used when running the app directly (not through gunicorn)
if __name__ == '__main__':
    # Get the port from environment variable or use 5001 as default
    port = int(os.environ.get('PORT', 5001))
    # Run the app with the specified host and port
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)

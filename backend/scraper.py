"""
Web Scraping and Claude API Integration Module

This module provides functionality to:
1. Extract content from web pages using BeautifulSoup
2. Extract transcripts from YouTube videos using youtube_transcript_api
3. Generate research memos using the Claude 3.7 API
"""

import re
import requests
import httpx
from bs4 import BeautifulSoup
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
from anthropic import Anthropic
from config import Config

class ContentScraper:
    """Class for scraping content from various sources."""
    
    @staticmethod
    def extract_youtube_id(url):
        """
        Extract the YouTube video ID from a URL.
        
        Args:
            url (str): The YouTube URL
            
        Returns:
            str: The YouTube video ID or None if not found
        """
        # Regular expressions for different YouTube URL formats
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?]+)',
            r'(?:youtube\.com\/embed\/)([^&\n?]+)',
            r'(?:youtube\.com\/v\/)([^&\n?]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None
    
    @staticmethod
    def get_youtube_transcript(url):
        """
        Get the transcript of a YouTube video.
        
        Args:
            url (str): The YouTube video URL
            
        Returns:
            str: The transcript text or error message
        """
        video_id = ContentScraper.extract_youtube_id(url)
        if not video_id:
            return "Error: Could not extract YouTube video ID from the URL."
        
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            formatter = TextFormatter()
            formatted_transcript = formatter.format_transcript(transcript)
            
            # Add video title if possible
            try:
                response = requests.get(f"https://www.youtube.com/watch?v={video_id}")
                soup = BeautifulSoup(response.text, 'html.parser')
                title = soup.find('title').text.replace(' - YouTube', '')
                return f"Title: {title}\n\nTranscript:\n{formatted_transcript}"
            except:
                return formatted_transcript
                
        except Exception as e:
            return f"Error retrieving transcript: {str(e)}"
    
    @staticmethod
    def get_webpage_content(url):
        """
        Extract the main content from a webpage.
        
        Args:
            url (str): The webpage URL
            
        Returns:
            str: The extracted content or error message
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.extract()
            
            # Get the title
            title = soup.find('title').text if soup.find('title') else "No title found"
            
            # Try to find the main content
            main_content = None
            
            # Look for article tag
            if soup.find('article'):
                main_content = soup.find('article')
            # Look for main tag
            elif soup.find('main'):
                main_content = soup.find('main')
            # Look for div with content in id or class
            elif soup.find('div', {'id': re.compile('content|article|main', re.I)}):
                main_content = soup.find('div', {'id': re.compile('content|article|main', re.I)})
            elif soup.find('div', {'class': re.compile('content|article|main', re.I)}):
                main_content = soup.find('div', {'class': re.compile('content|article|main', re.I)})
            
            if main_content:
                text = main_content.get_text(separator='\n', strip=True)
            else:
                # Fallback to body text
                text = soup.body.get_text(separator='\n', strip=True)
            
            # Clean up the text
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)
            
            return f"Title: {title}\n\nContent:\n{text}"
            
        except Exception as e:
            return f"Error extracting webpage content: {str(e)}"


class ClaudeAPI:
    """Class for interacting with the Claude API."""
    
    def __init__(self, api_key=None):
        """
        Initialize the Claude API client.
        
        Args:
            api_key (str, optional): The Claude API key. Defaults to the one in Config.
        """
        self.api_key = api_key or Config.CLAUDE_API_KEY
        if not self.api_key:
            raise ValueError("Claude API key is not configured")
        
        # Create a custom HTTP client without proxies
        try:
            # Create a basic httpx client without any extra parameters
            http_client = httpx.Client(timeout=60.0)
            
            # Initialize Anthropic with the custom client
            self.client = Anthropic(
                api_key=self.api_key,
                http_client=http_client
            )
            print("Anthropic client initialized successfully")
        except Exception as e:
            print(f"Error initializing Anthropic client: {e}")
            # Fallback to basic initialization
            self.client = Anthropic(api_key=self.api_key)
    
    def generate_memo(self, content, research_task, context="", theme=""):
        """
        Generate a research memo using Claude 3.7.
        
        Args:
            content (str): The content to analyze
            research_task (str): The research task description
            context (str, optional): Additional context
            theme (str, optional): The theme or category
            
        Returns:
            str: The generated memo
        """
        if not self.api_key:
            return "Error: Claude API key is not configured."
        
        try:
            system_prompt = """Your task is to compose a comprehensive company memo based on the provided key points. The memo should be written in a professional tone, addressing all the relevant information in a clear and concise manner. 

Format the memo with proper Markdown formatting:
- Use # for main headings
- Use ## for subheadings
- Use bullet points (- ) for lists
- Use numbered lists (1. ) where appropriate
- Use **bold** for emphasis
- Organize content with clear section breaks

The memo should include the following sections:
1. **What happened** - Summarize the key facts and developments
2. **Why is this interesting** - Explain the significance and relevance
3. **Why we should be skeptical** - Identify potential issues, limitations, or reasons for caution
4. **Enterprise Innovation POV** - Analyze implications for enterprise innovation
5. **Next Steps** - Recommend 3-5 concrete actions
6. **Relevant Risks** - List 4-6 key risks to consider

Make the memo visually structured and easy to scan. Do NOT include a disclaimer at the end about the memo being based on publicly available information."""

            # Check if context contains persona information
            persona_context = ""
            if "This memo is prepared for" in context:
                persona_context = "Pay special attention to the persona information in the context section. Tailor your memo to address their specific interests, position, and background."

            user_prompt = f"""
I need you to create a structured research memo based on the following information:

RESEARCH TASK: {research_task}

THEME: {theme}

CONTEXT: {context}

CONTENT TO ANALYZE:
{content[:50000]}  # Limit content to avoid token limits

{persona_context}

Please be concise, factual, and analytical in your memo. Use proper Markdown formatting to make the memo visually structured and easy to read.

DO NOT include a disclaimer at the end about the memo being based on publicly available information.
"""

            try:
                # For Anthropic 0.5.0, use the completion API
                response = self.client.completions.create(
                    model="claude-3-7-sonnet-20250219",
                    prompt=f"{system_prompt}\n\n{user_prompt}",
                    max_tokens_to_sample=4000,
                )
                
                return response.completion
            except Exception as e:
                print(f"Error with completions API: {e}")
                # Try a simpler approach as fallback
                response = self.client.completion(
                    prompt=f"{system_prompt}\n\n{user_prompt}",
                    model="claude-3-7-sonnet-20250219",
                    max_tokens_to_sample=4000,
                )
                return response.completion
            
        except Exception as e:
            return f"Error generating memo with Claude API: {str(e)}"
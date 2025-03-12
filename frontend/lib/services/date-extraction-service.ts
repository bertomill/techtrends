/**
 * Service for extracting dates from URLs or web content
 */

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Function to extract date from a URL using the backend API
export const extractDateFromUrl = async (url: string): Promise<Date | null> => {
  try {
    // First try to extract date from URL structure using simple patterns
    // This is a fallback in case the API call fails
    const urlObj = new URL(url);
    
    // Common date patterns in URLs: YYYY/MM/DD, YYYY-MM-DD, etc.
    const datePatterns = [
      // Match YYYY/MM/DD in path
      /\/(\d{4})\/(\d{1,2})\/(\d{1,2})\//,
      // Match YYYY-MM-DD in path
      /\/(\d{4})-(\d{1,2})-(\d{1,2})\//,
      // Match date=YYYY-MM-DD in query
      /[?&]date=(\d{4})-(\d{1,2})-(\d{1,2})/,
      // Match published=YYYY-MM-DD in query
      /[?&]published=(\d{4})-(\d{1,2})-(\d{1,2})/
    ];
    
    for (const pattern of datePatterns) {
      const match = (urlObj.pathname + urlObj.search).match(pattern);
      if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // JavaScript months are 0-indexed
        const day = parseInt(match[3]);
        
        // Validate date components
        if (year >= 1990 && year <= new Date().getFullYear() && 
            month >= 0 && month <= 11 && 
            day >= 1 && day <= 31) {
          return new Date(year, month, day);
        }
      }
    }
    
    // If we couldn't extract a date from the URL pattern, call the backend API
    try {
      const response = await fetch(`${API_URL}/api/extract-date`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.date) {
        return new Date(data.date);
      }
      
      return null;
    } catch (apiError) {
      console.error('API error extracting date:', apiError);
      // If the API call fails, return null and let the client handle the fallback
      return null;
    }
  } catch (error) {
    console.error('Error extracting date:', error);
    return null;
  }
};

// Function to fetch and extract date from web content
export const extractDateFromContent = async (url: string): Promise<Date | null> => {
  try {
    // Call the backend API to extract the date
    const response = await fetch(`${API_URL}/api/extract-date`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.date) {
      return new Date(data.date);
    }
    
    // If the API couldn't extract a date, return today's date
    return new Date();
  } catch (error) {
    console.error('Error extracting date from content:', error);
    // If the API call fails, return today's date as a fallback
    return new Date();
  }
}; 
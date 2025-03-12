// Import necessary React components and UI components from other files
import React, { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "sonner";
import { X } from "lucide-react";
import { Memo } from '@/lib/services/memo-service';
import PersonaSelector from './persona-selector';
import { Persona } from '@/lib/services/persona-service';

// Define the props that this form component accepts
interface ScrapeFormProps {
  onSubmit: (data: Memo) => Promise<void>;
}

// Main form component that handles scraping web content and generating memos
export default function ScrapeForm({ onSubmit }: ScrapeFormProps) {
  // Set up state variables to store form data and track component status
  const [formData, setFormData] = useState({
    urls: [''],  // Changed from url to urls array
    research_task: '',
    context: '',
    theme: '',
    source_type: 'auto',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapedContent, setScrapedContent] = useState<string | null>(null);
  const [isScrapingOnly, setIsScrapingOnly] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  // Handle changes when user types in text inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle URL input changes
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.urls];
    newUrls[index] = value;
    setFormData(prev => ({
      ...prev,
      urls: newUrls
    }));
  };

  // Add a new URL input field
  const addUrlField = () => {
    setFormData(prev => ({
      ...prev,
      urls: [...prev.urls, '']
    }));
  };

  // Remove a URL input field
  const removeUrlField = (index: number) => {
    if (formData.urls.length <= 1) return; // Keep at least one URL field
    const newUrls = [...formData.urls];
    newUrls.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      urls: newUrls
    }));
  };

  // Handle changes when user selects from dropdown menu
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle persona selection
  const handlePersonaSelect = (persona: Persona | null) => {
    setSelectedPersona(persona);
    
    if (persona) {
      // Update context with persona information
      const personaContext = `This memo is prepared for ${persona.name}, ${persona.position}. 
Their interests include: ${persona.interests}
Background: ${persona.background}`;

      setFormData(prev => ({
        ...prev,
        context: personaContext
      }));
    } else {
      // Clear context if no persona is selected
      setFormData(prev => ({
        ...prev,
        context: ''
      }));
    }
  };

  // Function to preview scraped content without generating a full memo
  const handleScrapeOnly = async () => {
    if (formData.urls.length === 0 || !formData.urls[0]) {
      setError('At least one URL is required');
      toast.error('At least one URL is required');
      return;
    }

    setIsScrapingOnly(true);
    setError(null);
    setScrapedContent(null);

    try {
      // Choose the right API endpoint based on content type (YouTube or webpage)
      let endpoint = '/api/scrape/webpage';
      if (formData.source_type === 'youtube' || 
          (formData.source_type === 'auto' && 
           (formData.urls[0].includes('youtube.com') || formData.urls[0].includes('youtu.be')))) {
        endpoint = '/api/scrape/youtube';
      }

      setGenerationStatus('Scraping content...');
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}${endpoint}`;
      console.log('Sending request to:', apiUrl);
      
      // Send request to backend to scrape the content
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ url: formData.urls[0] }),
      }).catch(error => {
        console.error('Fetch error:', error);
        throw new Error(`Network error: ${error.message}`);
      });

      if (!response) {
        throw new Error('No response from server');
      }

      console.log('Response status:', response.status);
      const data = await response.json().catch(error => {
        console.error('JSON parse error:', error);
        throw new Error('Failed to parse response from server');
      });

      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data.error || 'Failed to scrape content');
      }

      setScrapedContent(data.content);
      toast.success('Content scraped successfully!');
      setGenerationStatus(null);
    } catch (err) {
      console.error('Error in handleScrapeOnly:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while scraping content';
      setError(errorMessage);
      toast.error(errorMessage);
      setGenerationStatus(null);
    } finally {
      setIsScrapingOnly(false);
    }
  };

  // Main function that handles form submission to generate a memo
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Check if required fields are filled
      if (formData.urls.length === 0 || !formData.urls[0] || !formData.research_task || !formData.theme) {
        throw new Error('At least one URL, research task, and theme are required');
      }

      setGenerationStatus('Step 1/2: Scraping content...');
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/scrape-and-generate`;
      console.log('Sending request to:', apiUrl);
      
      // Prepare request data
      const requestData = {
        urls: formData.urls,
        research_task: formData.research_task,
        context: formData.context,
        theme: formData.theme,
        source_type: formData.source_type,
      };
      
      // Add persona information if selected
      if (selectedPersona) {
        Object.assign(requestData, {
          persona: {
            id: selectedPersona.id || `persona-${Date.now()}`, // Provide a fallback ID if undefined
            name: selectedPersona.name,
            position: selectedPersona.position,
            interests: selectedPersona.interests,
            background: selectedPersona.background
          }
        });
      }
      
      // Send request to backend to scrape content and generate memo
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
      }).catch(error => {
        console.error('Fetch error:', error);
        throw new Error(`Network error: ${error.message}`);
      });

      if (!response) {
        throw new Error('No response from server');
      }

      // Update status to show we're now generating the memo with Claude
      setGenerationStatus('Step 2/2: Generating memo with Claude 3.7...');
      
      // Add a small delay to ensure the status update is visible to the user
      // This makes sure the UI has time to update before we continue processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Response status:', response.status);
      const data = await response.json().catch(error => {
        console.error('JSON parse error:', error);
        throw new Error('Failed to parse response from server');
      });

      if (!response.ok) {
        console.error('API error:', data);
        // Check if the error is related to Claude API
        if (data.error && data.error.includes('Claude API')) {
          throw new Error(`Claude API error: ${data.error}. Please check your API key configuration.`);
        } else {
          throw new Error(data.error || 'Failed to generate memo');
        }
      }

      // Add a small delay before showing success message
      // This ensures users can see the "Generating memo" status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGenerationStatus('Success! Memo generated.');
      toast.success('Memo generated successfully!');
      
      // Send generated memo back to parent component
      await onSubmit(data);

      // Clear form after successful submission
      setFormData({
        urls: [''],
        research_task: '',
        context: '',
        theme: '',
        source_type: 'auto',
      });
      setScrapedContent(null);
      setGenerationStatus(null);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      setGenerationStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // The form's user interface
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Research Memo from Web Content</CardTitle>
        <CardDescription>
          Enter URLs and research parameters to generate a structured memo
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">URLs: YouTube videos or web article URLs *</h3>
            {formData.urls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUrlField(index)}
                  disabled={formData.urls.length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addUrlField}
              className="mt-2"
            >
              Add Another URL
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Source Type</h3>
            <Select
              value={formData.source_type}
              onValueChange={(value) => handleSelectChange('source_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Auto-detect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
                <SelectItem value="webpage">Webpage</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Auto-detect will try to determine the source type based on the URL
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Research Task *</h3>
            <Input
              placeholder="What specific question or topic are you researching?"
              name="research_task"
              value={formData.research_task}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Theme *</h3>
            <Input
              placeholder="e.g., AI, Blockchain, IoT, etc."
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              required
            />
          </div>

          <PersonaSelector onPersonaSelect={handlePersonaSelect} />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Context</h3>
            <Textarea
              placeholder="Why is this research important? Add any additional context here."
              name="context"
              value={formData.context}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
              {error}
            </div>
          )}

          {scrapedContent && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Scraped Content Preview</h3>
              <div className="p-3 bg-muted rounded-md max-h-60 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap">{scrapedContent}</pre>
              </div>
            </div>
          )}

          {generationStatus && (
            <div className="p-3 bg-primary/10 border border-primary rounded-md text-primary text-sm">
              {generationStatus}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleScrapeOnly}
            disabled={isSubmitting || isScrapingOnly}
          >
            Preview Content
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Generating...' : 'Generate Memo'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 
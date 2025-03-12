'use client';

import { useState } from 'react';
import { MainLayout } from '../components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { saveMemo, Memo } from '@/lib/services/memo-service';
import { extractDateFromUrl, extractDateFromContent } from '@/lib/services/date-extraction-service';
import { useRouter } from 'next/navigation';
import { Calendar, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { SavedLinksList } from '../components/data-display/saved-links-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function QuickSavePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [theme, setTheme] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [extractingDate, setExtractingDate] = useState(false);
  const [extractionMethod, setExtractionMethod] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('save');

  // Function to extract date from the URL content
  const handleExtractDate = async () => {
    if (!url) {
      toast.error('Please enter a URL first');
      return;
    }

    setExtractingDate(true);
    setExtractionMethod(null);
    
    try {
      // First try to extract date from URL structure
      let extractedDate = await extractDateFromUrl(url);
      
      if (extractedDate) {
        setDate(extractedDate);
        setExtractionMethod('url');
        toast.success('Date extracted from URL structure');
        setExtractingDate(false);
        return;
      }
      
      // If that fails, try to extract from content
      extractedDate = await extractDateFromContent(url);
      
      if (extractedDate) {
        setDate(extractedDate);
        setExtractionMethod('content');
        toast.success('Date extracted from content');
      } else {
        // If both methods fail, keep the current date
        toast.info('Could not extract date from URL. Using current date instead.');
      }
    } catch (error) {
      console.error('Error extracting date:', error);
      toast.error('Failed to extract date. Please set it manually.');
    } finally {
      setExtractingDate(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast.error('URL is required');
      return;
    }

    setLoading(true);
    try {
      // Create a new memo object
      const newMemo: Memo = {
        research_task: 'Quick saved link',
        news_links: [url],
        context: notes || 'Quickly saved for later reference',
        date_discovered: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        theme: theme || 'Uncategorized',
        analysis: 'This link was quickly saved for later reference.'
      };
      
      // Save to Firestore
      await saveMemo(newMemo);
      
      toast.success('Link saved successfully!');
      
      // Clear the form
      setUrl('');
      setNotes('');
      setTheme('');
      setDate(new Date());
      setExtractionMethod(null);
      
      // Switch to the saved links tab
      setActiveTab('saved');
    } catch (error) {
      console.error('Error saving link:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save link';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle selecting a link from the saved links list
  const handleLinkSelect = (selectedUrl: string) => {
    setUrl(selectedUrl);
    setActiveTab('save');
    toast.info('URL loaded from saved links');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quick Save Link</h2>
          <p className="text-muted-foreground">
            Quickly save a link with optional notes and date information.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="save">Save New Link</TabsTrigger>
            <TabsTrigger value="saved">Your Saved Links</TabsTrigger>
          </TabsList>
          
          <TabsContent value="save" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Save a Link</CardTitle>
                <CardDescription>
                  Enter a URL and add optional notes. We&apos;ll try to extract the date automatically, or you can set it manually.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">URL (required)</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com/article"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme/Category (optional)</Label>
                    <Input
                      id="theme"
                      placeholder="e.g., AI, Blockchain, IoT, etc."
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="date">Date</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleExtractDate}
                        disabled={extractingDate || !url}
                        className="flex items-center gap-1"
                      >
                        {extractingDate ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Extracting...</span>
                          </>
                        ) : (
                          <span>Extract from URL</span>
                        )}
                      </Button>
                    </div>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {date ? format(date, 'PPP') : 'Select a date'}
                          {extractionMethod && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {extractionMethod === 'url' ? '(from URL)' : '(from content)'}
                            </span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => {
                            setDate(newDate);
                            setExtractionMethod(null);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes or context about this link..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.push('/memos')}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="flex items-center gap-1">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Link</span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Saved Links</CardTitle>
                <CardDescription>
                  Browse, search, and filter your previously saved links. Press Cmd+K (or Ctrl+K) to search with keyboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SavedLinksList onLinkSelect={handleLinkSelect} compact />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 
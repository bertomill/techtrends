'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ExternalLink, 
  Search, 
  SortAsc, 
  SortDesc, 
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getFilteredMemos, 
  getUniqueThemes, 
  Memo, 
  FilterOptions 
} from '@/lib/services/memo-service';
import { format } from 'date-fns';
import { CommandK } from '../ui/command-k';

interface SavedLinksListProps {
  onLinkSelect?: (url: string) => void;
  compact?: boolean;
}

export function SavedLinksList({ onLinkSelect, compact = false }: SavedLinksListProps) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_discovered' | 'theme' | 'research_task'>('date_discovered');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load memos and themes on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load themes for filter dropdown
        const uniqueThemes = await getUniqueThemes();
        setThemes(uniqueThemes);
        
        // Load initial memos
        const filterOptions: FilterOptions = {
          sortBy,
          sortOrder
        };
        
        const filteredMemos = await getFilteredMemos(filterOptions);
        setMemos(filteredMemos);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load saved links');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sortBy, sortOrder]);

  // Apply filters when search or theme changes
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setLoading(true);
        
        const filterOptions: FilterOptions = {
          searchQuery,
          theme: selectedTheme === 'all' ? '' : selectedTheme,
          sortBy,
          sortOrder
        };
        
        const filteredMemos = await getFilteredMemos(filterOptions);
        setMemos(filteredMemos);
      } catch (error) {
        console.error('Error applying filters:', error);
        toast.error('Failed to filter links');
      } finally {
        setLoading(false);
      }
    };

    // Use a small delay to avoid too many requests while typing
    const timeoutId = setTimeout(applyFilters, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedTheme]);

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  // Handle link click
  const handleLinkClick = (url: string, e: React.MouseEvent) => {
    if (onLinkSelect) {
      e.preventDefault();
      onLinkSelect(url);
    }
  };

  // Command K search handler
  const handleCommandKSelect = (memo: Memo) => {
    if (memo.news_links && memo.news_links.length > 0 && onLinkSelect) {
      onLinkSelect(memo.news_links[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search saved links..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedTheme} onValueChange={setSelectedTheme}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All themes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All themes</SelectItem>
              {themes.map(theme => (
                <SelectItem key={theme} value={theme}>{theme}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as 'date_discovered' | 'theme' | 'research_task')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_discovered">Date</SelectItem>
              <SelectItem value="theme">Theme</SelectItem>
              <SelectItem value="research_task">Title</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={toggleSortOrder}>
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* Command K search */}
      <CommandK
        items={memos.map(memo => ({
          id: memo.id || '',
          name: memo.research_task,
          description: memo.theme,
          date: memo.date_discovered,
          data: memo
        }))}
        onSelect={handleCommandKSelect}
      />
      
      {/* Links list */}
      <div className="space-y-2">
        {loading ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Loading saved links...</p>
            </CardContent>
          </Card>
        ) : memos.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              {searchQuery || selectedTheme ? (
                <p className="text-muted-foreground">No links found matching your search.</p>
              ) : (
                <p className="text-muted-foreground">No links saved yet.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={compact ? "grid grid-cols-1 md:grid-cols-2 gap-2" : "space-y-2"}>
            {memos.map((memo) => (
              <Card key={memo.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium truncate">{memo.research_task}</h3>
                      <Badge variant="outline" className="ml-2 shrink-0">
                        {memo.theme}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(memo.date_discovered)}</span>
                    </div>
                    
                    <div className="space-y-1 mt-1">
                      {memo.news_links.map((link, index) => (
                        <a 
                          key={index}
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                          onClick={(e) => handleLinkClick(link, e)}
                        >
                          <ExternalLink className="h-3 w-3 shrink-0" />
                          <span className="truncate">{link}</span>
                        </a>
                      ))}
                    </div>
                    
                    {!compact && memo.context && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {memo.context}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { Memo } from '@/lib/services/memo-service';
import { MarkdownContent } from './markdown-content';

interface MemoCardProps {
  memo: Memo;
  onDelete?: (id: string | undefined) => void;
}

export function MemoCard({ memo, onDelete }: MemoCardProps) {
  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Process the memo content to remove the disclaimer
  const processContent = (content: string) => {
    // Remove the disclaimer section if it exists
    return content.replace(/---\s*\n\*This memo is based on publicly available information.*?\*/gs, '');
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl">{memo.research_task}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="bg-primary/10">
              {memo.theme}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDate(memo.date_discovered)}
            </span>
          </div>
        </div>
        {onDelete && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(memo.id)}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Delete</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {memo.context && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Context</h3>
            <p className="text-sm mt-1">{memo.context}</p>
          </div>
        )}
        
        <div className="border-t pt-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Analysis</h3>
          <div className="prose prose-sm max-w-none">
            <MarkdownContent content={processContent(memo.analysis)} />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <h3 className="text-sm font-medium text-muted-foreground">Sources</h3>
          <div className="mt-1 space-y-1">
            {memo.news_links.map((link, index) => (
              <a 
                key={index}
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
              >
                <ExternalLink className="h-3 w-3" />
                {link}
              </a>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
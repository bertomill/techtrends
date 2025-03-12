import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose dark:prose-invert">
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
    </div>
  );
} 
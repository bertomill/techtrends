'use client';

import { useEffect, useState } from 'react';
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Memo } from '@/lib/services/memo-service';

interface CommandKItem {
  id: string;
  name: string;
  description?: string;
  date?: string;
  data: Memo;
}

interface CommandKProps {
  items: CommandKItem[];
  onSelect: (item: Memo) => void;
}

export function CommandK({ items, onSelect }: CommandKProps) {
  const [open, setOpen] = useState(false);

  // Listen for Cmd+K or Ctrl+K to open the command dialog
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search all saved links..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Saved Links">
          {items.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => {
                onSelect(item.data);
                setOpen(false);
              }}
            >
              <div className="flex flex-col">
                <span>{item.name}</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {item.description && (
                    <span className="text-xs">{item.description}</span>
                  )}
                  {item.date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">{formatDate(item.date)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
} 
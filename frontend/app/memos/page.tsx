'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/main-layout';
import { MemoCard } from '../components/data-display/memo-card';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getMemos, deleteMemo, Memo as MemoType } from '@/lib/services/memo-service';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { LinkIcon } from 'lucide-react';

export default function MemosPage() {
  const [memos, setMemos] = useState<MemoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch memos on component mount
  useEffect(() => {
    const fetchMemos = async () => {
      try {
        setLoading(true);
        const fetchedMemos = await getMemos();
        setMemos(fetchedMemos);
      } catch (error) {
        console.error('Error fetching memos:', error);
        toast.error('Failed to load memos');
      } finally {
        setLoading(false);
      }
    };

    fetchMemos();
  }, []);

  // Handle memo deletion
  const handleDeleteMemo = async (id: string | undefined) => {
    if (!id) return;
    
    try {
      // Delete from Firebase
      await deleteMemo(id);
      
      // Update local state
      setMemos(prev => prev.filter(memo => memo.id !== id));
      toast.success('Memo deleted successfully!');
    } catch (error) {
      console.error('Error deleting memo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete memo';
      toast.error(errorMessage);
    }
  };

  // Filter memos based on search query
  const filteredMemos = memos.filter(memo => 
    memo.research_task.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memo.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memo.context.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Research Memos</h2>
            <p className="text-muted-foreground">
              View and manage your saved research memos.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/quick-save">
              <Button variant="outline" className="flex items-center gap-2">
                <LinkIcon size={16} />
                <span>Quick Save</span>
              </Button>
            </Link>
            <Link href="/generator">
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                <span>New Memo</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search memos..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Loading memos...</p>
              </CardContent>
            </Card>
          ) : filteredMemos.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                {searchQuery ? (
                  <p className="text-muted-foreground">No memos found matching your search.</p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">No memos generated yet.</p>
                    <Link href="/generator">
                      <Button>Generate Your First Memo</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredMemos.map((memo) => (
              <MemoCard 
                key={memo.id} 
                memo={memo} 
                onDelete={handleDeleteMemo} 
              />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
} 
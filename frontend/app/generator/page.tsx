'use client';

import { useState } from 'react';
import { MainLayout } from '../components/layout/main-layout';
import ScrapeForm from '../components/forms/scrape-form';
import { toast } from 'sonner';
import { saveMemo, Memo as MemoType } from '@/lib/services/memo-service';
import { useRouter } from 'next/navigation';

export default function GeneratorPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Handle form submission
  const handleSubmit = async (data: MemoType) => {
    setIsSubmitting(true);
    try {
      // Save to Firebase
      const savedMemo = await saveMemo(data);
      
      toast.success('Memo saved to Firebase successfully!');
      
      // Redirect to memos page
      router.push('/memos');
    } catch (error) {
      console.error('Error saving memo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save memo to Firebase';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Memo Generator</h2>
          <p className="text-muted-foreground">
            Generate structured research memos from web content to track emerging technology trends.
          </p>
        </div>

        <div className="max-w-4xl">
          <ScrapeForm onSubmit={handleSubmit} />
        </div>
      </div>
    </MainLayout>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '../components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMemos, Memo as MemoType } from '@/lib/services/memo-service';
import { toast } from 'sonner';

export default function AnalyticsPage() {
  const [memos, setMemos] = useState<MemoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalMemos: 0,
    themeDistribution: {} as Record<string, number>,
    monthlyActivity: {} as Record<string, number>,
  });

  // Fetch memos on component mount
  useEffect(() => {
    const fetchMemos = async () => {
      try {
        setLoading(true);
        const fetchedMemos = await getMemos();
        setMemos(fetchedMemos);
        
        // Calculate analytics
        const themeDistribution: Record<string, number> = {};
        const monthlyActivity: Record<string, number> = {};
        
        fetchedMemos.forEach(memo => {
          // Theme distribution
          themeDistribution[memo.theme] = (themeDistribution[memo.theme] || 0) + 1;
          
          // Monthly activity
          const date = new Date(memo.date_discovered);
          const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
          monthlyActivity[monthYear] = (monthlyActivity[monthYear] || 0) + 1;
        });
        
        setAnalytics({
          totalMemos: fetchedMemos.length,
          themeDistribution,
          monthlyActivity,
        });
      } catch (error) {
        console.error('Error fetching memos:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchMemos();
  }, []);

  // Format month-year for display
  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Analyze trends and patterns in your research memos.
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Loading analytics data...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Theme Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Theme Distribution</CardTitle>
                <CardDescription>
                  Distribution of research memos by theme
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(analytics.themeDistribution).length === 0 ? (
                  <p className="text-muted-foreground text-center">No data available</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(analytics.themeDistribution)
                      .sort((a, b) => b[1] - a[1])
                      .map(([theme, count]) => (
                        <div key={theme} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{theme}</span>
                            <span className="text-muted-foreground">{count} memos</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${(count / analytics.totalMemos) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
                <CardDescription>
                  Number of memos created per month
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(analytics.monthlyActivity).length === 0 ? (
                  <p className="text-muted-foreground text-center">No data available</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(analytics.monthlyActivity)
                      .sort((a, b) => a[0].localeCompare(b[0]))
                      .map(([monthYear, count]) => (
                        <div key={monthYear} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{formatMonthYear(monthYear)}</span>
                            <span className="text-muted-foreground">{count} memos</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${(count / Math.max(...Object.values(analytics.monthlyActivity))) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 
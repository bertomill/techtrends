'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from './components/layout/main-layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getMemos, Memo as MemoType } from '@/lib/services/memo-service';
import { toast } from 'sonner';
import Link from 'next/link';
import { BarChart, FileText, Plus, TrendingUp, Link as LinkIcon } from 'lucide-react';

export default function Home() {
  const [memos, setMemos] = useState<MemoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMemos: 0,
    recentMemos: 0,
    topTheme: '',
  });

  // Fetch memos on component mount
  useEffect(() => {
    const fetchMemos = async () => {
      try {
        setLoading(true);
        const fetchedMemos = await getMemos();
        setMemos(fetchedMemos);
        
        // Calculate stats
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const recentMemos = fetchedMemos.filter(memo => {
          const memoDate = new Date(memo.date_discovered);
          return memoDate >= oneWeekAgo;
        });
        
        // Count themes
        const themes: Record<string, number> = {};
        fetchedMemos.forEach(memo => {
          themes[memo.theme] = (themes[memo.theme] || 0) + 1;
        });
        
        // Find top theme
        let topTheme = '';
        let maxCount = 0;
        Object.entries(themes).forEach(([theme, count]) => {
          if (count > maxCount) {
            maxCount = count;
            topTheme = theme;
          }
        });
        
        setStats({
          totalMemos: fetchedMemos.length,
          recentMemos: recentMemos.length,
          topTheme: topTheme || 'None',
        });
      } catch (error) {
        console.error('Error fetching memos:', error);
        toast.error('Failed to load memos');
      } finally {
        setLoading(false);
      }
    };

    fetchMemos();
  }, []);

  // Get recent memos (last 3)
  const recentMemos = memos.slice(0, 3);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Tech Trends Tracker</h1>
            <p className="text-muted-foreground mt-2">
              Track and analyze emerging technology trends
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

        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your Tech Trends research dashboard.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Memos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMemos}</div>
              <p className="text-xs text-muted-foreground">
                Research memos in your collection
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentMemos}</div>
              <p className="text-xs text-muted-foreground">
                New memos in the last 7 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Theme</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topTheme}</div>
              <p className="text-xs text-muted-foreground">
                Most researched technology trend
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Memos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Recent Memos</h3>
            <Link href="/memos">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Loading memos...</p>
              </CardContent>
            </Card>
          ) : recentMemos.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="space-y-4">
                  <p className="text-muted-foreground">No memos generated yet.</p>
                  <Link href="/generator">
                    <Button className="flex items-center gap-2">
                      <Plus size={16} />
                      <span>Create Your First Memo</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {recentMemos.map(memo => (
                <Card key={memo.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base truncate">{memo.research_task}</CardTitle>
                    <CardDescription className="truncate">{memo.theme}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {memo.context || 'No context provided.'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/memos?id=${memo.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Link href="/generator">
              <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus size={18} />
                    <span>Generate New Memo</span>
                  </CardTitle>
                  <CardDescription>
                    Create a new research memo from web content
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="/analytics">
              <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart size={18} />
                    <span>View Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    Analyze trends and patterns in your research
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

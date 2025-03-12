import React from 'react';
import { Toaster } from "@/components/ui/sonner";
import Link from 'next/link';
import { 
  Home, 
  FileText, 
  Layers, 
  Settings, 
  User, 
  BarChart2,
  Link as LinkIcon,
  Users
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background h-screen sticky top-0 overflow-y-auto">
        <div className="p-6 border-b">
          <Link href="/" className="text-xl font-bold flex items-center">
            TechTrends
          </Link>
        </div>
        
        <nav className="p-4 space-y-8">
          {/* Main Navigation */}
          <div className="space-y-2">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors">
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link href="/memos" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors">
              <FileText size={20} />
              <span>Memos</span>
            </Link>
          </div>
          
          {/* Tools Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground px-3 mb-2">Tools</h3>
            <div className="space-y-2">
              <Link href="/generator" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                <Layers size={20} />
                <span>Memo Generator</span>
              </Link>
              <Link href="/quick-save" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                <LinkIcon size={20} />
                <span>Quick Save</span>
              </Link>
              <Link href="/personas" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                <Users size={20} />
                <span>Personas</span>
              </Link>
              <Link href="/analytics" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                <BarChart2 size={20} />
                <span>Analytics</span>
              </Link>
            </div>
          </div>
          
          {/* Account Section */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground px-3 mb-2">Account</h3>
            <div className="space-y-2">
              <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                <User size={20} />
                <span>Profile</span>
              </Link>
              <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 px-6 py-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
} 
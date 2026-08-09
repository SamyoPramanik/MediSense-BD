'use client';
import { ReactNode } from 'react';
import Sidebar from './Sidebar';

import TopBar from './TopBar';
import SOSButton from '@/components/ui/SOSButton';
import PageTransition from '@/components/ui/PageTransition';
import { ChatProvider } from '@/components/ai/ChatContext';
import GlobalAiChatbot from '@/components/ai/GlobalAiChatbot';
import ActivityTracker from '@/components/layout/ActivityTracker';
import Footer from './Footer';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ChatProvider>
      <ActivityTracker />
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <TopBar />
          <main className="flex-1 p-6">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
          <Footer />
        </div>
        <SOSButton />
        <GlobalAiChatbot />
      </div>
    </ChatProvider>
  );
}


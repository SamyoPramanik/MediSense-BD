'use client';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import SOSButton from '@/components/ui/SOSButton';
import PageTransition from '@/components/ui/PageTransition';
import { ChatProvider } from '@/components/ai/ChatContext';
import GlobalAiChatbot from '@/components/ai/GlobalAiChatbot';
import { ReactNode } from 'react';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ChatProvider>
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-6 overflow-y-auto">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
        <SOSButton />
        <GlobalAiChatbot />
      </div>
    </ChatProvider>
  );
}

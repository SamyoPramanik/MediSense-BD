'use client';
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { chatApi } from '@/lib/api';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: string;
}

interface ChatContextType {
  isOpen: boolean;
  districtId: number | null;
  districtName: string | null;
  messages: ChatMessage[];
  loading: boolean;
  openChat: () => void;
  closeChat: () => void;
  openChatForDistrict: (districtId: number, districtName: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextType>({
  isOpen: false,
  districtId: null,
  districtName: null,
  messages: [],
  loading: false,
  openChat: () => {},
  closeChat: () => {},
  openChatForDistrict: async () => {},
  sendMessage: async () => {},
  clearChat: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [districtName, setDistrictName] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setDistrictId(null);
    setDistrictName(null);
  }, []);

  const openChatForDistrict = useCallback(async (dId: number, dName: string) => {
    setDistrictId(dId);
    setDistrictName(dName);
    setIsOpen(true);
    setLoading(true);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Show me health & outbreak summary for ${dName} district.`,
      timestamp: now,
    };

    setMessages([userMsg]);

    try {
      const res = await chatApi.query({
        message: 'summary',
        districtId: dId,
        history: [],
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source,
      };

      setMessages([userMsg, aiMsg]);
    } catch (err) {
      console.error('Failed to get district summary from AI:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `### 📍 District Summary: **${dName}**\n\n*Unable to fetch live AI response. Please verify backend connection.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([userMsg, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: now,
    };

    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ sender: m.sender, text: m.text }));
      const res = await chatApi.query({
        message: text,
        districtId,
        history,
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source,
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI chat send error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I ran into an issue connecting to the MediSense AI engine.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [districtId, messages]);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        districtId,
        districtName,
        messages,
        loading,
        openChat,
        closeChat,
        openChatForDistrict,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);

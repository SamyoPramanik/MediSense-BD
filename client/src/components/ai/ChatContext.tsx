'use client';
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

  // Restore persistent messages from browser localStorage on mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('medisense_global_chat_messages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }

      const savedDistId = localStorage.getItem('medisense_chat_district_id');
      if (savedDistId) setDistrictId(Number(savedDistId));

      const savedDistName = localStorage.getItem('medisense_chat_district_name');
      if (savedDistName) setDistrictName(savedDistName);
    } catch (err) {
      console.error('Failed to restore chat history from localStorage:', err);
    }
  }, []);

  // Sync messages & active district to browser localStorage
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem('medisense_global_chat_messages', JSON.stringify(messages));
      } else {
        localStorage.removeItem('medisense_global_chat_messages');
      }

      if (districtId) {
        localStorage.setItem('medisense_chat_district_id', String(districtId));
      } else {
        localStorage.removeItem('medisense_chat_district_id');
      }

      if (districtName) {
        localStorage.setItem('medisense_chat_district_name', districtName);
      } else {
        localStorage.removeItem('medisense_chat_district_name');
      }
    } catch (err) {
      console.error('Failed to sync chat history to localStorage:', err);
    }
  }, [messages, districtId, districtName]);

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
    try {
      localStorage.removeItem('medisense_global_chat_messages');
      localStorage.removeItem('medisense_chat_district_id');
      localStorage.removeItem('medisense_chat_district_name');
    } catch (err) {}
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

    setMessages(prev => [...prev, userMsg]);

    try {
      const history = messages.map(m => ({ sender: m.sender, text: m.text }));
      const res = await chatApi.query({
        message: 'summary',
        districtId: dId,
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
      console.error('Failed to get district summary from AI:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `### 📍 District Summary: **${dName}**\n\n*Unable to fetch live AI response. Please verify backend connection.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [messages]);

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

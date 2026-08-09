'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FormattedMarkdown from '@/components/ui/FormattedMarkdown';
import { useChat } from './ChatContext';


export default function GlobalAiChatbot() {
  const { isOpen, districtName, messages, loading, openChat, closeChat, sendMessage, clearChat } = useChat();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    const text = inputText;
    setInputText('');
    sendMessage(text);
  };

  const quickPrompts = districtName
    ? [
        `Explain outbreak risk in ${districtName}`,
        `Hospital & bed capacity in ${districtName}`,
        `Prevention tips for ${districtName}`,
        `Search web for Dengue trends`
      ]
    : [
        'National Dengue outbreak forecast',
        'Find nearest hospital with ICU beds',
        'Verify medicine authenticity',
        'Bengali symptom triage guidelines'
      ];

  return (
    <>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={openChat}
            className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full text-white shadow-2xl flex items-center gap-2.5 transition-all group"
            style={{
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              boxShadow: '0 8px 32px rgba(20, 184, 166, 0.4), 0 0 20px rgba(13, 148, 136, 0.3)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
            </div>
            <span className="text-xs font-semibold pr-1 hidden sm:inline-block">AI Health Assistant</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl flex flex-col overflow-hidden border shadow-2xl"
            style={{
              background: 'rgba(5, 34, 34, 0.95)',
              backdropFilter: 'blur(24px)',
              borderColor: 'rgba(20, 184, 166, 0.3)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(20, 184, 166, 0.15)',
            }}
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b flex items-center justify-between" style={{ background: 'rgba(10, 50, 50, 0.9)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white leading-tight">MediSense AI Assistant</h3>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">Live DB & Web</span>
                  </div>
                  <p className="text-[11px] text-white/50">
                    {districtName ? `Active Context: ${districtName} District` : 'Ask anything about diseases, weather & hospitals'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 text-xs transition-colors"
                    title="Clear Conversation"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                )}
                <button
                  onClick={closeChat}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                  title="Close Drawer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  </div>
                  <p className="text-sm font-semibold text-white/90">How can MediSense AI help you today?</p>
                  <p className="text-xs text-white/40 mt-1 max-w-xs">
                    Click any district on the interactive map for automated summaries, or select a prompt below.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-2xl leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-teal-600 text-white rounded-br-none shadow-md'
                          : 'glass-card border border-white/10 text-white/90 rounded-bl-none'
                      }`}
                    >
                      <FormattedMarkdown content={msg.text} theme="teal" />
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[10px] text-white/30">{msg.timestamp}</span>
                      {msg.source && (
                        <span className="text-[9px] text-teal-400/70 font-mono">
                          {msg.source}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}

              {loading && (
                <div className="flex items-center gap-2 p-3 glass-card rounded-2xl w-fit">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] text-white/50 ml-1">Consulting dataset & live search index...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Chips */}
            <div className="px-3 py-2 border-t flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(3, 20, 20, 0.6)' }}>
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(p)}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-white/5 text-teal-300/90 border border-teal-500/20 hover:bg-teal-500/20 hover:border-teal-500/40 transition-all flex-shrink-0"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 border-t flex items-center gap-2" style={{ background: 'rgba(10, 46, 46, 0.95)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={districtName ? `Ask about ${districtName} dataset or precautions...` : 'Ask AI about health datasets, diseases...'}
                className="glass-input flex-1 py-2 text-xs"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="p-2 rounded-xl text-white disabled:opacity-40 transition-all flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

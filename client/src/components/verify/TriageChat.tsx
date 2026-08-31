'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { verifyApi, chatApi } from '@/lib/api';
import FormattedMarkdown from '@/components/ui/FormattedMarkdown';
import { useAuth } from '@/hooks/useAuth';
import ClinicalReportModal, { ClinicalReportData } from '@/components/reports/ClinicalReportModal';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  triageLevel?: string;
}

const levelColors: Record<string, string> = {
  low: '#22c55e', moderate: '#f59e0b', critical: '#ef4444',
};

const levelLabels: Record<string, string> = {
  low: '🟢 নিম্ন ঝুঁকি (Low Risk)', moderate: '⚠️ মাঝারি ঝুঁকি (Moderate Risk)', critical: '🚨 জরুরি (Critical Emergency)',
};

const defaultInitialMessage: Message = {
  id: 0,
  role: 'assistant',
  text: `### 🩺 আসসালামু আলাইকুম! MediSense AI Doctor

আপনার শারীরিক লক্ষণ বা উপসর্গগুলি বাংলায় লিখুন। আমি প্রাথমিক মূল্যায়ন ও স্বাস্থ্য উপদেশ প্রদান করব।

**উদাহরণ:**
* *"আমার বিগত ৩ দিন ধরে উচ্চ জ্বর এবং তীব্র মাথাব্যথা হচ্ছে"*
* *"আমার কাশি এবং শ্বাসনালীতে অস্বস্তি অনুভূত হচ্ছে"*`
};

export default function TriageChat() {
  const { user } = useAuth();
  const userIdKey = user ? `u${user.id}` : 'anon';

  const [messages, setMessages] = useState<Message[]>([defaultInitialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<ClinicalReportData | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const handleGenerateReport = async () => {
    setReportModalOpen(true);
    setReportLoading(true);
    try {
      const historyPayload = messages.map(m => ({ sender: m.role === 'user' ? 'user' : 'ai', text: m.text }));
      const res = await chatApi.generateReport({
        history: historyPayload,
        user: user || {},
        districtName: 'AI Doctor Symptom Triage'
      });
      if (res && res.report) {
        setReportData(res.report);
      }
    } catch (err) {
      console.error('Failed to generate triage clinical report:', err);
    } finally {
      setReportLoading(false);
    }
  };


  // Restore user-isolated triage chat messages from browser localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`medisense_triage_chat_messages_${userIdKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        } else {
          setMessages([defaultInitialMessage]);
        }
      } else {
        setMessages([defaultInitialMessage]);
      }
    } catch (err) {
      console.error('Failed to load triage chat history:', err);
    }
  }, [userIdKey]);

  // Save user-isolated triage chat messages to browser localStorage
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(`medisense_triage_chat_messages_${userIdKey}`, JSON.stringify(messages));
      }
    } catch (err) { }
  }, [messages, userIdKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClearHistory = () => {
    setMessages([defaultInitialMessage]);
    try {
      localStorage.removeItem(`medisense_triage_chat_messages_${userIdKey}`);
    } catch (e) { }
  };


  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await verifyApi.triage(userMsg.text);
      const symptoms = res.detected_symptoms.map(s => `* **${s.en}** (${s.disease})`).join('\n');
      const reply: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: `### 🔍 ট্রায়াজ মূল্যায়ন ও স্বাস্থ্য সুপারিশ

${res.recommendation}

---
**সনাক্ত করা উপসর্গ:**
${symptoms}

[Model: ${res.model}] [Confidence: ${(res.confidence * 100).toFixed(0)}%]`,
        triageLevel: res.triage_level,
      };
      setMessages(prev => [...prev, reply]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: 'দুঃখিত, ট্রায়াজ সার্ভারে সংযোগে একটি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' }]);
    }
    setLoading(false);
  };

  return (
    <div className="glass-card flex flex-col h-[520px] max-h-[520px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(10,46,46,0.8)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
            <span className="text-sm">🩺</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">বাংলা AI Doctor</p>
            <p className="text-[10px] text-teal-400 opacity-80">BanglaBERT & Groq LLM AI Doctor</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleGenerateReport}
              className="px-2.5 py-1 rounded-lg text-xs bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 font-bold transition-all flex items-center gap-1 shadow-md"
              title="Generate Clinical Assessment & Care Report"
            >
              <span>📋 Export Clinical Report</span>
            </button>
          )}
          {messages.length > 1 && (
            <button
              onClick={handleClearHistory}
              className="px-2 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors flex items-center gap-1"
              title="ট্রায়াজ হিস্ট্রি মুছুন"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              <span>রিসেট</span>
            </button>
          )}
        </div>
      </div>


      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs custom-scrollbar">

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed ${msg.role === 'user' ? 'rounded-br-md text-white' : 'rounded-bl-md glass-card text-white/90'}`}
              style={{
                background: msg.role === 'user' ? 'linear-gradient(135deg, #0d9488, #14b8a6)' : undefined,
                border: msg.triageLevel ? `1px solid ${levelColors[msg.triageLevel]}60` : undefined,
              }}
            >
              {msg.triageLevel && (
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-2 shadow-sm" style={{ background: `${levelColors[msg.triageLevel]}25`, color: levelColors[msg.triageLevel], border: `1px solid ${levelColors[msg.triageLevel]}40` }}>
                  {levelLabels[msg.triageLevel]}
                </span>
              )}
              {msg.role === 'user' ? (
                <p className="text-white font-medium whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <FormattedMarkdown content={msg.text} theme="teal" />
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl p-3 glass-card flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-teal-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} />
              ))}
              <span className="text-[11px] text-white/50 ml-1">উপসর্গ পর্যবেক্ষণ করা হচ্ছে...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(10,46,46,0.6)' }}>
        <input
          id="triage-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="বাংলায় উপসর্গ লিখুন (যেমন: জ্বর, মাথাব্যথা, বমি)..."
          className="glass-input flex-1 text-xs py-2.5"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-30 transition-all flex items-center gap-1.5 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}
        >
          <span>পাঠান</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>

      {/* Clinical Assessment Report Modal */}
      <ClinicalReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        report={reportData}
        loading={reportLoading}
      />
    </div>
  );
}


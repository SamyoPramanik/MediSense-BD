'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { verifyApi } from '@/lib/api';

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
  low: 'নিম্ন ঝুঁকি', moderate: 'মাঝারি ঝুঁকি', critical: 'জরুরি',
};

export default function TriageChat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: 'assistant', text: 'আসসালামু আলাইকুম! আমি MediSense AI ট্রায়াজ সহকারী। আপনার উপসর্গগুলি বাংলায় লিখুন, আমি প্রাথমিক মূল্যায়ন করব।\n\nযেমন: "আমার জ্বর এবং মাথাব্যথা হচ্ছে"' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await verifyApi.triage(userMsg.text);
      const symptoms = res.detected_symptoms.map(s => `• ${s.en} (${s.disease})`).join('\n');
      const reply: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: `🔍 **ট্রায়াজ ফলাফল**\n\n${res.recommendation}\n\n**সনাক্ত করা উপসর্গ:**\n${symptoms}\n\n_Model: ${res.model} | Confidence: ${(res.confidence * 100).toFixed(0)}%_`,
        triageLevel: res.triage_level,
      };
      setMessages(prev => [...prev, reply]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: 'দুঃখিত, একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন।' }]);
    }
    setLoading(false);
  };

  return (
    <div className="glass-card flex flex-col h-full" style={{ minHeight: '500px' }}>
      <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
          <span className="text-sm">🩺</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">বাংলা ট্রায়াজ</p>
          <p className="text-[10px] text-white/40">BanglaBERT-Triage-v1</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'}`}
              style={{
                background: msg.role === 'user' ? 'linear-gradient(135deg, #0d9488, #14b8a6)' : 'rgba(255,255,255,0.06)',
                border: msg.triageLevel ? `1px solid ${levelColors[msg.triageLevel]}40` : undefined,
              }}
            >
              {msg.triageLevel && (
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-2" style={{ background: `${levelColors[msg.triageLevel]}20`, color: levelColors[msg.triageLevel] }}>
                  {levelLabels[msg.triageLevel]}
                </span>
              )}
              <p className="text-white/90 whitespace-pre-wrap">{msg.text}</p>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-4 py-3 bg-white/5 flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-teal-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <input
          id="triage-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="বাংলায় উপসর্গ লিখুন..."
          className="glass-input flex-1"
        />
        <button onClick={send} disabled={loading || !input.trim()} className="px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-30 transition-all" style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
          পাঠান
        </button>
      </div>
    </div>
  );
}

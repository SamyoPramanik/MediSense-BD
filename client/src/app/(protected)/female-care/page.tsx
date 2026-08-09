'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { chatApi } from '@/lib/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: string;
}

export default function FemaleCarePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### 🌸 Welcome to Nari Care AI (নারী কেয়ার)

Hello! I am your personal health companion and confidential AI counselor. I am here to provide compassionate guidance on:

* 🧠 **Mental Support & Stress Relief** (অপাংক্তেয় চাপ ও মানসিক প্রশান্তি)
* 🌺 **Maternal & Reproductive Healthcare** (গর্ভকালীন ও প্রজনন স্বাস্থ্য)
* 🥗 **Nutrition & Anemia Prevention** (পুষ্টি ও রক্তস্বল্পতা)
* 🛡️ **Confidential Health Q&A**

How are you feeling today? You can choose a quick topic below or ask any question freely.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Nari Care AI Guide',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ sender: m.sender, text: m.text }));
      const res = await chatApi.femaleCare({ message: queryText, history });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Female care query failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'I am having trouble connecting to Nari Care server. Please try again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const topicCards = [
    {
      title: 'Mental Health & Emotional Well-Being',
      icon: '🧠',
      color: '#ec4899',
      desc: 'Coping strategies for stress, anxiety, emotional burnout, and postpartum care.',
      prompt: 'I am feeling very stressed and anxious lately. Can you give me some emotional support and grounding exercises?',
    },
    {
      title: 'Reproductive & Maternal Health',
      icon: '🌺',
      color: '#f43f5e',
      desc: 'Period hygiene, pregnancy milestones, warning signs, and gynecological wellness.',
      prompt: 'What are essential precautions for menstrual hygiene and reproductive health in Bangladesh?',
    },
    {
      title: 'Nutrition & Anemia Care',
      icon: '🥗',
      color: '#10b981',
      desc: 'Iron-rich diets, preventing fatigue, and local Bangladeshi food guidance.',
      prompt: 'How can I prevent anemia and increase iron level with local food in Bangladesh?',
    },
    {
      title: 'Work-Life & Mindful Balance',
      icon: '🛡️',
      color: '#8b5cf6',
      desc: 'Self-care routines, balancing responsibilities, and emotional resilience.',
      prompt: 'How can I balance family expectations and career stress without feeling overwhelmed?',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      {/* Header Banner */}
      <motion.div
        className="glass-card p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(13, 148, 136, 0.15))',
          borderColor: 'rgba(244, 114, 182, 0.3)',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌸</span>
              <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>
                Nari Care AI (নারী স্বাস্থ্য ও মানসিক সেবা)
              </h1>
            </div>
            <p className="text-white/60 text-sm max-w-2xl">
              A dedicated, confidential space for women. Ask questions about your physical health, mental well-being, pregnancy, or emotional stress — our AI counselor is here to listen and support you.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-pink-500/10 border border-pink-500/20 px-4 py-3 rounded-2xl">
            <div className="w-3 h-3 rounded-full bg-pink-400 animate-pulse" />
            <span className="text-xs font-semibold text-pink-300">100% Confidential & Supportive</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Topic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topicCards.map((card, idx) => (
          <motion.div
            key={card.title}
            onClick={() => handleSend(card.prompt)}
            className="glass-card p-5 cursor-pointer hover:border-pink-500/40 transition-all group flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(236, 72, 153, 0.2)' }}
          >
            <div>
              <div className="text-2xl mb-3">{card.icon}</div>
              <h3 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                {card.title}
              </h3>
              <p className="text-xs text-white/50 mt-1.5 leading-relaxed">{card.desc}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-pink-400 font-medium">
              <span>Ask AI Guide</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Counselor Chat Window */}
      <motion.div
        className="glass-card overflow-hidden flex flex-col h-[560px]"
        style={{ borderColor: 'rgba(244, 114, 182, 0.25)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Chat Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: 'rgba(15, 23, 42, 0.6)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-lg shadow-md">
              👩‍⚕️
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Nari Mental Support & Health Companion</h2>
              <p className="text-[11px] text-pink-300/80">Empathetic • Confidential • Medical Guidance</p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20">
            OpenAI & MediSense Engine
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-br-none shadow-md'
                    : 'glass-card border border-white/10 text-white/90 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
              <div className="flex items-center gap-2 mt-1 px-1">
                <span className="text-[10px] text-white/30">{msg.timestamp}</span>
                {msg.source && <span className="text-[9px] text-pink-400 font-mono">{msg.source}</span>}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 glass-card rounded-2xl w-fit">
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[11px] text-white/50 ml-1">Nari Care AI is reflecting on your question...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t flex items-center gap-3"
          style={{ background: 'rgba(15, 23, 42, 0.8)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or express how you feel..."
            className="glass-input flex-1 py-3 px-4 text-xs"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl text-white font-semibold text-xs disabled:opacity-40 transition-all flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}
          >
            <span>Ask Counselor</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </form>
      </motion.div>
    </div>
  );
}

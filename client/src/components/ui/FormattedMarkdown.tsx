'use client';
import React from 'react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
  theme?: 'teal' | 'pink';
}

export default function FormattedMarkdown({ content, className = '', theme = 'teal' }: FormattedMarkdownProps) {
  if (!content) return null;

  const accentColor = theme === 'pink' ? 'text-pink-300' : 'text-teal-300';
  const badgeBg = theme === 'pink' ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-teal-500/20 text-teal-300 border-teal-500/30';
  const hrColor = theme === 'pink' ? 'border-pink-500/20' : 'border-teal-500/20';

  // Helper to parse inline formatting (**bold**, *italic*, badges)
  const parseInline = (text: string): React.ReactNode[] => {
    // Regex matching **bold**, *italic*, and [Source: ...] badges
    const regex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\])/g;
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Bold **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        const inner = part.slice(2, -2);
        return (
          <strong key={idx} className="font-semibold text-white font-sans">
            {inner}
          </strong>
        );
      }

      // Italic *text*
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        const inner = part.slice(1, -1);
        return (
          <em key={idx} className="italic text-white/80">
            {inner}
          </em>
        );
      }

      // Badge / Chip [Source: ...] or [Text]
      if (part.startsWith('[') && part.endsWith(']')) {
        const inner = part.slice(1, -1);
        return (
          <span
            key={idx}
            className={`inline-block text-[10px] px-2 py-0.5 mx-0.5 rounded-full border font-mono ${badgeBg}`}
          >
            {inner}
          </span>
        );
      }

      return <span key={idx}>{part}</span>;
    });
  };

  // Split lines and process block elements
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-1.5 my-2 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      elements.push(<div key={`blank-${index}`} className="h-1.5" />);
      return;
    }

    // Horizontal Rule ---
    if (trimmed === '---' || trimmed === '***') {
      flushList();
      elements.push(<hr key={`hr-${index}`} className={`my-3 border-t ${hrColor}`} />);
      return;
    }

    // Headers: ### Header
    if (trimmed.startsWith('### ')) {
      flushList();
      const title = trimmed.replace(/^###\s+/, '');
      elements.push(
        <h3 key={`h3-${index}`} className={`text-sm font-bold mt-3 mb-1.5 flex items-center gap-1.5 ${accentColor}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
          {parseInline(title)}
        </h3>
      );
      return;
    }

    // Headers: ## Header
    if (trimmed.startsWith('## ')) {
      flushList();
      const title = trimmed.replace(/^##\s+/, '');
      elements.push(
        <h2 key={`h2-${index}`} className={`text-base font-bold mt-3 mb-2 flex items-center gap-2 ${accentColor}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
          {parseInline(title)}
        </h2>
      );
      return;
    }

    // Headers: # Header
    if (trimmed.startsWith('# ')) {
      flushList();
      const title = trimmed.replace(/^#\s+/, '');
      elements.push(
        <h1 key={`h1-${index}`} className={`text-lg font-extrabold mt-4 mb-2 ${accentColor}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
          {parseInline(title)}
        </h1>
      );
      return;
    }

    // Bullet points: * Item or - Item
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const itemText = trimmed.replace(/^[*|-]\s+/, '');
      listItems.push(
        <li key={`li-${index}`} className="flex items-start gap-2 text-white/90 text-xs leading-relaxed">
          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${theme === 'pink' ? 'bg-pink-400' : 'bg-teal-400'}`} />
          <span className="flex-1">{parseInline(itemText)}</span>
        </li>
      );
      return;
    }

    // Numbered list: 1. Item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const num = numMatch[1];
      const itemText = numMatch[2];
      listItems.push(
        <li key={`li-${index}`} className="flex items-start gap-2 text-white/90 text-xs leading-relaxed">
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md flex-shrink-0 mt-0.5 ${badgeBg}`}>
            {num}
          </span>
          <span className="flex-1">{parseInline(itemText)}</span>
        </li>
      );
      return;
    }

    // Regular Paragraph line
    flushList();
    elements.push(
      <p key={`p-${index}`} className="text-xs text-white/90 leading-relaxed my-1">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-0.5 text-xs text-white/90 ${className}`}>{elements}</div>;
}

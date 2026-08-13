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
  const hrColor = theme === 'pink' ? 'border-pink-500/30' : 'border-teal-500/30';
  const tableHeaderBg = theme === 'pink' ? 'rgba(236, 72, 153, 0.18)' : 'rgba(20, 184, 166, 0.18)';
  const bulletBg = theme === 'pink' ? 'bg-pink-400' : 'bg-teal-400';

  // Inline syntax parser: **bold**, *italic*, `code`, [label](url), [BadgeText]
  const parseInline = (text: string): React.ReactNode[] => {
    if (!text) return [];

    // Preprocess: auto-repair unclosed asterisks if truncated
    let sanitized = text;
    const doubleAsteriskCount = (sanitized.match(/\*\*/g) || []).length;
    if (doubleAsteriskCount % 2 !== 0) sanitized += '**';
    const singleAsteriskCount = (sanitized.replace(/\*\*/g, '').match(/\*/g) || []).length;
    if (singleAsteriskCount % 2 !== 0) sanitized += '*';

    // Regex matching: [link](url), `code`, **bold**, *italic*, [badge]
    const regex = /(\[.*?\]\(https?:\/\/.*?\)|\`.*?\`|\*\*.*?\*\*|\*.*?\*|\[.*?\])/g;
    const parts = sanitized.split(regex);

    return parts.map((part, idx) => {
      if (!part) return null;

      // Markdown Link: [Text](https://url)
      const linkMatch = part.match(/^\[(.*?)\]\((https?:\/\/.*?)\)$/);
      if (linkMatch) {
        return (
          <a
            key={idx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity ${accentColor} break-words`}
          >
            {linkMatch[1]}
          </a>
        );
      }

      // Inline Code: `code`
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded-md bg-white/10 font-mono text-[11px] text-teal-200 border border-white/10 break-all">
            {part.slice(1, -1)}
          </code>
        );
      }

      // Bold **text**
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={idx} className="font-semibold text-white break-words">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic *text*
      if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**') && part.length >= 2) {
        return (
          <em key={idx} className="italic text-white/85 break-words">
            {part.slice(1, -1)}
          </em>
        );
      }

      // Badge / Chip [Source: ...] or [Badge]
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span
            key={idx}
            className={`inline-block text-[10px] px-2 py-0.5 mx-0.5 rounded-full border font-mono break-all ${badgeBg}`}
          >
            {part.slice(1, -1)}
          </span>
        );
      }

      return <span key={idx} className="break-words">{part}</span>;
    });
  };

  // Process block lines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let tableLines: string[] = [];
  let codeBlockLines: string[] = [];
  let inCodeBlock = false;
  let codeLang = '';

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="space-y-1.5 my-2 pl-1 max-w-full">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  const flushTable = () => {
    if (tableLines.length > 0) {
      if (tableLines.length < 2) {
        tableLines.forEach((tLine, i) => {
          elements.push(
            <p key={`table-fallback-${elements.length}-${i}`} className="text-xs text-white/90 leading-relaxed my-1 break-words">
              {parseInline(tLine)}
            </p>
          );
        });
        tableLines = [];
        return;
      }

      const parsedRows = tableLines.map(line => {
        const cells = line.split('|').map(c => c.trim());
        if (cells.length > 0 && cells[0] === '') cells.shift();
        if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
        return cells;
      });

      const headerCells = parsedRows[0] || [];
      const bodyRows = parsedRows.slice(1).filter(row => {
        const joined = row.join('');
        return !joined.match(/^[\s\-:]+$/);
      });

      if (headerCells.length > 0) {
        elements.push(
          <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-xl border border-white/15 glass-card shadow-lg max-w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/20" style={{ background: tableHeaderBg }}>
                  {headerCells.map((h, colIdx) => (
                    <th key={colIdx} className={`p-2.5 font-bold text-[11px] uppercase tracking-wider ${accentColor} break-words`}>
                      {parseInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {bodyRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-white/5 transition-colors">
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="p-2.5 text-white/90 align-top leading-relaxed break-words">
                        {parseInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      } else {
        tableLines.forEach((tLine, i) => {
          elements.push(
            <p key={`table-fallback-b-${elements.length}-${i}`} className="text-xs text-white/90 leading-relaxed my-1 break-words">
              {parseInline(tLine)}
            </p>
          );
        });
      }
      tableLines = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Code Block Toggle ```lang
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${elements.length}`} className="my-3 rounded-xl bg-slate-950 border border-white/15 overflow-hidden max-w-full">
            {codeLang && (
              <div className="px-3 py-1 border-b border-white/10 text-[10px] font-mono text-teal-400 bg-white/5">
                {codeLang}
              </div>
            )}
            <pre className="p-3 font-mono text-[11px] text-teal-200 overflow-x-auto leading-relaxed whitespace-pre-wrap break-words">
              {codeBlockLines.join('\n')}
            </pre>
          </div>
        );
        codeBlockLines = [];
        inCodeBlock = false;
        codeLang = '';
      } else {
        flushList();
        flushTable();
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Check Table Row
    const isTableRow = trimmed.startsWith('|') || (trimmed.endsWith('|') && trimmed.includes('|')) || trimmed.includes('| ---');
    if (isTableRow) {
      flushList();
      tableLines.push(trimmed);
      return;
    } else {
      flushTable();
    }

    // Blank line
    if (!trimmed) {
      flushList();
      elements.push(<div key={`blank-${index}`} className="h-1.5" />);
      return;
    }

    // Line Separators: ===, ---, ***, ___ (Setext underline or HR)
    if (trimmed.match(/^={3,}$/) || trimmed.match(/^-{3,}$/) || trimmed.match(/^\*{3,}$/) || trimmed.match(/^_{3,}$/)) {
      flushList();
      // If previous element was a paragraph, upgrade it to a styled header if applicable
      if (elements.length > 0 && trimmed.match(/^={3,}$/)) {
        const last = elements[elements.length - 1];
        if (React.isValidElement(last) && last.type === 'p') {
          const prevText = (last.props as { children?: React.ReactNode })?.children;
          elements.pop(); // replace last paragraph

          elements.push(
            <h2 key={`setext-h2-${index}`} className={`text-base font-bold mt-3 mb-2 flex items-center gap-2 ${accentColor} border-b border-white/10 pb-1 break-words`} style={{ fontFamily: 'Outfit, sans-serif' }}>
              {prevText}
            </h2>
          );
          return;
        }
      }
      elements.push(<hr key={`hr-${index}`} className={`my-2.5 border-t ${hrColor}`} />);
      return;
    }

    // Blockquote: > text
    if (trimmed.startsWith('> ')) {
      flushList();
      const quoteText = trimmed.slice(2);
      elements.push(
        <blockquote key={`quote-${index}`} className="border-l-2 border-teal-400/60 pl-3 py-1 my-2 bg-teal-500/5 text-white/80 italic rounded-r-lg break-words">
          {parseInline(quoteText)}
        </blockquote>
      );
      return;
    }

    // All Headings: # through ######
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const title = headingMatch[2];

      if (level === 1) {
        elements.push(
          <h1 key={`h1-${index}`} className={`text-lg font-extrabold mt-4 mb-2 ${accentColor} break-words`} style={{ fontFamily: 'Outfit, sans-serif' }}>
            {parseInline(title)}
          </h1>
        );
      } else if (level === 2) {
        elements.push(
          <h2 key={`h2-${index}`} className={`text-base font-bold mt-3.5 mb-2 ${accentColor} break-words`} style={{ fontFamily: 'Outfit, sans-serif' }}>
            {parseInline(title)}
          </h2>
        );
      } else if (level === 3) {
        elements.push(
          <h3 key={`h3-${index}`} className={`text-sm font-bold mt-3 mb-1.5 ${accentColor} break-words`} style={{ fontFamily: 'Outfit, sans-serif' }}>
            {parseInline(title)}
          </h3>
        );
      } else if (level === 4) {
        elements.push(
          <h4 key={`h4-${index}`} className={`text-xs font-bold mt-2.5 mb-1.5 tracking-wide ${accentColor} break-words`} style={{ fontFamily: 'Outfit, sans-serif' }}>
            {parseInline(title)}
          </h4>
        );
      } else {
        elements.push(
          <h5 key={`h5-${index}`} className={`text-xs font-semibold mt-2 mb-1 ${accentColor} break-words`}>
            {parseInline(title)}
          </h5>
        );
      }
      return;
    }

    // Bullet points: * Item, - Item, + Item
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('+ ')) {
      const itemText = trimmed.replace(/^[\*\-\+]\s+/, '');
      listItems.push(
        <li key={`li-${index}`} className="flex items-start gap-2 text-white/90 text-xs leading-relaxed break-words">
          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${bulletBg}`} />
          <span className="flex-1 break-words min-w-0">{parseInline(itemText)}</span>
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
        <li key={`li-${index}`} className="flex items-start gap-2 text-white/90 text-xs leading-relaxed break-words">
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md flex-shrink-0 mt-0.5 ${badgeBg}`}>
            {num}
          </span>
          <span className="flex-1 break-words min-w-0">{parseInline(itemText)}</span>
        </li>
      );
      return;
    }

    // Regular Paragraph line
    flushList();
    elements.push(
      <p key={`p-${index}`} className="text-xs text-white/90 leading-relaxed my-1 break-words">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList();
  flushTable();

  return (
    <div className={`space-y-0.5 text-xs text-white/90 break-words [overflow-wrap:anywhere] max-w-full ${className}`}>
      {elements}
    </div>
  );
}

'use client';
import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 py-6 px-4 bg-slate-950/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
        
        {/* Left Side: Developer Credit & GitHub Logo Link */}
        <div className="flex items-center gap-2.5">
          <a
            href="https://github.com/SamyoPramanik"
            target="_blank"
            rel="noopener noreferrer"
            title="Samyo Pramanik GitHub Profile"
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all transform hover:scale-105"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>

          <span>
            Planned and Developed by{' '}
            <a
              href="https://github.com/SamyoPramanik"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-teal-300 hover:underline hover:text-teal-200 transition-colors"
            >
              Samyo Pramanik
            </a>
          </span>
        </div>

        {/* Center: Repository Source Code Link */}
        <div className="flex items-center gap-2">
          <span className="text-white/40">•</span>
          <a
            href="https://github.com/SamyoPramanik/MediSense-BD"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 text-teal-300 hover:text-teal-200 text-[11px] font-medium transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>MediSense-BD Source Code</span>
          </a>
          <span className="text-white/40">•</span>
        </div>

        {/* Right Side: Contact Email */}
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <a
            href="mailto:samyopramanik2003@gmail.com"
            className="text-white/80 hover:text-rose-300 hover:underline transition-colors font-mono"
          >
            samyopramanik2003@gmail.com
          </a>
        </div>

      </div>
    </footer>
  );
}

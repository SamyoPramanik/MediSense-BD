'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auditApi } from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [filePath, setFilePath] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'API' | 'PAGE_VISIT' | 'ERRORS'>('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await auditApi.getLogs();
      setLogs(data.logs || []);
      setTotalEntries(data.total_entries || 0);
      setFilePath(data.log_file_path || '');
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !search || log.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'API') return log.includes('HTTP') || log.includes('POST') || log.includes('GET');
    if (filter === 'PAGE_VISIT') return log.includes('PAGE_VISIT');
    if (filter === 'ERRORS') return log.includes('Status: 4') || log.includes('Status: 5') || log.includes('Error:');
    return true;
  });

  const downloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medisense_audit_log_${new Date().toISOString().split('T')[0]}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>
            System Audit & Activity Logs
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Real-time HTTP request, user authentication, and page visit audit log stream
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            <span>Refresh Stream</span>
          </button>

          <button
            onClick={downloadLogs}
            className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>Export Log File</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-xl font-bold">
            📊
          </div>
          <div>
            <p className="text-white/40 text-xs font-medium">Total Disk Log Entries</p>
            <p className="text-xl font-bold text-white mt-0.5">{totalEntries.toLocaleString()}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center text-xl font-bold">
            ⚡
          </div>
          <div>
            <p className="text-white/40 text-xs font-medium">Stream Showing</p>
            <p className="text-xl font-bold text-white mt-0.5">{filteredLogs.length} Entries</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl font-bold">
            📁
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white/40 text-xs font-medium">Server Disk File</p>
            <p className="text-xs font-mono text-emerald-300 truncate mt-0.5" title={filePath}>
              {filePath || 'server/logs/activity_audit.log'}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Filters & Search */}
      <GlassCard className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(['ALL', 'API', 'PAGE_VISIT', 'ERRORS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === tab ? 'bg-teal-500 text-slate-950 font-bold shadow-md' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                {tab === 'ALL' && 'All Log Entries'}
                {tab === 'API' && '🔌 HTTP API Calls'}
                {tab === 'PAGE_VISIT' && '👁️ Page Visits'}
                {tab === 'ERRORS' && '⚠️ Errors (4xx/5xx)'}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search IP, User Email, Route..."
              className="glass-input text-xs pl-8 pr-4 py-2 w-full sm:w-64"
            />
            <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </GlassCard>

      {/* Log Terminal Window */}
      <div className="glass-card overflow-hidden border border-white/10 rounded-2xl">
        <div className="px-4 py-3 bg-slate-950/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-mono text-white/50 ml-2">activity_audit.log — Tail Log Stream</span>
          </div>
          <span className="text-[10px] font-mono text-teal-400">Live Auto-Buffered</span>
        </div>

        <div className="p-4 bg-slate-950/95 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[600px] overflow-y-auto space-y-1.5 custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-white/40">Loading system audit log stream...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-white/40">No log entries found matching criteria.</div>
          ) : (
            filteredLogs.map((log, idx) => {
              const isError = log.includes('Status: 4') || log.includes('Status: 5') || log.includes('Error:');
              const isPageVisit = log.includes('PAGE_VISIT');
              const isUser = log.includes('User ID');

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-2 rounded-lg border transition-colors ${
                    isError
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      : isPageVisit
                      ? 'bg-blue-500/10 border-blue-500/20 text-blue-200'
                      : isUser
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                      : 'bg-white/5 border-white/5 text-white/80'
                  }`}
                >
                  {log}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

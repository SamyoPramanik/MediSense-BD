'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auditApi, LightLogItem, FullLogItem } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import GlassCard from '@/components/ui/GlassCard';

export default function AuditLogsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [logs, setLogs] = useState<LightLogItem[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [filePath, setFilePath] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'API' | 'PAGE_VISIT' | 'ERRORS'>('ALL');

  // Inspector Drawer State
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [selectedLogDetail, setSelectedLogDetail] = useState<FullLogItem | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchLogs = async () => {
    if (!isAdmin) return;
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
  }, [isAdmin]);

  const inspectLog = async (id: string) => {
    setSelectedLogId(id);
    setSelectedLogDetail(null);
    setLoadingDetail(true);

    try {
      const detail = await auditApi.getLogDetails(id);
      setSelectedLogDetail(detail);
    } catch (err) {
      console.error('Failed to fetch full log details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <GlassCard className="p-8 space-y-4 border-rose-500/30">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center text-3xl font-bold shadow-lg">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit' }}>
            Access Restricted — Administrator Authorization Required
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-lg mx-auto">
            System activity audit logs and maintenance records are strictly restricted to <strong>Administrator</strong> accounts.
            Regular users and analyst roles do not have permission to view backend server logs.
          </p>
          <div className="pt-2">
            <span className="inline-block text-xs px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
              Current Role: {user ? user.role : 'Guest'}
            </span>
          </div>
        </GlassCard>
      </div>
    );
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      !search ||
      log.url.toLowerCase().includes(search.toLowerCase()) ||
      log.userSummary.toLowerCase().includes(search.toLowerCase()) ||
      log.ip.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'API') return log.type === 'HTTP';
    if (filter === 'PAGE_VISIT') return log.type === 'PAGE_VISIT';
    if (filter === 'ERRORS') return log.status >= 400 || log.hasError;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>
            System Audit & Activity Logs
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Admin console for inspecting lightweight request, response, and page visit audit tables
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <span>Refresh Table</span>
        </button>
      </div>

      {/* Overview Cards */}
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
            <p className="text-white/40 text-xs font-medium">Table Rows Loaded</p>
            <p className="text-xl font-bold text-white mt-0.5">{filteredLogs.length} Records</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl font-bold">
            📁
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white/40 text-xs font-medium">Log File Path</p>
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
              placeholder="Filter by IP, User, Route..."
              className="glass-input text-xs pl-8 pr-4 py-2 w-full sm:w-64"
            />
            <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </GlassCard>

      {/* High-Performance Lightweight Log Table */}
      <div className="glass-card overflow-hidden border border-white/10 rounded-2xl">
        <div className="overflow-x-auto max-h-[560px] custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/15 sticky top-0 z-10" style={{ background: 'rgba(10, 46, 46, 0.95)' }}>
                <th className="p-3 font-bold text-teal-300 uppercase tracking-wider text-[11px]">Timestamp</th>
                <th className="p-3 font-bold text-teal-300 uppercase tracking-wider text-[11px]">Event / Method</th>
                <th className="p-3 font-bold text-teal-300 uppercase tracking-wider text-[11px]">Route URL</th>
                <th className="p-3 font-bold text-teal-300 uppercase tracking-wider text-[11px]">Status</th>
                <th className="p-3 font-bold text-teal-300 uppercase tracking-wider text-[11px]">Latency</th>
                <th className="p-3 font-bold text-teal-300 uppercase tracking-wider text-[11px]">User / IP</th>
                <th className="p-3 font-bold text-teal-300 uppercase tracking-wider text-[11px] text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/40">Loading lightweight audit table...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/40">No audit log records found matching filter.</td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isError = log.status >= 400 || log.hasError;
                  const isPageVisit = log.type === 'PAGE_VISIT';

                  return (
                    <tr
                      key={log.id}
                      onClick={() => inspectLog(log.id)}
                      className="hover:bg-white/10 transition-colors cursor-pointer group"
                    >
                      <td className="p-3 text-white/70 font-mono whitespace-nowrap text-[11px]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                            isPageVisit
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : log.method === 'POST'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          }`}
                        >
                          {isPageVisit ? 'PAGE_VISIT' : log.method}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-white/90 truncate max-w-[200px]" title={log.url}>
                        {log.url}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                            isError
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-white/60">
                        {log.durationMs > 0 ? `${log.durationMs}ms` : '—'}
                      </td>
                      <td className="p-3 text-white/80 font-mono truncate max-w-[180px]">
                        {log.userSummary}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            inspectLog(log.id);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-medium transition-colors"
                        >
                          Details 🔍
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* On-Demand Log Detail Inspector Drawer */}
      <AnimatePresence>
        {selectedLogId && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLogId(null)}>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-slate-900 border-l border-white/10 h-full overflow-y-auto p-6 space-y-6 flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center text-xl font-bold">
                    🔍
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Log Entry Inspector</h2>
                    <p className="text-xs text-white/50 font-mono">ID: {selectedLogId}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedLogId(null)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Content */}
              {loadingDetail ? (
                <div className="flex-1 flex items-center justify-center text-white/40 text-xs">
                  Fetching full payload & log details from server...
                </div>
              ) : selectedLogDetail ? (
                <div className="space-y-5 text-xs">
                  {/* Status & Method Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">Status Code</p>
                      <p className={`text-base font-bold font-mono mt-1 ${selectedLogDetail.status >= 400 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {selectedLogDetail.status} {selectedLogDetail.status >= 400 ? 'Error' : 'OK'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">Execution Latency</p>
                      <p className="text-base font-bold font-mono text-teal-300 mt-1">
                        {selectedLogDetail.durationMs} ms
                      </p>
                    </div>
                  </div>

                  {/* Meta Information */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5 font-mono text-[11px]">
                    <div>
                      <span className="text-white/40">Timestamp:</span>{' '}
                      <span className="text-white">{selectedLogDetail.timestamp}</span>
                    </div>

                    <div>
                      <span className="text-white/40">Request Route:</span>{' '}
                      <span className="text-teal-300 font-bold">{selectedLogDetail.method} {selectedLogDetail.url}</span>
                    </div>

                    <div>
                      <span className="text-white/40">Client IP Address:</span>{' '}
                      <span className="text-white">{selectedLogDetail.ip}</span>
                    </div>

                    <div>
                      <span className="text-white/40">User Identity:</span>{' '}
                      <span className="text-amber-300">{selectedLogDetail.userSummary}</span>
                    </div>

                    {selectedLogDetail.user && (
                      <div className="pt-2 border-t border-white/10 text-[10px] text-white/60 grid grid-cols-2 gap-1">
                        <div>User ID: #{selectedLogDetail.user.id}</div>
                        <div>Role: {selectedLogDetail.user.role}</div>
                        <div>Email: {selectedLogDetail.user.email}</div>
                        <div>Gender: {selectedLogDetail.user.gender}</div>
                      </div>
                    )}
                  </div>

                  {/* User Agent */}
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider">User-Agent Header</p>
                    <p className="font-mono text-[10px] text-white/70 break-all">{selectedLogDetail.userAgent || 'None'}</p>
                  </div>

                  {/* Error Box if present */}
                  {selectedLogDetail.error && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 space-y-1">
                      <p className="text-rose-300 text-[10px] font-bold uppercase tracking-wider">Error Details</p>
                      <p className="font-mono text-xs text-rose-200">{selectedLogDetail.error}</p>
                    </div>
                  )}

                  {/* Request Payload */}
                  <div className="space-y-1">
                    <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">Request Payload</p>
                    {selectedLogDetail.payload ? (
                      <pre className="p-3 rounded-xl bg-slate-950 border border-white/10 font-mono text-[10px] text-teal-200 overflow-x-auto">
                        {JSON.stringify(selectedLogDetail.payload, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-white/40 italic text-[11px]">No body payload provided for this request.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-rose-400 text-xs">
                  Failed to load log details.
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyApi } from '@/lib/api';

type DrugResult = Awaited<ReturnType<typeof verifyApi.drug>>;

export default function DrugScanner() {
  const [barcode, setBarcode] = useState('');
  const [drugName, setDrugName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<DrugResult | null>(null);
  const [mode, setMode] = useState<'barcode' | 'name'>('barcode');

  const scan = async () => {
    if (mode === 'barcode' && !barcode.trim()) return;
    if (mode === 'name' && !drugName.trim()) return;
    setScanning(true);
    setResult(null);

    // Simulate scan delay
    await new Promise(r => setTimeout(r, 2000));

    try {
      const data = await verifyApi.drug(
        mode === 'barcode' ? { barcode: barcode.trim() } : { drug_name: drugName.trim() }
      );
      setResult(data);
    } catch {
      setResult({ found: false, is_authentic: false, confidence: 0, message: 'Verification failed. Try again.' });
    }
    setScanning(false);
  };

  return (
    <div className="glass-card h-full flex flex-col" style={{ minHeight: '500px' }}>
      <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          <span className="text-sm">💊</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Drug Verification</p>
          <p className="text-[10px] text-white/40">DGDA Registry Cross-Reference</p>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          {(['barcode', 'name'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setResult(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${mode === m ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
              style={{ background: mode === m ? 'rgba(255,255,255,0.1)' : 'transparent', border: `1px solid ${mode === m ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
              {m === 'barcode' ? '📷 Barcode' : '🔤 Drug Name'}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="mb-4">
          {mode === 'barcode' ? (
            <input id="barcode-input" value={barcode} onChange={(e) => setBarcode(e.target.value)}
              placeholder="Enter barcode (e.g., 8801016001018)" className="glass-input w-full" onKeyDown={e => e.key === 'Enter' && scan()} />
          ) : (
            <input id="drug-name-input" value={drugName} onChange={(e) => setDrugName(e.target.value)}
              placeholder="Enter drug name (e.g., Napa)" className="glass-input w-full" onKeyDown={e => e.key === 'Enter' && scan()} />
          )}
        </div>

        <button id="scan-button" onClick={scan} disabled={scanning}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all mb-4"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          {scanning ? 'Scanning...' : '🔍 Verify Drug'}
        </button>

        {/* Scanning Animation */}
        <AnimatePresence>
          {scanning && (
            <motion.div className="flex-1 relative rounded-xl overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.03)', minHeight: '120px' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="absolute left-0 right-0 h-0.5"
                style={{ background: 'linear-gradient(90deg, transparent, #14b8a6, transparent)' }}
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <div className="flex items-center justify-center h-full text-white/30 text-sm">
                Scanning DGDA Registry...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Card */}
        <AnimatePresence>
          {result && !scanning && (
            <motion.div
              className="flex-1 rounded-xl p-5 border"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: result.is_authentic ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                borderColor: result.is_authentic ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <div className="text-center mb-4">
                <motion.div className="text-4xl mb-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                  {result.is_authentic ? '✅' : '🚨'}
                </motion.div>
                <p className="text-lg font-bold" style={{ color: result.is_authentic ? '#22c55e' : '#ef4444', fontFamily: 'Outfit' }}>
                  {result.is_authentic ? 'VERIFIED' : 'ANOMALOUS'}
                </p>
                <p className="text-xs text-white/50 mt-1">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
              </div>

              {result.drug && (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-white/40">Brand</span><span className="text-white/80">{result.drug.brand_name}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Generic</span><span className="text-white/80">{result.drug.generic_name}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Manufacturer</span><span className="text-white/80">{result.drug.manufacturer}</span></div>
                  <div className="flex justify-between"><span className="text-white/40">Form</span><span className="text-white/80">{result.drug.dosage_form} — {result.drug.strength}</span></div>
                </div>
              )}

              <p className="text-xs text-white/60 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>{result.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

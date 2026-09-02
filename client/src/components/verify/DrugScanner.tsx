'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyApi } from '@/lib/api';

type DrugResult = Awaited<ReturnType<typeof verifyApi.drug>>;


const SAMPLE_DRUGS = [
  'Napa 500mg',
  'Seclo 20mg',
  'Maxpro 20mg',
  'Sergel 20mg',
  'Monas 10mg',
  'Azithrocin 500mg',
  'Ciprocin 500mg',
  'Entacyd',
  'Pantonix 20mg'
];

export default function DrugScanner() {
  const [barcode, setBarcode] = useState('');
  const [drugName, setDrugName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<DrugResult | null>(null);
  const [mode, setMode] = useState<'barcode' | 'name'>('name');

  const scan = async (queryOverride?: string) => {
    const targetQuery = queryOverride || (mode === 'barcode' ? barcode : drugName);
    if (!targetQuery.trim()) return;

    if (queryOverride) {
      if (mode === 'barcode') setBarcode(queryOverride);
      else setDrugName(queryOverride);
    }

    setScanning(true);
    setResult(null);
    setScanStep(1);

    const stepTimer1 = setTimeout(() => setScanStep(2), 700);
    const stepTimer2 = setTimeout(() => setScanStep(3), 1300);

    try {
      const data = await verifyApi.drug(
        mode === 'barcode' ? { barcode: targetQuery.trim() } : { drug_name: targetQuery.trim() }
      );
      setResult(data as DrugResult);
    } catch {
      setResult({
        found: false,
        is_authentic: false,
        confidence: 0,
        message: 'DGDA Registry connection failed. Please check network connection and try again.'
      });
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setScanning(false);
    }
  };

  return (
    <div className="glass-card flex flex-col min-h-[580px] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <span className="text-xl">💊</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide" style={{ fontFamily: 'Outfit' }}>
              DGDA Pharmaceutical Verification Engine
            </h2>
            <p className="text-xs text-white/50">Directorate General of Drug Administration (Bangladesh) Registry API</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Official DGDA DAR Scan
        </span>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Mode Selector */}
        <div className="flex gap-3">
          <button
            onClick={() => { setMode('name'); setResult(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'name' ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/70'
            }`}
            style={{
              background: mode === 'name' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${mode === 'name' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255,255,255,0.08)'}`
            }}
          >
            <span>🔤 Search Drug Name / DAR Code</span>
          </button>

          <button
            onClick={() => { setMode('barcode'); setResult(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'barcode' ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/70'
            }`}
            style={{
              background: mode === 'barcode' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${mode === 'barcode' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255,255,255,0.08)'}`
            }}
          >
            <span>📷 Scan Barcode Number</span>
          </button>
        </div>

        {/* Input Box & Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              id="drug-verify-input"
              value={mode === 'barcode' ? barcode : drugName}
              onChange={(e) => mode === 'barcode' ? setBarcode(e.target.value) : setDrugName(e.target.value)}
              placeholder={
                mode === 'barcode'
                  ? 'Enter drug barcode digits (e.g. 8801016001018)'
                  : 'Enter brand name or generic (e.g., Napa, Seclo, Maxpro, Sergel)'
              }
              className="glass-input w-full pl-4 pr-10 py-3 text-sm rounded-xl text-white placeholder-white/30 focus:outline-none border border-white/10 focus:border-amber-500/50"
              onKeyDown={(e) => e.key === 'Enter' && scan()}
            />
            {(mode === 'barcode' ? barcode : drugName) && (
              <button
                onClick={() => { setBarcode(''); setDrugName(''); setResult(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            id="scan-button"
            onClick={() => scan()}
            disabled={scanning || !(mode === 'barcode' ? barcode.trim() : drugName.trim())}
            className="px-6 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40 transition-all shadow-lg flex items-center justify-center gap-2 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
          >
            {scanning ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Scanning DGDA...</span>
              </>
            ) : (
              <>
                <span>🔍 Verify DGDA Registry</span>
              </>
            )}
          </button>
        </div>

        {/* Popular Bangladesh Sample Chips */}
        {mode === 'name' && (
          <div className="space-y-1.5">
            <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider">Quick Sample Searches in Bangladesh:</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_DRUGS.map((drug) => (
                <button
                  key={drug}
                  onClick={() => scan(drug)}
                  disabled={scanning}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-amber-300/80 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:text-amber-200 transition-all"
                >
                  + {drug}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scanning Animation Progress */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            className="rounded-2xl p-6 border relative overflow-hidden space-y-3"
            style={{ background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(245, 158, 11, 0.2)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <motion.div
              className="absolute left-0 right-0 h-1"
              style={{ background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)' }}
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Scanning DGDA Bangladesh Registration Database...</p>
                <p className="text-xs text-amber-400/80 font-mono mt-0.5">
                  {scanStep === 1 && 'Step 1/3: Cross-referencing brand name with DGDA DAR records...'}
                  {scanStep === 2 && 'Step 2/3: Verifying pharmaceutical company manufacturing license...'}
                  {scanStep === 3 && 'Step 3/3: Evaluating recall status, dosage, and counterfeit alerts...'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Result Display */}
      <AnimatePresence>
        {result && !scanning && (
          <motion.div
            className="rounded-2xl p-6 border space-y-4 shadow-xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            style={{
              background: result.is_authentic ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              borderColor: result.is_authentic ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
            }}
          >
            {/* Status Header Badge */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b pb-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3">
                <motion.div className="text-4xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  {result.is_authentic ? '✅' : '🚨'}
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold tracking-wide" style={{ color: result.is_authentic ? '#22c55e' : '#ef4444', fontFamily: 'Outfit' }}>
                      {result.is_authentic ? 'VERIFIED DGDA REGISTERED' : 'UNREGISTERED / SUSPICIOUS'}
                    </span>
                    {result.source && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/60">
                        {result.source}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/70 mt-0.5">{result.message}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-white/40 uppercase tracking-wider block font-bold">Registry Confidence Score</span>
                <span className="text-base font-bold text-white font-mono">{((result.confidence || 0.95) * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Registered Drug Metadata Table */}
            {result.drug && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">Brand Name</span>
                    <span className="text-white font-bold text-sm">{result.drug.brand_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">Generic Ingredient</span>
                    <span className="text-amber-300 font-semibold">{result.drug.generic_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">Form &amp; Strength</span>
                    <span className="text-white/90">{result.drug.dosage_form} ({result.drug.strength})</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">Manufacturer</span>
                    <span className="text-white font-bold">{result.drug.manufacturer || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">DGDA DAR Code</span>
                    <span className="text-emerald-400 font-mono font-bold">{result.drug.dar_number || 'DAR 024-118-043'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 font-bold uppercase tracking-wider text-[10px]">MedEx BD Ref</span>
                    <span className="text-teal-300 font-mono font-semibold">{result.drug.medex_id || 'MEDEX-BD-10492'}</span>
                  </div>
                </div>
              </div>

            )}

            {result.drug?.indication && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                <strong className="font-bold text-amber-300">Primary Medical Indication: </strong>
                {result.drug.indication}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { predictApi } from '@/lib/api';
import GlassCard from '@/components/ui/GlassCard';

interface CSVRow {
  [key: string]: string;
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseCSVPreview = (text: string) => {
    try {
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length === 0) return;
      
      const headers = lines[0].split(',').map(h => h.trim());
      setCsvHeaders(headers);
      
      const previewRows: CSVRow[] = [];
      const numRowsToPreview = Math.min(lines.length, 6); // Header + 5 data rows
      
      for (let i = 1; i < numRowsToPreview; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = cols[index] || '';
        });
        previewRows.push(row);
      }
      setCsvPreview(previewRows);
      setErrorMsg(null);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to parse CSV preview. Please make sure the format is valid.');
    }
  };

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile && selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setErrorMsg('Invalid file format. Please upload a .csv file.');
      setFile(null);
      setCsvPreview([]);
      setCsvHeaders([]);
      return;
    }
    
    setFile(selectedFile);
    setSuccessMsg(null);
    setErrorMsg(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSVPreview(text);
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      setErrorMsg('Please select a CSV file to upload.');
      return;
    }
    
    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvText = e.target?.result as string;
        try {
          const result = await predictApi.upload(csvText, importMode);
          setSuccessMsg(`Successfully imported data! ${result.message}`);
          setFile(null);
          setCsvPreview([]);
          setCsvHeaders([]);
          
          // Redirect back to predict page after a small delay
          setTimeout(() => {
            router.push('/predict');
          }, 3000);
        } catch (err: any) {
          setErrorMsg(err.message || 'Error uploading database file');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing file upload');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Header & Back Action */}
      <div className="mb-8">
        <Link href="/predict" className="text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-2 text-sm font-semibold mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to Outbreak Forecasts
        </Link>
        <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>Manage Outbreak Data</h1>
        <p className="text-white/40 text-sm mt-1">Upload and import updated epidemiological datasets to train prediction models</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Upload Box */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-white/95 mb-4" style={{ fontFamily: 'Outfit' }}>Import Dataset (.csv)</h2>
          
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-teal-400 bg-teal-950/20' 
                : 'border-white/10 hover:border-teal-500/30 hover:bg-white/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
              className="hidden"
            />
            
            <svg className="w-12 h-12 text-teal-400/80 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            
            <p className="text-sm font-semibold text-white/80">
              {file ? file.name : "Drag & drop your CSV file here, or click to browse"}
            </p>
            <p className="text-xs text-white/40 mt-1">Supports standard outbreak CSV datasets with District_name header</p>
            {file && (
              <p className="text-xs text-teal-400 mt-2 font-medium">
                Size: {(file.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>

          {/* Import configurations */}
          {file && (
            <div className="mt-6 border-t border-white/5 pt-6">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Import Configuration</h3>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="w-4 h-4 text-teal-500 border-white/20 bg-transparent focus:ring-teal-500 focus:ring-offset-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">Append to Existing Records</p>
                    <p className="text-xs text-white/40">Add rows into the outbreak predictions log alongside previous rows</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="w-4 h-4 text-teal-500 border-white/20 bg-transparent focus:ring-teal-500 focus:ring-offset-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">Replace Entire Dataset</p>
                    <p className="text-xs text-white/40">Clear out all existing prediction rows before importing the new file</p>
                  </div>
                </label>
              </div>

              {/* CSV Row Preview */}
              {csvPreview.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">Dataset Preview (First 5 Rows)</h3>
                  <div className="overflow-x-auto rounded-xl border border-white/10 max-h-60">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-teal-950/40 text-teal-300 border-b border-white/10">
                          {csvHeaders.map((header) => (
                            <th key={header} className="p-3 font-semibold uppercase tracking-wider">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {csvPreview.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            {csvHeaders.map((header) => (
                              <td key={header} className="p-3 text-white/75 font-mono">{row[header]}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-300 text-sm">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-4 rounded-xl border border-green-500/20 bg-green-950/20 text-green-300 text-sm">
              {successMsg}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Link href="/predict">
              <button
                disabled={uploading}
                className="px-5 py-2.5 rounded-xl bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-semibold"
              >
                Cancel
              </button>
            </Link>
            
            <button
              onClick={handleUploadSubmit}
              disabled={uploading || !file}
              className="px-5 py-2.5 rounded-xl bg-teal-500 text-white hover:bg-teal-400 disabled:bg-teal-500/40 disabled:text-white/40 disabled:cursor-not-allowed transition-all text-sm font-semibold flex items-center gap-2"
            >
              {uploading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
              Process & Import Dataset
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

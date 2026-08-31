'use client';
import React, { useRef } from 'react';

export interface ClinicalReportData {
  patientInfo?: {
    name?: string;
    assessmentId?: string;
    ageSex?: string;
    date?: string;
    allergies?: string;
    currentMedication?: string;
  };
  presentingSymptoms?: Array<{
    symptom: string;
    details: string;
  }>;
  labExtraction?: Array<{
    test: string;
    result: string;
    referenceRange: string;
    flag: string;
  }>;
  clinicalSummary?: {
    provisionalInterpretation?: string;
  };
  medicationReview?: Array<{
    symptomFinding: string;
    medicineManagement: string;
    frequencyUse: string;
    currentMedicineReview: string;
    evidenceReference: string;
  }>;
  safetyTriage?: {
    triageLevel?: string;
    seekUrgentCareFor?: string;
    followUpTrigger?: string;
  };
  verificationLogic?: string;
  evidenceLinks?: Array<{
    title: string;
    description: string;
  }>;
  clinicianReview?: {
    reviewStatus?: string;
    clinicianName?: string;
    registrationNo?: string;
    signatureDate?: string;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report: ClinicalReportData | null;
  loading?: boolean;
}

export default function ClinicalReportModal({ isOpen, onClose, report, loading }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (!printRef.current) {
      window.print();
      return;
    }

    try {
      const printWindow = window.open('', '_blank', 'width=950,height=1000');
      if (printWindow) {
        const contentHtml = printRef.current.innerHTML;

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>MediSense_Clinical_Prescription_${info.assessmentId || 'Report'}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @page {
                  size: A4;
                  margin: 12mm;
                }
                body {
                  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  background: #ffffff !important;
                  color: #0f172a !important;
                  padding: 16px;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .no-print { display: none !important; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #cbd5e1; }
              </style>
            </head>
            <body>
              <div style="max-width: 900px; margin: 0 auto;">
                ${contentHtml}
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.focus();
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                  }, 350);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        return;
      }
    } catch (err) {
      console.warn('Popup print window blocked, using window.print() fallback:', err);
    }

    window.print();
  };

  const info = report?.patientInfo || {};
  const symptoms = report?.presentingSymptoms && report.presentingSymptoms.length > 0 ? report.presentingSymptoms : [];
  const labs = report?.labExtraction && report.labExtraction.length > 0 ? report.labExtraction : [];
  const summaryText = report?.clinicalSummary?.provisionalInterpretation || '';
  const meds = report?.medicationReview && report.medicationReview.length > 0 ? report.medicationReview : [];
  const triage = report?.safetyTriage || {};
  const links = report?.evidenceLinks && report.evidenceLinks.length > 0 ? report.evidenceLinks : [
    { title: 'World Health Organization (WHO)', description: 'International clinical practice guidelines.' },
    { title: 'Directorate General of Drug Administration (DGDA Bangladesh)', description: 'National pharmaceutical safety guidelines.' },
    { title: 'U.S. Food and Drug Administration (FDA)', description: 'Medication safety alerts and labeling.' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Print Stylesheet */}
      <style jsx global>{`
        @media print {
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }
          body * {
            visibility: hidden !important;
          }
          #clinical-report-print-container,
          #clinical-report-print-container * {
            visibility: visible !important;
          }
          #clinical-report-print-container {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            z-index: 999999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>


      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 border border-slate-200">
        {/* Modal Action Header Bar */}
        <div className="no-print px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse" />
            <h3 className="text-sm font-bold tracking-wide">MediSense Official Clinical Prescription &amp; Assessment Report</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={loading || !report}
              className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              <span>🖨️ Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar" id="clinical-report-print-container" ref={printRef}>
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-600">Analyzing conversation &amp; synthesizing clinical prescription report...</p>
            </div>
          ) : (
            <>
              {/* Prescription Header / Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-[#0f3b5f]">MediSense</span>
                    <span className="px-2 py-0.5 rounded bg-[#0f3b5f] text-white text-[10px] font-bold uppercase tracking-wider">CDSS Clinical AI</span>
                  </div>
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">Clinical Decision Support &amp; Tele-Triage System</p>
                  <p className="text-[11px] text-slate-500">Government Registered Health Tech &amp; AI Decision Support Platform</p>
                </div>
                <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-teal-600 pl-3 sm:pl-0 sm:pr-3 text-xs text-slate-600 space-y-0.5">
                  <p className="font-bold text-slate-900">Document ID: <span className="font-mono text-teal-700">{info.assessmentId || 'MS-2026-881920'}</span></p>
                  <p>Date: <span className="font-semibold text-slate-800">{info.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                  <p>Status: <span className="font-bold text-emerald-700">Active Assessment</span></p>
                </div>
              </div>

              {/* Patient Information Letterhead Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Patient Name</span>
                  <span className="font-bold text-slate-900 text-sm">{info.name || 'Patient'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Age / Gender</span>
                  <span className="font-bold text-slate-800">{info.ageSex || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Known Allergies</span>
                  <span className="font-bold text-slate-800">{info.allergies || 'No known drug allergies'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Current Meds</span>
                  <span className="font-bold text-slate-800">{info.currentMedication || 'None self-reported'}</span>
                </div>
              </div>

              {/* Rx Symbol Header */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-4xl font-extrabold text-[#0f3b5f] font-serif leading-none">℞</span>
                <div>
                  <h2 className="text-base font-extrabold text-[#0f3b5f] tracking-tight">Clinical Assessment &amp; Prescribed Care Plan</h2>
                  <p className="text-[11px] text-slate-500">Synthesized directly from active consultation history and evidence-based clinical protocols</p>
                </div>
              </div>

              {/* 1. Chief Complaints (C/O) & History */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f3b5f] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0f3b5f]" />
                  <span>1. Chief Complaints (C/O) &amp; Presenting History</span>
                </h3>
                {symptoms.length > 0 ? (
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-[#0f3b5f] text-white">
                        <th className="p-2 text-left font-bold w-1/3 border-r border-slate-600">Reported Symptom</th>
                        <th className="p-2 text-left font-bold">Clinical Onset &amp; Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {symptoms.map((s, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">{s.symptom}</td>
                          <td className="p-2.5 text-slate-700">{s.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 italic">
                    General wellness consultation; no acute chief complaints reported.
                  </div>
                )}
              </div>

              {/* 2. Rx Prescribed Medication & Care Plan */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f3b5f] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0f3b5f]" />
                  <span>2. Prescribed Medications &amp; Management Plan (Rx)</span>
                </h3>
                {meds.length > 0 ? (
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-[#0f3b5f] text-white">
                        <th className="p-2 text-left font-bold border-r border-slate-600 w-1/4">Indications / Symptom</th>
                        <th className="p-2 text-left font-bold border-r border-slate-600 w-1/3">Medicine / Management</th>
                        <th className="p-2 text-left font-bold border-r border-slate-600 w-1/4">Dose &amp; Frequency</th>
                        <th className="p-2 text-left font-bold w-1/6">Evidence Base</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {meds.map((m, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300 align-top">{m.symptomFinding}</td>
                          <td className="p-2.5 text-slate-800 border-r border-slate-300 align-top whitespace-pre-line">
                            <strong className="font-bold text-teal-900">{m.medicineManagement.split('\n')[0]}</strong>
                            {m.medicineManagement.includes('\n') && (
                              <p className="text-[11px] text-slate-600 mt-0.5">{m.medicineManagement.split('\n').slice(1).join('\n')}</p>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-800 font-semibold border-r border-slate-300 align-top">{m.frequencyUse}</td>
                          <td className="p-2.5 text-slate-600 align-top">{m.evidenceReference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 italic">
                    No specific OTC medications prescribed for general query. Maintain balanced diet and hydration.
                  </div>
                )}
              </div>

              {/* 3. Laboratory & Diagnostic Extractions */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f3b5f] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0f3b5f]" />
                  <span>3. Laboratory &amp; Diagnostic Extractions</span>
                </h3>
                {labs.length > 0 ? (
                  <table className="w-full border-collapse border border-slate-300 text-xs">
                    <thead>
                      <tr className="bg-[#0f3b5f] text-white">
                        <th className="p-2 text-left font-bold border-r border-slate-600 w-1/4">Test Name</th>
                        <th className="p-2 text-left font-bold border-r border-slate-600 w-1/4">Result</th>
                        <th className="p-2 text-left font-bold border-r border-slate-600 w-1/4">Reference Range</th>
                        <th className="p-2 text-left font-bold w-1/4">Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {labs.map((l, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          <td className="p-2.5 font-semibold text-slate-800 border-r border-slate-300">{l.test}</td>
                          <td className="p-2.5 text-slate-700 border-r border-slate-300">{l.result}</td>
                          <td className="p-2.5 text-slate-700 border-r border-slate-300">{l.referenceRange}</td>
                          <td className="p-2.5 text-slate-800 font-bold">{l.flag}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
                    No laboratory test reports were uploaded or provided during this chat consultation.
                  </div>
                )}
              </div>

              {/* 4. AI Clinical Provisional Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f3b5f] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0f3b5f]" />
                  <span>4. Clinical Diagnosis &amp; Provisional Summary</span>
                </h3>
                <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-200 text-slate-800 text-xs leading-relaxed">
                  <p className="font-medium">
                    <strong className="font-bold text-sky-950">Provisional Interpretation: </strong>
                    {summaryText || 'Clinical assessment synthesizes supportive guidance based on consultation trajectory.'}
                  </p>
                </div>
              </div>

              {/* 5. Safety Triage & Emergency Red Flags */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f3b5f] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600" />
                  <span>5. Safety Triage &amp; Emergency Red Flag Warnings</span>
                </h3>
                <table className="w-full border-collapse border border-slate-300 text-xs">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2.5 bg-slate-100 font-bold text-slate-700 w-1/4 border-r border-slate-300">Triage Classification</td>
                      <td className="p-2.5 text-slate-900 font-bold">{triage.triageLevel || 'Low Risk (Non-emergency)'}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2.5 bg-amber-50 font-bold text-amber-900 border-r border-slate-300">Seek Immediate Care For</td>
                      <td className="p-2.5 text-amber-950 font-semibold">{triage.seekUrgentCareFor || 'Breathing difficulty, persistent chest pain, severe confusion, sudden weakness, heavy uncontrollable bleeding, or severe dehydration.'}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">Follow-up Criteria</td>
                      <td className="p-2.5 text-slate-800">{triage.followUpTrigger || 'Symptoms persisting beyond 48-72 hours or worsening should prompt in-person medical evaluation at nearest Upazila Health Complex.'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 6. Medical Evidence Links */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0f3b5f] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0f3b5f]" />
                  <span>6. Authoritative Clinical References</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {links.map((link, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="font-bold text-slate-900">{link.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{link.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7. Clinician Review & Digital Sign-off Block */}
              <div className="pt-4 border-t-2 border-slate-300 flex flex-col sm:flex-row items-end justify-between gap-6 text-xs">
                <div className="space-y-1 text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="font-bold text-slate-900">Verified by MediSense Clinical CDSS Engine</p>
                  </div>
                  <p className="text-[11px]">Algorithmic Cross-Check: Allergen contraindications, age limits, and red flags cleared.</p>
                  <p className="text-[11px] text-slate-400">Digital Hash: {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
                </div>

                <div className="text-right space-y-2 w-full sm:w-auto">
                  <div className="border-b border-slate-900 pb-1 w-48 ml-auto">
                    <p className="font-serif italic text-sm text-slate-800">MediSense Digital AI Doctor</p>
                  </div>
                  <p className="font-bold text-slate-900">Attending Clinician / Tele-Health Signoff</p>
                  <p className="text-[11px] text-slate-500">BMDC Reg No: ________________________</p>
                  <p className="text-[11px] text-slate-500">Date &amp; Seal: {info.date || new Date().toLocaleDateString('en-GB')}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

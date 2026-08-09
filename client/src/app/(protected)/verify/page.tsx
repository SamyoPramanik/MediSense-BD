'use client';
import TriageChat from '@/components/verify/TriageChat';
import DrugScanner from '@/components/verify/DrugScanner';

export default function VerifyPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>Triage & Verification</h1>
        <p className="text-white/40 text-sm mt-1">AI-powered Bengali symptom triage and DGDA drug authenticity checking</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TriageChat />
        <DrugScanner />
      </div>

    </div>
  );
}

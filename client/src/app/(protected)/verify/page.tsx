'use client';
import TriageChat from '@/components/verify/TriageChat';

export default function AiDoctorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>AI Doctor Triage</h1>
        <p className="text-white/40 text-sm mt-1">AI-powered Bengali symptom triage, confidential medical counseling, and clinical decision support</p>
      </div>

      <div className="w-full">
        <TriageChat />
      </div>
    </div>
  );
}

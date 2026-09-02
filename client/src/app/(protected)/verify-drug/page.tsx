'use client';
import DrugScanner from '@/components/verify/DrugScanner';

export default function VerifyDrugPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Outfit' }}>DGDA Drug Verification</h1>
        <p className="text-white/40 text-sm mt-1">Verify pharmaceutical registration numbers (DAR/MA), DGDA Bangladesh authenticity, manufacturer details, and safety data</p>
      </div>

      <div className="w-full">
        <DrugScanner />
      </div>
    </div>
  );
}

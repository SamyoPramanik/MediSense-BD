'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Prediction {
  disease: string;
  predicted_date: string;
  predicted_cases: number;
  actual_cases: number | null;
  probability: number;
}

export default function ForecastChart({ predictions }: { predictions: Prediction[] }) {
  const diseases = ["Dengue", "Diarrhea", "Influenza", "Typhoid"];
  const [activeDisease, setActiveDisease] = useState<string>("Dengue");

  // Filter predictions for the active disease
  const filteredPredictions = predictions.filter(p => p.disease === activeDisease);

  const data = filteredPredictions.map((p) => ({
    date: new Date(p.predicted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rawDate: p.predicted_date,
    predicted: p.predicted_cases,
    actual: p.actual_cases,
  })).sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

  if (predictions.length === 0) {
    return <div className="glass-card !p-8 text-center text-white/40 text-sm">No forecast data available</div>;
  }

  return (
    <div className="space-y-4">
      {/* Tab Selector */}
      <div className="flex gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
        {diseases.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDisease(d)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeDisease === d
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card !p-4">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} label={{ value: 'Cases', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)', fontSize: 11, offset: 0 }} />
            <Tooltip contentStyle={{ background: 'rgba(10,46,46,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }} />
            <Line
              type="monotone"
              dataKey="predicted"
              name="Predicted Cases"
              stroke="#14b8a6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual Cases (IEDCR)"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ fill: '#f59e0b', r: 3 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

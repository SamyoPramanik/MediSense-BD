'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';

interface Prediction {
  disease: string;
  predicted_date: string;
  predicted_cases: number;
  actual_cases: number | null;
  probability: number;
}

export default function ForecastChart({ predictions }: { predictions: Prediction[] }) {
  const data = predictions.map((p) => ({
    date: new Date(p.predicted_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    predicted: p.predicted_cases,
    actual: p.actual_cases,
    probability: Math.round(p.probability * 100),
  }));

  if (data.length === 0) {
    return <div className="glass-card !p-8 text-center text-white/40 text-sm">No forecast data available</div>;
  }

  return (
    <div className="glass-card !p-4">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="predictGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
          <Tooltip contentStyle={{ background: 'rgba(10,46,46,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }} />
          <Area type="monotone" dataKey="predicted" name="Predicted" stroke="#14b8a6" fill="url(#predictGrad)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="actual" name="Actual (IEDCR)" stroke="#f59e0b" fill="url(#actualGrad)" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
